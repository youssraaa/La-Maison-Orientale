$ErrorActionPreference = "Stop"
$path = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\agent-transcripts\06f1cef6-9f1e-4151-973b-84fc0b36d33f\06f1cef6-9f1e-4151-973b-84fc0b36d33f.jsonl"
$outDir = "C:\Users\user\Downloads\la_maison_orientale\_transcript_extract"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$targets = @{}
$targets["ClientPortalLayout.jsx"] = $null
$targets["ClientDashboardPage.jsx"] = $null
$targets["client-portal-hub.css"] = $null

$redesignLine = $null
$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($_ -match "suppression de la double navigation") {
    $script:redesignLine = $script:lineNum
  }
}
Write-Host "redesign_line $redesignLine"

$lineNum = 0
Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($redesignLine -and $script:lineNum -ge $redesignLine) { return }

  if ($_ -notmatch '"tool_use"') { return }

  # Extract all tool_use blocks from line via regex on raw JSON
  $matches = [regex]::Matches($_, '"name":"(Write|StrReplace)"[^}]*?"input":(\{.*?\})(?=,"|\}\])', 'Singleline')
  if ($matches.Count -eq 0) {
    # fallback: whole line parse with increased depth
    try {
      $obj = $_ | ConvertFrom-Json -Depth 200
    } catch { return }
    $content = $obj.message.content
    if (-not $content) { return }
    foreach ($item in $content) {
      if ($item.type -ne "tool_use") { continue }
      $name = $item.name
      $inp = $item.input
      if (-not $inp) { continue }
      $p = [string]$inp.path
      $key = $null
      foreach ($k in $targets.Keys) {
        if ($p -like "*$k*") { $key = $k; break }
      }
      if (-not $key) { continue }
      if ($name -eq "Write" -and $inp.contents) {
        $targets[$key] = [string]$inp.contents
      } elseif ($name -eq "StrReplace" -and $targets[$key]) {
        $old = [string]$inp.old_string
        $new = [string]$inp.new_string
        if ($targets[$key].Contains($old)) {
          $targets[$key] = $targets[$key].Replace($old, $new)
        }
      }
    }
    return
  }
}

# simpler: line-by-line json parse with .NET
Add-Type -AssemblyName System.Web.Extensions
$serializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$serializer.MaxJsonLength = [int]::MaxValue
$serializer.RecursionLimit = 500

$lineNum = 0
$targets["ClientPortalLayout.jsx"] = $null
$targets["ClientDashboardPage.jsx"] = $null
$targets["client-portal-hub.css"] = $null

Get-Content -Path $path -Encoding UTF8 | ForEach-Object {
  $script:lineNum++
  if ($redesignLine -and $script:lineNum -ge $redesignLine) { return }
  try {
    $obj = $serializer.DeserializeObject($_)
  } catch { return }
  $content = $obj.message.content
  if (-not $content) { return }
  foreach ($item in $content) {
    if ($item.type -ne "tool_use") { continue }
    $name = $item.name
    $inp = $item.input
    if (-not $inp) { continue }
    $p = [string]$inp.path
    $key = $null
    foreach ($k in $targets.Keys) {
      if ($p -like "*$k*") { $key = $k; break }
    }
    if (-not $key) { continue }
    if ($name -eq "Write" -and $inp.contents) {
      $targets[$key] = [string]$inp.contents
    } elseif ($name -eq "StrReplace" -and $targets[$key]) {
      $old = [string]$inp.old_string
      $new = [string]$inp.new_string
      if ($targets[$key].Contains($old)) {
        $targets[$key] = $targets[$key].Replace($old, $new)
      }
    }
  }
}

foreach ($k in $targets.Keys) {
  $file = Join-Path $outDir $k
  if ($targets[$k]) {
    [IO.File]::WriteAllText($file, $targets[$k], [Text.UTF8Encoding]::new($false))
    Write-Host "WROTE $file len $($targets[$k].Length)"
  } else {
    Write-Host "MISSING $k"
  }
}

# marker check
foreach ($k in $targets.Keys) {
  if (-not $targets[$k]) { continue }
  $v = $targets[$k]
  $checks = @()
  if ($k -eq "ClientPortalLayout.jsx") {
    foreach ($m in @("PublicNavbar","client-portal__nav-head","EXTRA_LINKS","Vue d'ensemble")) {
      if ($v -like "*$m*") { $checks += $m } else { $checks += "MISSING:$m" }
    }
  }
  if ($k -eq "ClientDashboardPage.jsx") {
    foreach ($m in @("client-home--hub","SPACE_LINKS","summary-card")) {
      if ($v -like "*$m*") { $checks += $m } else { $checks += "MISSING:$m" }
    }
  }
  if ($k -eq "client-portal-hub.css") {
    foreach ($m in @("#fff8dc","client-portal__nav-head")) {
      if ($v -like "*$m*") { $checks += $m } else { $checks += "MISSING:$m" }
    }
  }
  Write-Host "$k markers: $($checks -join ', ')"
}
