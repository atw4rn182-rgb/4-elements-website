using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class PolishLogoSymbols {
  static int Idx(int x, int y, int stride) { return y * stride + x * 4; }

  static bool InTopRight(int x, int y, int w, int h) {
    // Green leaf / earth symbol zone (top-right)
    return x > (int)(w * 0.52) && y < (int)(h * 0.48);
  }

  static bool InBottomRight(int x, int y, int w, int h) {
    // Orange fire symbol zone (bottom-right)
    return x > (int)(w * 0.52) && y > (int)(h * 0.52);
  }

  static bool InTargetZone(int x, int y, int w, int h) {
    return InTopRight(x, y, w, h) || InBottomRight(x, y, w, h);
  }

  static bool IsHalo(byte r, byte g, byte b, byte a) {
    if (a < 8) return false;
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    int chroma = max - min;
    int lum = (r * 30 + g * 59 + b * 11) / 100;
    // Near-white / light gray fringe leftover from checkerboard
    if (lum >= 200 && chroma <= 28) return true;
    if (lum >= 185 && chroma <= 18) return true;
    // Warm pale halo near fire
    if (r >= 220 && g >= 205 && b >= 190 && chroma <= 40 && lum >= 200) return true;
    // Cool pale halo near green
    if (g >= 215 && r >= 200 && b >= 195 && chroma <= 35 && lum >= 200) return true;
    return false;
  }

  static bool IsGreen(byte r, byte g, byte b, byte a) {
    if (a < 40) return false;
    return g > r + 12 && g > b + 8 && g >= 90;
  }

  static bool IsOrange(byte r, byte g, byte b, byte a) {
    if (a < 40) return false;
    return r > g + 10 && r > b + 15 && r >= 100 && g >= 40;
  }

  static bool IsSilverFrame(byte r, byte g, byte b, byte a) {
    // Protect metallic silver diamond edge if it crosses the ROI
    if (a < 40) return false;
    int max = Math.Max(r, Math.Max(g, b));
    int min = Math.Min(r, Math.Min(g, b));
    int chroma = max - min;
    int lum = (r * 30 + g * 59 + b * 11) / 100;
    return chroma <= 22 && lum >= 95 && lum <= 210 && !(lum >= 200 && chroma <= 18);
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, w, h);

      var rect = new Rectangle(0, 0, w, h);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      byte[] outPx = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);
      Buffer.BlockCopy(px, 0, outPx, 0, px.Length);

      // Pass 1: remove white/gray halos in target zones only
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!InTargetZone(x, y, w, h)) continue;
          int i = Idx(x, y, stride);
          byte b = px[i], gch = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (IsSilverFrame(r, gch, b, a)) continue;
          if (!IsHalo(r, gch, b, a)) continue;

          // Count neighboring green/orange/transparent — halo should be near symbol or empty
          int nearSymbol = 0, nearClear = 0, nearSolid = 0;
          for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
              if (dx == 0 && dy == 0) continue;
              int nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearClear++; continue; }
              int ni = Idx(nx, ny, stride);
              byte nb = px[ni], ng = px[ni + 1], nr = px[ni + 2], na = px[ni + 3];
              if (na < 30) nearClear++;
              else if (IsGreen(nr, ng, nb, na) || IsOrange(nr, ng, nb, na)) nearSymbol++;
              else if (!IsHalo(nr, ng, nb, na)) nearSolid++;
            }
          }

          // Remove halo if near symbol edge or mostly surrounded by clear/halo
          if (nearSymbol >= 2 || nearClear >= 6 || (nearClear + nearSymbol) >= 10) {
            outPx[i] = 0; outPx[i + 1] = 0; outPx[i + 2] = 0; outPx[i + 3] = 0;
          } else if (nearSymbol >= 1 || nearClear >= 3) {
            // Soft kill residual fringe
            outPx[i + 3] = 0;
          }
        }
      }

      // Pass 2: crisp alpha — make weak fringe fully transparent; strengthen symbol pixels
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!InTargetZone(x, y, w, h)) continue;
          int i = Idx(x, y, stride);
          byte b = px[i], gch = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (a == 0) continue;
          if (IsSilverFrame(r, gch, b, a)) continue;

          bool green = IsGreen(r, gch, b, a);
          bool orange = IsOrange(r, gch, b, a);
          if (!green && !orange) {
            // leftover pale fringe after pass 1
            if (IsHalo(r, gch, b, a) || a < 140) {
              int nearClear = 0;
              for (int dy = -1; dy <= 1; dy++) {
                for (int dx = -1; dx <= 1; dx++) {
                  int nx = x + dx, ny = y + dy;
                  if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearClear++; continue; }
                  if (px[Idx(nx, ny, stride) + 3] < 40) nearClear++;
                }
              }
              if (nearClear >= 2) {
                outPx[i + 3] = 0;
              }
            }
            continue;
          }

          // Snap soft alpha to solid for crisp edges
          if (a < 90) {
            outPx[i + 3] = 0;
            continue;
          }
          if (a < 220) outPx[i + 3] = 255;

          // Vibrancy + glow boost
          if (green) {
            double nr = r, ng = gch, nb = b;
            // Increase saturation toward vivid green
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.35;
            ng = avg + (ng - avg) * 1.55;
            nb = avg + (nb - avg) * 1.15;
            // Lift greens / add luminous punch
            ng = Math.Min(255, ng * 1.12 + 8);
            nr = Math.Min(255, nr * 0.92);
            nb = Math.Min(255, nb * 0.95 + 4);
            // Soft self-glow via slight brightness on midtones
            double lum = (nr * 0.3 + ng * 0.59 + nb * 0.11);
            if (lum > 90 && lum < 210) {
              ng = Math.Min(255, ng + 10);
              nr = Math.Min(255, nr + 4);
            }
            outPx[i] = (byte)Clamp(nb);
            outPx[i + 1] = (byte)Clamp(ng);
            outPx[i + 2] = (byte)Clamp(nr);
            outPx[i + 3] = 255;
          } else if (orange) {
            double nr = r, ng = gch, nb = b;
            double avg = (nr + ng + nb) / 3.0;
            nr = avg + (nr - avg) * 1.5;
            ng = avg + (ng - avg) * 1.35;
            nb = avg + (nb - avg) * 0.85;
            // Hotter fire glow
            nr = Math.Min(255, nr * 1.14 + 12);
            ng = Math.Min(255, ng * 1.08 + 6);
            nb = Math.Min(255, nb * 0.88);
            double lum = (nr * 0.3 + ng * 0.59 + nb * 0.11);
            if (lum > 80) {
              nr = Math.Min(255, nr + 14);
              ng = Math.Min(255, ng + 8);
            }
            // Push yellow highlights
            if (nr > 200 && ng > 140) {
              ng = Math.Min(255, ng + 18);
              nr = Math.Min(255, nr + 8);
            }
            outPx[i] = (byte)Clamp(nb);
            outPx[i + 1] = (byte)Clamp(ng);
            outPx[i + 2] = (byte)Clamp(nr);
            outPx[i + 3] = 255;
          }
        }
      }

      // Pass 3: one-pixel morphological cleanup — kill isolated halo specks; fill 1px symbol gaps at edge
      Buffer.BlockCopy(outPx, 0, px, 0, px.Length);
      for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
          if (!InTargetZone(x, y, w, h)) continue;
          int i = Idx(x, y, stride);
          byte a = px[i + 3];
          byte r = px[i + 2], gch = px[i + 1], b = px[i];

          int opaqueN = 0, clearN = 0, greenN = 0, orangeN = 0;
          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              if (dx == 0 && dy == 0) continue;
              int ni = Idx(x + dx, y + dy, stride);
              byte na = px[ni + 3];
              if (na < 40) clearN++;
              else {
                opaqueN++;
                byte nr = px[ni + 2], ng = px[ni + 1], nb = px[ni];
                if (IsGreen(nr, ng, nb, na)) greenN++;
                if (IsOrange(nr, ng, nb, na)) orangeN++;
              }
            }
          }

          if (a > 40 && IsHalo(r, gch, b, a) && clearN >= 3) {
            outPx[i + 3] = 0;
            continue;
          }

          // Remove lonely pale pixels
          if (a > 40 && !IsGreen(r, gch, b, a) && !IsOrange(r, gch, b, a) && !IsSilverFrame(r, gch, b, a)) {
            int max = Math.Max(r, Math.Max(gch, b));
            int min = Math.Min(r, Math.Min(gch, b));
            if ((max - min) < 30 && max > 170 && (clearN >= 4 || greenN + orangeN >= 2)) {
              outPx[i + 3] = 0;
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
