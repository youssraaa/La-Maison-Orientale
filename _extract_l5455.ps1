$ErrorActionPreference = "Stop"
$path = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\agent-transcripts\06f1cef6-9f1e-4151-973b-84fc0b36d33f\06f1cef6-9f1e-4151-973b-84fc0b36d33f.jsonl"
$outDir = "C:\Users\user\Downloads\la_maison_orientale\_transcript_extract"
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue
$serializer.RecursionLimit = 500
$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($script:lineNum -ne 5455) { return }
  $obj = $serializer.DeserializeObject($_)
  foreach ($item in $obj.message.content) {
    if ($item.type -ne "tool_use" -or $item.name -ne "Write") { continue }
    $inp = $item.input
    if ([string]$inp.path -like "*client-portal-hub.css*") {
      [IO.File]::WriteAllText((Join-Path $outDir "client-portal-hub_L5455.css"), [string]$inp.contents, [Text.UTF8Encoding]::new($false))
      Write-Host "extracted L5455 len=$($inp.contents.Length)"
    }
  }
}
