using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

/// <summary>
/// Removes checkerboard background and cleans fringe alpha without changing RGB colors.
/// </summary>
public static class CleanLogoTransparent {
  static int Idx(int x, int y, int stride) { return y * stride + x * 4; }

  static int Chroma(byte r, byte g, byte b) {
    int mx = Math.Max(r, Math.Max(g, b));
    int mn = Math.Min(r, Math.Min(g, b));
    return mx - mn;
  }

  static int Lum(byte r, byte g, byte b) {
    return (r * 30 + g * 59 + b * 11) / 100;
  }

  static bool IsCheckerTile(byte r, byte g, byte b) {
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    // Light tile ~250, dark tile ~210, blends between
    if (c > 22) return false;
    if (l >= 235) return true;
    if (l >= 198 && l <= 228) return true;
    if (l >= 228 && l < 235 && c <= 14) return true;
    return false;
  }

  static bool IsPaleFringe(byte r, byte g, byte b, byte a) {
    if (a < 8) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    // Leftover light gray / off-white fringe from checkerboard
    if (l >= 175 && c <= 32) return true;
    if (l >= 160 && c <= 18) return true;
    return false;
  }

  static bool IsLikelyLogoColor(byte r, byte g, byte b, byte a) {
    if (a < 40) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    // Saturated / mid-tone logo content (water, fire, green, navy, silver midtones)
    if (c >= 20) return true;
    // Metallic silver (moderate luma, low chroma) — keep
    if (c <= 28 && l >= 70 && l <= 200) return true;
    // Navy interior
    if (b > r + 15 && b > g && l < 140) return true;
    return false;
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) {
        g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
        g.DrawImage(src, 0, 0, w, h);
      }

      var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      bool[] bg = new bool[w * h];
      Queue<int> q = new Queue<int>();

      // --- Pass 1: flood-fill checkerboard from edges ---
      Action<int, int> tryEnq = (x, y) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        int id = y * w + x;
        if (bg[id]) return;
        int i = Idx(x, y, stride);
        byte b = px[i], gch = px[i + 1], r = px[i + 2];
        if (!IsCheckerTile(r, gch, b)) return;
        bg[id] = true;
        q.Enqueue(id);
      };

      for (int x = 0; x < w; x++) {
        tryEnq(x, 0);
        tryEnq(x, h - 1);
      }
      for (int y = 0; y < h; y++) {
        tryEnq(0, y);
        tryEnq(w - 1, y);
      }

      while (q.Count > 0) {
        int id = q.Dequeue();
        int x = id % w, y = id / w;
        tryEnq(x + 1, y);
        tryEnq(x - 1, y);
        tryEnq(x, y + 1);
        tryEnq(x, y - 1);
      }

      // Apply transparency for background — RGB unchanged elsewhere
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          if (!bg[y * w + x]) continue;
          int i = Idx(x, y, stride);
          px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
        }
      }

      // --- Pass 2: remove pale fringe near transparent (no RGB rewrite on keepers) ---
      for (int iter = 0; iter < 5; iter++) {
        bool[] kill = new bool[w * h];
        for (int y = 1; y < h - 1; y++) {
          for (int x = 1; x < w - 1; x++) {
            int i = Idx(x, y, stride);
            byte a = px[i + 3];
            if (a < 8) continue;
            byte b = px[i], gch = px[i + 1], r = px[i + 2];

            int clearN = 0;
            for (int dy = -1; dy <= 1; dy++) {
              for (int dx = -1; dx <= 1; dx++) {
                if (dx == 0 && dy == 0) continue;
                if (px[Idx(x + dx, y + dy, stride) + 3] < 40) clearN++;
              }
            }
            if (clearN == 0) continue;

            // Kill pale checker leftovers along silhouette
            if (IsPaleFringe(r, gch, b, a) && clearN >= 1) {
              kill[y * w + x] = true;
              continue;
            }

            // Kill weak/semi fringe that isn't clearly logo color
            if (a < 200 && clearN >= 2 && !IsLikelyLogoColor(r, gch, b, a)) {
              kill[y * w + x] = true;
              continue;
            }

            // Snap soft alpha on real logo edge pixels to solid (RGB untouched)
            if (IsLikelyLogoColor(r, gch, b, a) && a >= 140 && a < 255 && clearN >= 1) {
              px[i + 3] = 255;
            } else if (a < 120 && clearN >= 3) {
              kill[y * w + x] = true;
            }
          }
        }
        for (int id = 0; id < kill.Length; id++) {
          if (!kill[id]) continue;
          int x = id % w, y = id / w;
          int i = Idx(x, y, stride);
          px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
        }
      }

      // --- Pass 3: remove isolated 1px pale speckles near edges ---
      for (int y = 1; y < h - 1; y++) {
        for (int x = 1; x < w - 1; x++) {
          int i = Idx(x, y, stride);
          if (px[i + 3] < 8) continue;
          byte b = px[i], gch = px[i + 1], r = px[i + 2], a = px[i + 3];
          if (!IsPaleFringe(r, gch, b, a)) continue;

          int clearN = 0, logoN = 0;
          for (int dy = -2; dy <= 2; dy++) {
            for (int dx = -2; dx <= 2; dx++) {
              if (dx == 0 && dy == 0) continue;
              int nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) { clearN++; continue; }
              int ni = Idx(nx, ny, stride);
              byte na = px[ni + 3];
              if (na < 40) clearN++;
              else if (IsLikelyLogoColor(px[ni + 2], px[ni + 1], px[ni], na)) logoN++;
            }
          }
          if (clearN >= 4 || (clearN >= 2 && logoN >= 2)) {
            px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
          }
        }
      }

      // --- Pass 4: final alpha snap — solid logo pixels stay RGB identical ---
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int i = Idx(x, y, stride);
          byte a = px[i + 3];
          if (a == 0) continue;
          byte b = px[i], gch = px[i + 1], r = px[i + 2];
          if (IsLikelyLogoColor(r, gch, b, a) && a >= 160) {
            px[i + 3] = 255; // sharpen silhouette only
          } else if (IsPaleFringe(r, gch, b, a)) {
            px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
          } else if (a < 100) {
            px[i + 3] = 0;
          }
        }
      }

      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);
      bmp.Save(dstPath, ImageFormat.Png);
      bmp.Dispose();
    }
  }
}
