$ErrorActionPreference = "Stop"
$html = (Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 15).Content
if ($html -match "assets/(index-[^`"]+\.css)") {
  $cssFile = $Matches[1]
  $cssUrl = "http://127.0.0.1:3000/assets/$cssFile"
  $out = Join-Path $PSScriptRoot "..\src\index.recovered.css"
  Invoke-WebRequest -Uri $cssUrl -OutFile $out -UseBasicParsing -TimeoutSec 60
  $size = (Get-Item $out).Length
  Write-Output "Downloaded $cssUrl ($size bytes)"
} else {
  throw "CSS asset not found in index.html"
}
