using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PolishFireGreen {
  static int I(int x, int y, int s) { return y * s + x * 4; }
  static int Clamp(int v) { return v < 0 ? 0 : (v > 255 ? 255 : v); }
  static int ClampD(double v) { return Clamp((int)Math.Round(v)); }

  static bool ZoneGreen(int x, int y, int w, int h) {
    // Top-right leaf — avoid diamond body
    return x >= (int)(w * 0.58) && y <= (int)(h * 0.42);
  }

  static bool ZoneFire(int x, int y, int w, int h) {
    // Bottom-right fire — avoid diamond body
    return x >= (int)(w * 0.58) && y >= (int)(h * 0.56);
  }

  static int Chroma(byte r, byte g, byte b) {
    int mx = Math.Max(r, Math.Max(g, b));
    int mn = Math.Min(r, Math.Min(g, b));
    return mx - mn;
  }

  static int Lum(byte r, byte g, byte b) {
    return (r * 30 + g * 59 + b * 11) / 100;
  }

  // True green leaf body
  static bool IsGreenBody(byte r, byte g, byte b, byte a) {
    if (a < 60) return false;
    return g >= 95 && g > r + 8 && g > b + 5 && Chroma(r, g, b) >= 18;
  }

  // True fire body including yellow core
  static bool IsFireBody(byte r, byte g, byte b, byte a) {
    if (a < 60) return false;
    // orange / red flame
    if (r >= 110 && r > b + 20 && r >= g - 5 && Chroma(r, g, b) >= 20) return true;
    // yellow hot core
    if (r >= 180 && g >= 130 && b <= 160 && r + g > b * 3) return true;
    return false;
  }

  static bool IsPaleJunk(byte r, byte g, byte b, byte a) {
    if (a < 8) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    // Classic white/gray halo
    if (l >= 165 && c <= 40) return true;
    if (l >= 145 && c <= 22) return true;
    // Muddy desaturated fringe
    if (l >= 130 && c <= 16) return true;
    return false;
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var gfx = Graphics.FromImage(bmp)) gfx.DrawImage(src, 0, 0, w, h);

      var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      byte[] outPx = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);
      Buffer.BlockCopy(px, 0, outPx, 0, px.Length);

      bool[] keep = new bool[w * h];

      // Mark keep mask for green / fire bodies
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int i = I(x, y, stride);
          byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (ZoneGreen(x, y, w, h) && IsGreenBody(r, g, b, a)) keep[y * w + x] = true;
          if (ZoneFire(x, y, w, h) && IsFireBody(r, g, b, a)) keep[y * w + x] = true;
        }
      }

      // Dilate keep mask by 1px so we don't chew crisp edges too hard
      bool[] keep2 = new bool[w * h];
      Array.Copy(keep, keep2, keep.Length);
      for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
          if (!ZoneGreen(x, y, w, h) && !ZoneFire(x, y, w, h)) continue;
          if (keep[y * w + x]) continue;
          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              if (keep[(y + dy) * w + (x + dx)]) {
                int i = I(x, y, stride);
                byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
                // Only dilate onto colored (non-pale) pixels
                if (a > 80 && !IsPaleJunk(r, g, b, a) && Chroma(r, g, b) >= 14) {
                  keep2[y * w + x] = true;
                }
              }
            }
          }
        }
      }
      keep = keep2;

      // In zones: wipe anything not on keep mask (esp pale halos)
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          bool zg = ZoneGreen(x, y, w, h);
          bool zf = ZoneFire(x, y, w, h);
          if (!zg && !zf) continue;

          int idx = y * w + x;
          int i = I(x, y, stride);
          byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (a < 8) continue;

          if (keep[idx]) continue;

          // Outside keep: remove pale junk always; remove weak leftovers near clear/keep
          if (IsPaleJunk(r, g, b, a)) {
            outPx[i] = 0; outPx[i + 1] = 0; outPx[i + 2] = 0; outPx[i + 3] = 0;
            continue;
          }

          int nearKeep = 0, nearClear = 0;
          for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
              int nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearClear++; continue; }
              if (keep[ny * w + nx]) nearKeep++;
              if (px[I(nx, ny, stride) + 3] < 40) nearClear++;
            }
          }

          // Soft smudges near edges
          if (a < 200 || Chroma(r, g, b) < 20 || Lum(r, g, b) > 170) {
            if (nearKeep >= 1 || nearClear >= 4) {
              outPx[i + 3] = 0;
            }
          }
        }
      }

      // Second wipe pass using updated alpha
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int iter = 0; iter < 4; iter++) {
        Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
        for (int y = 1; y < h - 1; y++) {
          for (int x = 1; x < w - 1; x++) {
            if (!ZoneGreen(x, y, w, h) && !ZoneFire(x, y, w, h)) continue;
            int i = I(x, y, stride);
            byte a = px[i + 3];
            if (a < 8) continue;
            byte b = px[i], g = px[i + 1], r = px[i + 2];

            if (keep[y * w + x] && !IsPaleJunk(r, g, b, a)) continue;

            int clearN = 0;
            for (int dy = -1; dy <= 1; dy++)
              for (int dx = -1; dx <= 1; dx++)
                if (px[I(x + dx, y + dy, stride) + 3] < 40) clearN++;

            if (IsPaleJunk(r, g, b, a) && clearN >= 1) {
              outPx[i + 3] = 0;
            } else if (!keep[y * w + x] && clearN >= 2 && (IsPaleJunk(r, g, b, a) || a < 180)) {
              outPx[i + 3] = 0;
            }
          }
        }
      }

      // Crisp alpha + vibrancy on keep pixels
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!ZoneGreen(x, y, w, h) && !ZoneFire(x, y, w, h)) continue;
          int i = I(x, y, stride);
          byte a = px[i + 3];
          if (a < 8) continue;
          byte b = px[i], g = px[i + 1], r = px[i + 2];

          if (!keep[y * w + x]) {
            // Anything still visible that isn't keep → kill if pale/weak
            if (IsPaleJunk(r, g, b, a) || a < 170) outPx[i + 3] = 0;
            continue;
          }

          if (a < 110) { outPx[i + 3] = 0; continue; }
          outPx[i + 3] = 255;

          if (ZoneGreen(x, y, w, h)) {
            double nr = r, ng = g, nb = b;
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.55;
            ng = avg + (ng - avg) * 1.85;
            nb = avg + (nb - avg) * 1.15;
            ng = Math.Min(255, ng * 1.18 + 16);
            nr = Math.Min(255, nr * 0.85 + 3);
            nb = Math.Min(255, nb * 0.88 + 8);
            if (ng > 140) { ng = Math.Min(255, ng + 14); nr = Math.Min(255, nr + 5); }
            outPx[i] = (byte)ClampD(nb);
            outPx[i + 1] = (byte)ClampD(ng);
            outPx[i + 2] = (byte)ClampD(nr);
          } else {
            double nr = r, ng = g, nb = b;
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.7;
            ng = avg + (ng - avg) * 1.5;
            nb = avg + (nb - avg) * 0.65;
            nr = Math.Min(255, nr * 1.2 + 18);
            ng = Math.Min(255, ng * 1.14 + 12);
            nb = Math.Min(255, nb * 0.78);
            // Yellow core glow
            if (nr > 185 && ng > 120) {
              nr = Math.Min(255, nr + 10);
              ng = Math.Min(255, ng + 22);
            }
            // Outer orange punch
            if (nr > 150 && ng < 170) {
              nr = Math.Min(255, nr + 16);
            }
            outPx[i] = (byte)ClampD(nb);
            outPx[i + 1] = (byte)ClampD(ng);
            outPx[i + 2] = (byte)ClampD(nr);
          }
        }
      }

      // Edge glow: strengthen pixels bordering transparency
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
          if (!keep[y * w + x]) continue;
          if (!ZoneGreen(x, y, w, h) && !ZoneFire(x, y, w, h)) continue;
          int i = I(x, y, stride);
          if (px[i + 3] < 200) continue;

          int clearN = 0;
          for (int dy = -1; dy <= 1; dy++)
            for (int dx = -1; dx <= 1; dx++)
              if (px[I(x + dx, y + dy, stride) + 3] < 40) clearN++;

          if (clearN < 2) continue;
          byte r = px[i + 2], g = px[i + 1], b = px[i];
          if (ZoneGreen(x, y, w, h)) {
            outPx[i + 1] = (byte)Clamp(g + 22);
            outPx[i + 2] = (byte)Clamp(r + 8);
            outPx[i] = (byte)Clamp(b + 10);
          } else {
            outPx[i + 2] = (byte)Clamp(r + 26);
            outPx[i + 1] = (byte)Clamp(g + 18);
            outPx[i] = (byte)Clamp(b - 2);
          }
        }
      }

      Marshal.Copy(outPx, 0, data.Scan0, outPx.Length);
      bmp.UnlockBits(data);
      bmp.Save(dstPath, ImageFormat.Png);
      bmp.Dispose();
    }
  }
}
