Add-Type -AssemblyName System.Drawing

function New-Favicon($size, $fileName) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(255, 31, 79, 72))

  $gold = [System.Drawing.Color]::FromArgb(255, 246, 217, 138)
  $brush = New-Object System.Drawing.SolidBrush $gold
  $scale = $size / 64.0

  $state = $g.Save()
  $g.TranslateTransform($size / 2, ($size / 2) + (2 * $scale))
  $g.RotateTransform(-45)
  $g.ScaleTransform($scale, $scale)
  $g.FillRectangle($brush, -3, -20, 6, 20)
  $g.FillRectangle($brush, -8, -20, 3.5, 10)
  $g.FillRectangle($brush, -1.5, -20, 3.5, 10)
  $g.FillRectangle($brush, 4.5, -20, 3.5, 10)
  $g.Restore($state)

  $state = $g.Save()
  $g.TranslateTransform($size / 2, ($size / 2) + (2 * $scale))
  $g.RotateTransform(45)
  $g.ScaleTransform($scale, $scale)
  $points = @(
    [System.Drawing.PointF]::new(-4, -20),
    [System.Drawing.PointF]::new(4, -20),
    [System.Drawing.PointF]::new(1.5, -6),
    [System.Drawing.PointF]::new(2.5, 10),
    [System.Drawing.PointF]::new(-2.5, 10),
    [System.Drawing.PointF]::new(-1.5, -6)
  )
  $g.FillPolygon($brush, $points)
  $g.Restore($state)

  $publicDir = Join-Path $PSScriptRoot "..\public"
  $bmp.Save((Join-Path $publicDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
}

New-Favicon 64 "favicon.png"
New-Favicon 32 "favicon-32.png"
New-Favicon 16 "favicon-16.png"

Write-Output "Favicon PNGs generated."
