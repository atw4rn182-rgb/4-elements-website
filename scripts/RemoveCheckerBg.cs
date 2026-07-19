using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class RemoveCheckerBg {
  static bool IsCheckerLike(byte[] px, int i) {
    byte b = px[i], gch = px[i + 1], r = px[i + 2];
    int max = Math.Max(r, Math.Max(gch, b));
    int min = Math.Min(r, Math.Min(gch, b));
    int chroma = max - min;
    if (chroma > 18) return false;
    if (r >= 238 && gch >= 238 && b >= 238) return true;
    if (r >= 195 && r <= 225 && gch >= 195 && gch <= 225 && b >= 195 && b <= 225) return true;
    if (r >= 225 && r < 238 && gch >= 225 && gch < 238 && b >= 225 && b < 238 && chroma <= 12) return true;
    return false;
  }

  static void TryEnqueue(Queue<int> q, bool[] bg, byte[] px, int stride, int w, int h, int x, int y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    int idx = y * w + x;
    if (bg[idx]) return;
    int i = y * stride + x * 4;
    if (!IsCheckerLike(px, i)) return;
    bg[idx] = true;
    q.Enqueue(idx);
  }

  public static void Run(string srcPath, string dstPath) {
    using (var src = new Bitmap(srcPath)) {
      int w = src.Width, h = src.Height;
      var bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
      using (var g = Graphics.FromImage(bmp)) {
        g.DrawImage(src, 0, 0, w, h);
      }

      var rect = new Rectangle(0, 0, w, h);
      var data = bmp.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
      int stride = Math.Abs(data.Stride);
      byte[] px = new byte[stride * h];
      Marshal.Copy(data.Scan0, px, 0, px.Length);

      bool[] bg = new bool[w * h];
      Queue<int> q = new Queue<int>();

      for (int x = 0; x < w; x++) {
        TryEnqueue(q, bg, px, stride, w, h, x, 0);
        TryEnqueue(q, bg, px, stride, w, h, x, h - 1);
      }
      for (int y = 0; y < h; y++) {
        TryEnqueue(q, bg, px, stride, w, h, 0, y);
        TryEnqueue(q, bg, px, stride, w, h, w - 1, y);
      }

      while (q.Count > 0) {
        int idx = q.Dequeue();
        int x = idx % w;
        int y = idx / w;
        TryEnqueue(q, bg, px, stride, w, h, x + 1, y);
        TryEnqueue(q, bg, px, stride, w, h, x - 1, y);
        TryEnqueue(q, bg, px, stride, w, h, x, y + 1);
        TryEnqueue(q, bg, px, stride, w, h, x, y - 1);
      }

      for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
          int idx = y * w + x;
          int i = y * stride + x * 4;
          if (bg[idx]) {
            px[i + 3] = 0;
            continue;
          }
          int nearBg = 0;
          for (int dy = -1; dy <= 1; dy++) {
            for (int dx = -1; dx <= 1; dx++) {
              if (dx == 0 && dy == 0) continue;
              int nx = x + dx, ny = y + dy;
              if (nx < 0 || ny < 0 || nx >= w || ny >= h) { nearBg++; continue; }
              if (bg[ny * w + nx]) nearBg++;
            }
          }
          if (nearBg >= 3 && IsCheckerLike(px, i)) {
            px[i + 3] = 0;
            bg[idx] = true;
          } else if (nearBg >= 4) {
            int a = px[i + 3] - nearBg * 18;
            if (a < 0) a = 0;
            px[i + 3] = (byte)a;
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
