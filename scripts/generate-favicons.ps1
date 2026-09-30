# Builds square favicons from the 4 Elements badge.
# The full badge is unreadable at tab size, so each icon is cropped
# to the white "4" in the upper diamond (the mark that stays recognizable).
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "images\favicon-source.jpg"
$outDir = Join-Path $root "images"

if (-not (Test-Path $source)) {
  throw "Missing $source"
}

# Measured on images/favicon-source.jpg (1023x1007).
# The numeral occupies x=473-547, y=247-346. A 128px square
# centered on that glyph keeps padding without the wordmark.
$crop = 128
$cx = 510
$cy = 296
$srcX = $cx - [int]($crop / 2)
$srcY = $cy - [int]($crop / 2)

$src = New-Object System.Drawing.Bitmap $source

function Save-FaviconPng([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $bmp.SetResolution(72, 72)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::FromArgb(255, 14, 42, 74))
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $srcRect = New-Object System.Drawing.Rectangle $srcX, $srcY, $crop, $crop
  $dstRect = New-Object System.Drawing.Rectangle 0, 0, $size, $size
  $g.DrawImage($src, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "Wrote $path ($size x $size)"
}

Save-FaviconPng 16 (Join-Path $outDir "favicon-16.png")
Save-FaviconPng 32 (Join-Path $outDir "favicon-32.png")
Save-FaviconPng 48 (Join-Path $outDir "favicon-48.png")
Save-FaviconPng 180 (Join-Path $outDir "apple-touch-icon.png")
Save-FaviconPng 192 (Join-Path $outDir "favicon-192.png")

$src.Dispose()
