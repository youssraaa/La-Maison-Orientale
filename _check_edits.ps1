$ErrorActionPreference = "Stop"
$path = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\agent-transcripts\06f1cef6-9f1e-4151-973b-84fc0b36d33f\06f1cef6-9f1e-4151-973b-84fc0b36d33f.jsonl"
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue
$serializer.RecursionLimit = 500
$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($script:lineNum -lt 5697 -or $script:lineNum -ge 5742) { return }
  try { $obj = $serializer.DeserializeObject($_) } catch { return }
  $content = $obj.message.content
  if (-not $content) { return }
  foreach ($item in $content) {
    if ($item.type -ne "tool_use") { continue }
    $inp = $item.input
    if (-not $inp) { continue }
    $p = [string]$inp.path
    if ($p -like "*ClientPortalLayout*" -or $p -like "*ClientDashboardPage*" -or $p -like "*client-portal-hub*") {
      Write-Host "L$lineNum $($item.name) $p"
    }
  }
}
