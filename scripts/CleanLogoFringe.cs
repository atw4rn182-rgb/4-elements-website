using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

/// <summary>Second pass: strip remaining pale fringe only. Never alters logo RGB.</summary>
public static class CleanLogoFringe {
  static int Idx(int x, int y, int s) { return y * s + x * 4; }
  static int Chroma(byte r, byte g, byte b) {
    int mx = Math.Max(r, Math.Max(g, b));
    int mn = Math.Min(r, Math.Min(g, b));
    return mx - mn;
  }
  static int Lum(byte r, byte g, byte b) { return (r * 30 + g * 59 + b * 11) / 100; }

  static bool IsPale(byte r, byte g, byte b, byte a) {
    if (a < 8) return false;
    int c = Chroma(r, g, b); int l = Lum(r, g, b);
    if (l >= 168 && c <= 40) return true;
    if (l >= 150 && c <= 22) return true;
    if (l >= 185 && c <= 50 && r > 175 && g > 165) return true; // warm pale fire halo
    return false;
  }

  static bool IsSaturatedLogo(byte r, byte g, byte b, byte a) {
    if (a < 50) return false;
    int c = Chroma(r, g, b); int l = Lum(r, g, b);
    if (c >= 24) return true;
    // silver
    if (c <= 26 && l >= 75 && l <= 195) return true;
    // navy
    if (b > r + 12 && l < 130) return true;
    return false;
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) g.DrawImage(src, 0, 0, w, h);

      var data = bmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      for (int iter = 0; iter < 8; iter++) {
        bool[] kill = new bool[w * h];
        for (int y = 1; y < h - 1; y++) {
          for (int x = 1; x < w - 1; x++) {
            int i = Idx(x, y, stride);
            byte a = px[i + 3];
            if (a < 8) continue;
            byte b = px[i], g = px[i + 1], r = px[i + 2];

            int clear = 0;
            for (int dy = -2; dy <= 2; dy++) {
              for (int dx = -2; dx <= 2; dx++) {
                if (dx == 0 && dy == 0) continue;
                int nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) { clear++; continue; }
                if (px[Idx(nx, ny, stride) + 3] < 40) clear++;
              }
            }

            if (IsPale(r, g, b, a) && clear >= 1) {
              kill[y * w + x] = true;
              continue;
            }

            // Soft non-logo fringe
            if (!IsSaturatedLogo(r, g, b, a) && a < 220 && clear >= 4) {
              kill[y * w + x] = true;
              continue;
            }

            // Crisp solid alpha on real content at edge (RGB untouched)
            if (IsSaturatedLogo(r, g, b, a) && a >= 150) {
              px[i + 3] = 255;
            }
          }
        }
        int killed = 0;
        for (int id = 0; id < kill.Length; id++) {
          if (!kill[id]) continue;
          killed++;
          int x = id % w, y = id / w;
          int i = Idx(x, y, stride);
          px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = 0;
        }
        if (killed == 0) break;
      }

      Marshal.Copy(px, 0, data.Scan0, px.Length);
      bmp.UnlockBits(data);
      bmp.Save(dstPath, ImageFormat.Png);
      bmp.Dispose();
    }
  }
}
