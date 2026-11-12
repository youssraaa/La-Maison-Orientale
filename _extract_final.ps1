$ErrorActionPreference = "Stop"
$path = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\agent-transcripts\06f1cef6-9f1e-4151-973b-84fc0b36d33f\06f1cef6-9f1e-4151-973b-84fc0b36d33f.jsonl"
$outDir = "C:\Users\user\Downloads\la_maison_orientale\_transcript_extract"
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue
$serializer.RecursionLimit = 500
$targets = @{}
$targets["ClientPortalLayout.jsx"] = $null
$targets["ClientDashboardPage.jsx"] = $null
$targets["client-portal-hub.css"] = $null
$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($script:lineNum -ge 5742) { return }
  try { $obj = $serializer.DeserializeObject($_) } catch { return }
  $content = $obj.message.content
  if (-not $content) { return }
  foreach ($item in $content) {
    if ($item.type -ne "tool_use") { continue }
    $name = $item.name
    $inp = $item.input
    if (-not $inp) { continue }
    $p = [string]$inp.path
    $key = $null
    foreach ($k in $targets.Keys) { if ($p -like "*$k*") { $key = $k; break } }
    if (-not $key) { continue }
    if ($name -eq "Write" -and $inp.contents) { $targets[$key] = [string]$inp.contents }
    elseif ($name -eq "StrReplace" -and $targets[$key]) {
      $old = [string]$inp.old_string
      $new = [string]$inp.new_string
      if ($targets[$key].Contains($old)) { $targets[$key] = $targets[$key].Replace($old, $new) }
    }
  }
}
foreach ($k in $targets.Keys) {
  if ($targets[$k]) {
    [IO.File]::WriteAllText((Join-Path $outDir $k), $targets[$k], [Text.UTF8Encoding]::new($false))
  }
}
