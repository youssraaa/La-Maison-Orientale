$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$DishesDir = Join-Path $Root "public\images\dishes"
$MenuFile = Join-Path $Root "src\features\menu\data\menuData.js"
$DishImagesFile = Join-Path $Root "src\features\order\utils\dishImages.js"

# Parse menu item names from menuData.js
$menuContent = Get-Content $MenuFile -Raw
$names = [regex]::Matches($menuContent, 'name:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique

# Parse EXACT_IMAGES from dishImages.js
$dishContent = Get-Content $DishImagesFile -Raw
$exactMatches = [regex]::Matches($dishContent, '(?m)^\s*(?:"([^"]+)"|(\w+)):\s*`\$\{BASE\}/([^`]+)`')
$exactLookup = @{}
foreach ($m in $exactMatches) {
  $key = if ($m.Groups[1].Success) { $m.Groups[1].Value } else { $m.Groups[2].Value }
  $exactLookup[$key] = $m.Groups[3].Value
}

$fallbacks = @("entree-froide.jpg","entree-chaude.jpg","shawarma.jpg","sauces.jpg","grill-plat.jpg","cafe-hot.jpg","boisson.jpg")

$mapped = 0
$fallback = 0
$missingFile = 0
$noMapping = 0
$problems = @()

foreach ($name in $names) {
  if ($exactLookup.ContainsKey($name)) {
    $file = $exactLookup[$name]
    $path = Join-Path $DishesDir $file
    if (-not (Test-Path $path)) {
      $missingFile++
      $problems += [pscustomobject]@{ name = $name; file = $file; issue = "file missing" }
    } elseif ($fallbacks -contains $file) {
      $fallback++
      $problems += [pscustomobject]@{ name = $name; file = $file; issue = "fallback image" }
    } else {
      $mapped++
    }
  } else {
    $noMapping++
    $problems += [pscustomobject]@{ name = $name; issue = "no exact mapping in dishImages.js" }
  }
}

# All referenced files
$allRefs = [regex]::Matches($dishContent, '\$\{BASE\}/([^`"]+)') | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
$missingRefs = @()
foreach ($ref in $allRefs) {
  if (-not (Test-Path (Join-Path $DishesDir $ref))) { $missingRefs += $ref }
}

Write-Host "=== DISH IMAGE VALIDATION ==="
Write-Host "Total unique menu items: $($names.Count)"
Write-Host "Mapped with dedicated image: $mapped"
Write-Host "No exact mapping: $noMapping"
Write-Host "Missing file on disk: $missingFile"
Write-Host "Using fallback image: $fallback"
Write-Host "Referenced files in dishImages.js: $($allRefs.Count)"
Write-Host "Missing referenced files: $($missingRefs.Count)"
if ($missingRefs.Count) { $missingRefs | ForEach-Object { Write-Host "  MISSING REF: $_" } }
if ($problems.Count) {
  Write-Host "`nProblems:"
  $problems | Format-Table -AutoSize
}

exit $(if ($missingFile -gt 0 -or $missingRefs.Count -gt 0 -or $noMapping -gt 0) { 1 } else { 0 })
