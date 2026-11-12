$ErrorActionPreference = "Stop"
$path = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\agent-transcripts\06f1cef6-9f1e-4151-973b-84fc0b36d33f\06f1cef6-9f1e-4151-973b-84fc0b36d33f.jsonl"
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue
$serializer.RecursionLimit = 500
$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  try { $obj = $serializer.DeserializeObject($_) } catch { return }
  $content = $obj.message.content
  if (-not $content) { return }
  foreach ($item in $content) {
    if ($item.type -ne "tool_use") { continue }
    $inp = $item.input
    if (-not $inp) { continue }
    $p = [string]$inp.path
    if ($p -notlike "*client-portal-hub.css*") { continue }
    $name = $item.name
    $hasFff8dc = $false
    if ($name -eq "Write" -and $inp.contents) {
      $c = [string]$inp.contents
      if ($c -like "*#fff8dc*") { $hasFff8dc = $true }
      Write-Host "L$lineNum Write len=$($c.Length) fff8dc=$hasFff8dc"
    } elseif ($name -eq "StrReplace") {
      $new = [string]$inp.new_string
      $old = [string]$inp.old_string
      if ($new -like "*#fff8dc*" -or $old -like "*#fff8dc*") { $hasFff8dc = $true }
      Write-Host "L$lineNum StrReplace fff8dc=$hasFff8dc oldLen=$($old.Length) newLen=$($new.Length)"
    }
  }
}
