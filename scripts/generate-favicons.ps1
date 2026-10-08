# Builds square favicons from the finalized 4E diamond.
# The full source is scaled into each size. The diamond is not cropped,
# sharpened, or recolored. Downscaling uses area averaging only.
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class FaviconScale {
  public static void Save(Bitmap source, int size, string path) {
    int sw = source.Width;
    int sh = source.Height;
    Bitmap src32 = new Bitmap(sw, sh, PixelFormat.Format32bppArgb);
    using (Graphics g = Graphics.FromImage(src32)) {
      g.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
      g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.NearestNeighbor;
      g.DrawImageUnscaled(source, 0, 0);
    }

    Rectangle rect = new Rectangle(0, 0, sw, sh);
    BitmapData data = src32.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
    int stride = data.Stride;
    byte[] bytes = new byte[stride * sh];
    Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);
    src32.UnlockBits(data);
    src32.Dispose();

    Bitmap dst = new Bitmap(size, size, PixelFormat.Format24bppRgb);
    double scaleX = (double)sw / size;
    double scaleY = (double)sh / size;

    for (int y = 0; y < size; y++) {
      double y0 = y * scaleY;
      double y1 = (y + 1) * scaleY;
      int yStart = (int)Math.Floor(y0);
      int yEnd = (int)Math.Ceiling(y1) - 1;
      if (yEnd >= sh) yEnd = sh - 1;

      for (int x = 0; x < size; x++) {
        double x0 = x * scaleX;
        double x1 = (x + 1) * scaleX;
        int xStart = (int)Math.Floor(x0);
        int xEnd = (int)Math.Ceiling(x1) - 1;
        if (xEnd >= sw) xEnd = sw - 1;

        double r = 0, gch = 0, b = 0, wsum = 0;
        for (int sy = yStart; sy <= yEnd; sy++) {
          double wy = Math.Min(sy + 1, y1) - Math.Max(sy, y0);
          if (wy <= 0) continue;
          int row = sy * stride;
          for (int sx = xStart; sx <= xEnd; sx++) {
            double wx = Math.Min(sx + 1, x1) - Math.Max(sx, x0);
            if (wx <= 0) continue;
            double w = wx * wy;
            int i = row + (sx * 4);
            b += bytes[i] * w;
            gch += bytes[i + 1] * w;
            r += bytes[i + 2] * w;
            wsum += w;
          }
        }

        int ri = (int)Math.Round(r / wsum);
        int gi = (int)Math.Round(gch / wsum);
        int bi = (int)Math.Round(b / wsum);
        if (ri < 0) ri = 0; else if (ri > 255) ri = 255;
        if (gi < 0) gi = 0; else if (gi > 255) gi = 255;
        if (bi < 0) bi = 0; else if (bi > 255) bi = 255;
        dst.SetPixel(x, y, Color.FromArgb(ri, gi, bi));
      }
    }

    dst.Save(path, ImageFormat.Png);
    dst.Dispose();
  }
}
"@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $root "images\favicon-source.jpg"
$outDir = Join-Path $root "images"

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Missing $sourcePath"
}

$src = New-Object System.Drawing.Bitmap $sourcePath
if ($src.Width -lt 1 -or $src.Height -lt 1) {
  throw "Favicon source has no pixels"
}

$sizes = @(
  @{ Size = 16; Name = "favicon-16.png" },
  @{ Size = 32; Name = "favicon-32.png" },
  @{ Size = 48; Name = "favicon-48.png" },
  @{ Size = 180; Name = "apple-touch-icon.png" },
  @{ Size = 192; Name = "favicon-192.png" },
  @{ Size = 512; Name = "favicon-512.png" }
)

foreach ($item in $sizes) {
  $path = Join-Path $outDir $item.Name
  [FaviconScale]::Save($src, $item.Size, $path)
  Write-Output "Wrote $path ($($item.Size) x $($item.Size)) from $($src.Width) x $($src.Height)"
}

$src.Dispose()
