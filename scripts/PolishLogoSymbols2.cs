using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PolishLogoSymbols2 {
  static int Idx(int x, int y, int stride) { return y * stride + x * 4; }

  static bool InTopRight(int x, int y, int w, int h) {
    return x > (int)(w * 0.55) && y < (int)(h * 0.46) && !(x < (int)(w * 0.62) && y > (int)(h * 0.28));
  }

  static bool InBottomRight(int x, int y, int w, int h) {
    // Keep away from diamond silver edge a bit
    return x > (int)(w * 0.55) && y > (int)(h * 0.54);
  }

  static bool InZone(int x, int y, int w, int h) {
    return InTopRight(x, y, w, h) || InBottomRight(x, y, w, h);
  }

  static int Chroma(byte r, byte g, byte b) {
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    return max - min;
  }

  static int Lum(byte r, byte g, byte b) {
    return (r * 30 + g * 59 + b * 11) / 100;
  }

  static bool IsPaleFringe(byte r, byte g, byte b, byte a) {
    if (a < 10) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    if (l >= 175 && c <= 35) return true;
    if (l >= 160 && c <= 22) return true;
    // desaturated warm/cool fringes
    if (l >= 190 && c <= 45 && r > 180 && g > 170) return true;
    return false;
  }

  static bool IsGreen(byte r, byte g, byte b, byte a) {
    return a >= 50 && g > r + 10 && g > b + 6 && g >= 85;
  }

  static bool IsOrange(byte r, byte g, byte b, byte a) {
    return a >= 50 && r > g + 8 && r > b + 12 && r >= 95;
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

      // Aggressive fringe wipe in symbol neighborhoods
      for (int pass = 0; pass < 3; pass++) {
        Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
        for (int y = 0; y < h; y++) {
          for (int x = 0; x < w; x++) {
            if (!InZone(x, y, w, h)) continue;
            int i = Idx(x, y, stride);
            byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
            if (a < 8) continue;
            if (IsGreen(r, g, b, a) || IsOrange(r, g, b, a)) continue;

            if (!IsPaleFringe(r, g, b, a) && a >= 180) continue;

            int nearSym = 0, nearClear = 0;
            for (int dy = -3; dy <= 3; dy++) {
              for (int dx = -3; dx <= 3; dx++) {
                if (dx == 0 && dy == 0) continue;
                int nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearClear++; continue; }
                int ni = Idx(nx, ny, stride);
                byte na = px[ni + 3], nr = px[ni + 2], ng = px[ni + 1], nb = px[ni];
                if (na < 40) nearClear++;
                else if (IsGreen(nr, ng, nb, na) || IsOrange(nr, ng, nb, na)) nearSym++;
              }
            }

            if (IsPaleFringe(r, g, b, a) && (nearSym >= 1 || nearClear >= 5 || a < 200)) {
              outPx[i] = 0; outPx[i + 1] = 0; outPx[i + 2] = 0; outPx[i + 3] = 0;
            } else if (a < 160 && nearClear >= 3) {
              outPx[i + 3] = 0;
            }
          }
        }
      }

      // Edge crisp + vibrancy on symbols only
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!InZone(x, y, w, h)) continue;
          int i = Idx(x, y, stride);
          byte b = px[i], g = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (a < 8) continue;

          bool green = IsGreen(r, g, b, a);
          bool orange = IsOrange(r, g, b, a);
          if (!green && !orange) continue;

          // Binary-ish alpha for sharp silhouette
          if (a < 100) { outPx[i + 3] = 0; continue; }
          outPx[i + 3] = 255;

          if (green) {
            double nr = r, ng = g, nb = b;
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.45;
            ng = avg + (ng - avg) * 1.7;
            nb = avg + (nb - avg) * 1.1;
            ng = Math.Min(255, ng * 1.15 + 14);
            nr = Math.Min(255, nr * 0.88 + 2);
            nb = Math.Min(255, nb * 0.9 + 6);
            // luminous rim feel on brighter greens
            if (ng > 150) { ng = Math.Min(255, ng + 12); nr = Math.Min(255, nr + 6); }
            outPx[i] = (byte)Clamp(nb);
            outPx[i + 1] = (byte)Clamp(ng);
            outPx[i + 2] = (byte)Clamp(nr);
          } else {
            double nr = r, ng = g, nb = b;
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.65;
            ng = avg + (ng - avg) * 1.45;
            nb = avg + (nb - avg) * 0.7;
            nr = Math.Min(255, nr * 1.18 + 16);
            ng = Math.Min(255, ng * 1.12 + 10);
            nb = Math.Min(255, nb * 0.82);
            if (nr > 190) { nr = Math.Min(255, nr + 12); ng = Math.Min(255, ng + 16); }
            if (ng > 160 && nr > 200) ng = Math.Min(255, ng + 20); // yellow core glow
            outPx[i] = (byte)Clamp(nb);
            outPx[i + 1] = (byte)Clamp(ng);
            outPx[i + 2] = (byte)Clamp(nr);
          }
        }
      }

      // Unsharp-ish local contrast on symbol edges (right side only)
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
          if (!InZone(x, y, w, h)) continue;
          int i = Idx(x, y, stride);
          byte a = px[i + 3];
          if (a < 200) continue;
          byte r = px[i + 2], g = px[i + 1], b = px[i];
          if (!IsGreen(r, g, b, a) && !IsOrange(r, g, b, a)) continue;

          int clearN = 0;
          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              if (px[Idx(x + dx, y + dy, stride) + 3] < 40) clearN++;
            }
          }
          // Edge pixels: push color harder for glow pop against transparent bg
          if (clearN >= 2) {
            if (IsGreen(r, g, b, a)) {
              outPx[i + 1] = (byte)Math.Min(255, g + 18);
              outPx[i + 2] = (byte)Math.Min(255, r + 6);
              outPx[i] = (byte)Math.Min(255, b + 8);
            } else {
              outPx[i + 2] = (byte)Math.Min(255, r + 22);
              outPx[i + 1] = (byte)Math.Min(255, g + 14);
              outPx[i] = (byte)Math.Max(0, b - 4);
            }
          }
        }
      }

      Marshal.Copy(outPx, 0, data.Scan0, outPx.Length);
      bmp.UnlockBits(data);
      bmp.Save(dstPath, ImageFormat.Png);
      bmp.Dispose();
    }
  }

  static int Clamp(double v) {
    if (v < 0) return 0;
    if (v > 255) return 255;
    return (int)Math.Round(v);
  }
}
