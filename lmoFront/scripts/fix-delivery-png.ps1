Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_253-2532219_fast-delivery-delivery-service-025685b3-1dae-4eab-8006-459cd99a8da5.png"
$outputPath = Join-Path $PSScriptRoot "..\public\images\commander-delivery.png"

function Test-IsBackground([System.Drawing.Color]$pixel) {
  $r = [int]$pixel.R
  $g = [int]$pixel.G
  $b = [int]$pixel.B
  $max = [Math]::Max($r, [Math]::Max($g, $b))
  $min = [Math]::Min($r, [Math]::Min($g, $b))
  $spread = $max - $min
  $avg = ($r + $g + $b) / 3

  if ($max -le 50 -and $spread -le 18) { return $true }
  if ($max -ge 248 -and $spread -le 8) { return $true }
  if ($spread -le 14 -and $avg -ge 165 -and $avg -le 235) { return $true }
  return $false
}

$bitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
$w = $bitmap.Width
$h = $bitmap.Height
$result = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $pixel = $bitmap.GetPixel($x, $y)
    if (Test-IsBackground $pixel) { continue }
    $result.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixel.R, $pixel.G, $pixel.B))
  }
}

$bitmap.Dispose()
$result.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$result.Dispose()
Write-Output "Saved transparent PNG: $outputPath"
