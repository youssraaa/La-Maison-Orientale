$AssetsDir = Join-Path $env:APPDATA "Cursor\User\workspaceStorage\empty-window\images"
$FallbackAssetsDir = "C:\Users\user\.cursor\projects\c-Users-user-Downloads-la-maison-orientale\assets"
$DishesDir = Join-Path $PSScriptRoot "..\public\images\dishes"
$PellegrinoDir = "C:\Users\user\Downloads\Nouveau dossier\San Pellegrino Sprankelend water (glas) - verpakkingsgrootte = 12 x 75 cl. _ Amazon.com.be_ Levensmiddelen_files"

$Map = [ordered]@{
  "hommos.jpg" = "houmous-a-la-libanaise"
  "moutabal.jpg" = "moutabal-thermomix"
  "warak-enab.jpg" = "images__1_-"
  "salade-fattouche.jpg" = "images-02cf536b"
  "taboule.jpg" = "e2ed082f41a66612"
  "salade-russe.jpg" = "images__2_-6a7609e1"
  "soupe-lentilles.jpg" = "images__4_-96bf3399"
  "kebbe.jpg" = "images__7_-3bf514fc"
  "fatayer-epinards.jpg" = "8b9ee8d0-f208-4839"
  "fatayer-fromage.jpg" = "images__3_-603e21ad"
  "falafel.jpg" = "images__17_-f5ba7aed"
  "batata-harra.jpg" = "images__5_-572d558f"
  "riz.jpg" = "images__6_-1d502500"
  "boulgour.jpg" = "Sehriyeli_bulgur_pilav"
  "durum-shawarma.jpg" = "images__9_-235221d3"
  "durum-shawarma-frites.jpg" = "images__16_-f97b8f4e"
  "durum-pane.jpg" = "images__15_-97314e7e"
  "durum-falafel.jpg" = "images__10_-6d527955"
  "durum-kefta.jpg" = "images__11_-3b7c0a6f"
  "durum-brochette-boeuf.jpg" = "images__19_-5186d16e"
  "durum-brochette-agneau.jpg" = "images__18_-443d70a9"
  "durum-brochette-poulet.jpg" = "images__8_-8ebd8fac"
  "sandwich-shawarma.jpg" = "images__15_-97314e7e"
  "plat-shawarma.png" = "3-CHAWARMA-PLAT"
  "plat-shawarma-arabi.png" = "HBJB-43db1eaf"
  "shawarma-extra.png" = "HBJB-43db1eaf"
  "plat-falafel-arabi.png" = "51d0a4e9-c4f5-4714"
  "sandwich-brochette-poulet.jpg" = "images__8_-8ebd8fac"
  "sandwich-brochette-boeuf.jpg" = "images__19_-5186d16e"
  "sandwich-brochette-agneau.jpg" = "97821-BROODJE-VLEESBROODJE"
  "sandwich-kefta.jpg" = "images__20_-fab6c0e9"
  "hamburger-boeuf.jpg" = "images__21_-de868a9e"
  "hamburger-poulet.jpg" = "images__22_-db5676aa"
  "filet-poulet.jpg" = "images__23_-65c238fb"
  "frites.jpg" = "images__24_-dc107982"
  "sauce-ail.jpg" = "images__26_-1c8dc716"
  "sauce-ketchup.jpg" = "images__27_-8aef398a"
  "sauce-mayo.jpg" = "images__28_-368e742a"
  "sauce-algerienne.jpg" = "images__29_-3c6dadfe"
  "sauce-samourai.jpg" = "images__30_-1eba962f"
  "sauce-andalouse.jpg" = "images__31_-df3abe5c"
  "sauce-barbecue.jpg" = "images__32_-542b5a8b"
  "sauce-americaine.jpg" = "images__33_-8181aee6"
  "sauce-tartare.jpg" = "images__34_-2ce11311"
  "sauce-harissa.jpg" = "images__35_-36a3bdfb"
  "sauce-curry.jpg" = "images__36_-d3f5b26b"
  "sauce-bresilienne.jpg" = "Brazil-sauce-Anda"
  "cotelettes-agneau.png" = "images__37_-35a08661"
  "kefta-aubergines.png" = "images__38_-7df997fb"
  "brochettes-agneau.jpg" = "images__40_-25427f06"
  "brochettes-boeuf.png" = "images__13_-c270af2f"
  "brochettes-kefta.jpg" = "images (12)-e6d57062"
  "brochettes-poulet.jpg" = "images__42_-216e077a"
  "ailes-poulet.jpg" = "images__43_-b5206b1d"
  "pilons-poulet.jpg" = "images__44_-ff08f11f"
  "brochettes-mixte.png" = "images__45_-e3180a05"
  "grillade-1kg.png" = "images__47_-4039ad9c"
  "grand-plateau.png" = "images__46_-c1669816"
  "espresso.jpg" = "images__48_-6787cd63"
  "double-expresso.jpg" = "images__49_-2b07c114"
  "cafe-syrien.jpg" = "images__51_-6090b01f"
  "cafe.jpg" = "images__50_-aaee635c"
  "cappuccino.jpg" = "images__52_-7c916ef1"
  "the-menthe.jpg" = "images__53_-469e35d8"
  "the-noir.jpg" = "images__54_-a0ac8d24"
  "eau-plate.jpg" = "51BcVYSpbCL._AC_SX679_"
  "eau-petillante.jpg" = "516R1TEaX-L._AC_SL1000_"
  "coca.jpg" = "s-l500-12b18e8f"
  "fanta.jpg" = "SP-14290-1-52f7e201"
  "sprite.jpg" = "t_l_chargement-663e4560"
  "ice-tea.jpg" = "61gNuKiTIDL._AC_SL1500_"
  "tropical.jpg" = "51bJvn8dnUL._AC_SY300"
  "schweppes.jpg" = "schweppes-agrum-boite"
  "soft-bouteilles.png" = "7-raisons-de-bannir-les-sodas-e2daee3e"
  "soft-canettes.png" = "images__56_-7aeb501f"
  "soft-eau.png" = "images__57_-b0163185"
  "red-bull.jpg" = "red-bull-png-red-bull"
  "uludag.jpg" = "33afbced-1918-4a0c"
}

function Find-Asset($needle) {
  foreach ($dir in @($AssetsDir, $FallbackAssetsDir)) {
    if (-not (Test-Path $dir)) { continue }
    $hit = Get-ChildItem -Path $dir -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*$needle*" } | Select-Object -First 1
    if ($hit) { return $hit }
  }
  return $null
}

New-Item -ItemType Directory -Force -Path $DishesDir | Out-Null

$ok = 0
$fail = @()

foreach ($entry in $Map.GetEnumerator()) {
  $dest = Join-Path $DishesDir $entry.Key
  $asset = Find-Asset $entry.Value
  if (-not $asset) {
    $fail += "$($entry.Key) <= $($entry.Value)"
    continue
  }
  Copy-Item -Path $asset.FullName -Destination $dest -Force
  Write-Host "OK $($entry.Key) <- $($asset.Name)"
  $ok++
}

$pellegrino = Join-Path $PellegrinoDir "516R1TEaX-L._AC_SL1000_.jpg"
if (Test-Path $pellegrino) {
  Copy-Item $pellegrino (Join-Path $DishesDir "eau-petillante.jpg") -Force
  Write-Host "OK eau-petillante.jpg <- San Pellegrino Amazon JPG"
  $ok++
}

$boulgourDest = Join-Path $DishesDir "boulgour.jpg"
if (-not (Test-Path $boulgourDest) -or (Get-Item $boulgourDest).Length -lt 50000) {
  $boulgourUrl = "https://upload.wikimedia.org/wikipedia/commons/2/2d/Sehriyeli_bulgur_pilav.jpg"
  try {
    curl.exe -L -s -A "Mozilla/5.0" -o $boulgourDest $boulgourUrl
    if ((Get-Item $boulgourDest).Length -gt 50000) {
      Write-Host "OK boulgour.jpg <- Wikimedia bulgur pilaf"
      $ok++
    }
  } catch {
    Write-Host "WARN boulgour.jpg non copié (Wikimedia)"
  }
}

Write-Host "`nCopied: $ok"
if ($fail.Count) {
  Write-Host "Missing:"
  $fail | ForEach-Object { Write-Host "  $_" }
  # boulgour peut être récupéré via Wikimedia même si absent du dossier Cursor
  $fail = $fail | Where-Object { $_ -notlike "boulgour.jpg*" }
  if ($fail.Count -eq 0) { exit 0 }
  exit 1
}

exit 0
