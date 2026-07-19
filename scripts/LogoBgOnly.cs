using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

/// <summary>
/// Remove checkerboard only + crisp alpha edges. Never modifies logo RGB.
/// </summary>
public static class LogoBgOnly {
  static int I(int x, int y, int s) { return y * s + x * 4; }
  static int Chroma(byte r, byte g, byte b) {
    int mx = Math.Max(r, Math.Max(g, b));
    int mn = Math.Min(r, Math.Min(g, b));
    return mx - mn;
  }
  static int Lum(byte r, byte g, byte b) {
    return (r * 30 + g * 59 + b * 11) / 100;
  }

  // Classic transparency checker tiles (~210 gray / ~250 white)
  static bool IsChecker(byte r, byte g, byte b) {
    int c = Chroma(r, g, b);
    if (c > 20) return false;
    int l = Lum(r, g, b);
    if (l >= 238) return true;
    if (l >= 200 && l <= 226) return true;
    if (l > 226 && l < 238 && c <= 12) return true;
    return false;
  }

  // Light fringe left by anti-aliasing against checker (not logo content)
  static bool IsCheckerFringe(byte r, byte g, byte b, byte a) {
    if (a < 8) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    if (l >= 178 && c <= 28) return true;
    if (l >= 165 && c <= 16) return true;
    return false;
  }

  static bool IsLogoPixel(byte r, byte g, byte b, byte a) {
    if (a < 40) return false;
    int c = Chroma(r, g, b);
    int l = Lum(r, g, b);
    if (c >= 18) return true;                 // colored symbols / navy / glow
    if (c <= 28 && l >= 70 && l <= 205) return true; // silver metal
    if (b > r + 10 && l < 140) return true;    // navy
    return false;
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) {
        g.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
        g.DrawImage(src, 0, 0, w, h);
      }

      var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      // 1) Flood-fill checkerboard from edges → alpha 0 (RGB cleared only where bg)
      bool[] bg = new bool[w * h];
      var q = new Queue<int>();
      Action<int, int> enq = (x, y) => {
        if (x < 0 || y < 0 || x >= w || y >= h) return;
        int id = y * w + x;
        if (bg[id]) return;
        int i = I(x, y, stride);
        if (!IsChecker(px[i + 2], px[i + 1], px[i])) return;
        bg[id] = true;
        q.Enqueue(id);
      };
      for (int x = 0; x < w; x++) { enq(x, 0); enq(x, h - 1); }
      for (int y = 0; y < h; y++) { enq(0, y); enq(w - 1, y); }
      while (q.Count > 0) {
        int id = q.Dequeue();
        int x = id % w, y = id / w;
        enq(x + 1, y); enq(x - 1, y); enq(x, y + 1); enq(x, y - 1);
      }
      for (int id = 0; id < bg.Length; id++) {
        if (!bg[id]) continue;
        int i = I(id % w, id / w, stride);
        px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
      }

      // 2) Strip checker fringe along silhouette — delete fringe only, never recolor logo
      for (int pass = 0; pass < 6; pass++) {
        bool[] kill = new bool[w * h];
        for (int y = 1; y < h - 1; y++) {
          for (int x = 1; x < w - 1; x++) {
            int i = I(x, y, stride);
            byte a = px[i + 3];
            if (a < 8) continue;
            byte b = px[i], g = px[i + 1], r = px[i + 2];

            int clear = 0;
            for (int dy = -1; dy <= 1; dy++)
              for (int dx = -1; dx <= 1; dx++)
                if (dx != 0 || dy != 0)
                  if (px[I(x + dx, y + dy, stride) + 3] < 40) clear++;

            if (clear == 0) continue;

            if (IsCheckerFringe(r, g, b, a)) {
              kill[y * w + x] = true;
              continue;
            }

            // Soft leftover that isn't clearly logo content
            if (!IsLogoPixel(r, g, b, a) && a < 210 && clear >= 2) {
              kill[y * w + x] = true;
              continue;
            }

            // Crisp edge: solidify alpha on real logo pixels (RGB unchanged)
            if (IsLogoPixel(r, g, b, a) && a >= 140) {
              px[i + 3] = 255;
            } else if (a < 110 && clear >= 2) {
              kill[y * w + x] = true;
            }
          }
        }
        int n = 0;
        for (int id = 0; id < kill.Length; id++) {
          if (!kill[id]) continue;
          n++;
          int i = I(id % w, id / w, stride);
          px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
        }
        if (n == 0) break;
      }

      // 3) Final alpha snap on remaining logo edge pixels (RGB untouched)
      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int i = I(x, y, stride);
          byte a = px[i + 3];
          if (a == 0) continue;
          byte b = px[i], g = px[i + 1], r = px[i + 2];
          if (IsCheckerFringe(r, g, b, a)) {
            px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
          } else if (IsLogoPixel(r, g, b, a) && a >= 130) {
            px[i + 3] = 255;
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
