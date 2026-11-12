# Télécharge les photos de plats dans public/images/dishes/
$ErrorActionPreference = "Continue"
$DishesDir = Join-Path $PSScriptRoot "..\public\images\dishes"
$ImagesDir = Join-Path $PSScriptRoot "..\public\images"
New-Item -ItemType Directory -Force -Path $DishesDir | Out-Null

function Get-UnsplashUrl($photoId) {
    "https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&h=600&q=85"
}

$Catalog = @{
    # Entrées froides
    "hommos.jpg" = Get-UnsplashUrl "photo-1697126248437-db26a30024c5"
    "moutabal.jpg" = Get-UnsplashUrl "photo-1626077890529-8a496b245392"
    "warak-enab.jpg" = Get-UnsplashUrl "photo-1608897019856-a30c380a558b"
    "salade-fattouche.jpg" = Get-UnsplashUrl "photo-1540189549336-e6e99c3679fe"
    "taboule.jpg" = Get-UnsplashUrl "photo-1512621776951-a57141f2eefd"
    "salade-russe.jpg" = Get-UnsplashUrl "photo-1621996346565-e3dbc646d9a9"

    # Entrées chaudes
    "soupe-lentilles.jpg" = Get-UnsplashUrl "photo-1547592166-23ac45744acd"
    "kebbe.jpg" = Get-UnsplashUrl "photo-1606491956689-2a7f724ee6e8"
    "fatayer-epinards.jpg" = Get-UnsplashUrl "photo-1625944232933-1b4e5d5d7c5a"
    "fatayer-fromage.jpg" = Get-UnsplashUrl "photo-1565299624946-b28f40a0ae38"
    "falafel.jpg" = Get-UnsplashUrl "photo-1601059889840-532ec958922b"
    "batata-harra.jpg" = Get-UnsplashUrl "photo-1573080496218-b4207844c210"
    "riz.jpg" = Get-UnsplashUrl "photo-1516684669134-6d309b9aebff"
    "boulgour.jpg" = Get-UnsplashUrl "photo-1585937421612-70a008356fbe"

    # Sandwichs
    "durum-shawarma.jpg" = Get-UnsplashUrl "photo-1529006557810-274b9b2fc783"
    "durum-shawarma-frites.jpg" = Get-UnsplashUrl "photo-1565299500777-7900b128c5a7"
    "durum-pane.jpg" = Get-UnsplashUrl "photo-1626700051175-6818013e2746"
    "durum-falafel.jpg" = Get-UnsplashUrl "photo-1529008757458-e93567936643"
    "durum-kefta.jpg" = Get-UnsplashUrl "photo-1529042410759-b054120bf034"
    "durum-brochette-boeuf.jpg" = Get-UnsplashUrl "photo-1558030006-450675393462"
    "durum-brochette-agneau.jpg" = Get-UnsplashUrl "photo-1529692236678-f1f6cf9683ba"
    "durum-brochette-poulet.jpg" = Get-UnsplashUrl "photo-1527477396000-e27137a04610"
    "sandwich-shawarma.jpg" = Get-UnsplashUrl "photo-1551782450-17144efb9c50"
    "sandwich-brochette-poulet.jpg" = Get-UnsplashUrl "photo-1527477396000-e27137a04610"
    "sandwich-brochette-boeuf.jpg" = Get-UnsplashUrl "photo-1555939594-58d7cb561ad1"
    "sandwich-brochette-agneau.jpg" = Get-UnsplashUrl "photo-1544025162-d766942659677"
    "sandwich-kefta.jpg" = Get-UnsplashUrl "photo-1594212699903-ecda27e9f9a0"
    "hamburger-boeuf.jpg" = Get-UnsplashUrl "photo-1568901346735-8664a4040476"
    "hamburger-poulet.jpg" = Get-UnsplashUrl "photo-1606755962773-d324e166a853"
    "filet-poulet.jpg" = Get-UnsplashUrl "photo-1626082927389-6a091a0dc1d9"
    "frites.jpg" = Get-UnsplashUrl "photo-1573080496218-b4207844c210"

    # Plats grillades
    "brochettes-agneau.jpg" = Get-UnsplashUrl "photo-1544025162-d766942659677"
    "brochettes-kefta.jpg" = Get-UnsplashUrl "photo-1594212699903-ecda27e9f9a0"
    "brochettes-poulet.jpg" = Get-UnsplashUrl "photo-1527477396000-e27137a04610"
    "ailes-poulet.jpg" = Get-UnsplashUrl "photo-1608030895225-85391d787a06"
    "pilons-poulet.jpg" = Get-UnsplashUrl "photo-1626082927389-6a091a0dc1d9"

    # Sauces
    "sauces.jpg" = Get-UnsplashUrl "photo-1472476446867-d7fbf518c7d8"

    # Boissons chaudes
    "espresso.jpg" = Get-UnsplashUrl "photo-1514434788744-10676d2829f2"
    "cafe-syrien.jpg" = Get-UnsplashUrl "photo-1495474472287-4d71bcdd2085"
    "cafe.jpg" = Get-UnsplashUrl "photo-1509042239860-f550ce710b93"
    "cappuccino.jpg" = Get-UnsplashUrl "photo-1572442383556-681c3d7230f1"
    "the-noir.jpg" = Get-UnsplashUrl "photo-1556679343-c7306c1976bc"

    # Soft
    "eau.jpg" = Get-UnsplashUrl "photo-1523362625819-17cdcde7502e"
    "coca.jpg" = Get-UnsplashUrl "photo-1622483760728-bb135ace6379"
    "fanta.jpg" = Get-UnsplashUrl "photo-1624517452498-0486928992cc"
    "sprite.jpg" = Get-UnsplashUrl "photo-1625772452277-0431c4a2a9a0"
    "ice-tea.jpg" = Get-UnsplashUrl "photo-1556679343-c7306c1976bc"
    "red-bull.jpg" = Get-UnsplashUrl "photo-1558618666-fcd25c85cd64"
    "ayran.jpg" = Get-UnsplashUrl "photo-1571212515417-7a6c9a4e8b1e"
    "schweppes.jpg" = Get-UnsplashUrl "photo-1625772452277-0431c4a2a9a0"
    "tropical.jpg" = Get-UnsplashUrl "photo-1624517452498-0486928992cc"
    "uludag.jpg" = Get-UnsplashUrl "photo-1625772452277-0431c4a2a9a0"
    "looza.jpg" = Get-UnsplashUrl "photo-1624517452498-0486928992cc"
}

$LocalCopies = @{
    "plat-shawarma.png" = "shawarma-board.png"
    "plat-shawarma-arabi.png" = "grill-feast.png"
    "shawarma-extra.png" = "mixed-grill.png"
    "plat-falafel-arabi.png" = "falafel-bowl.png"
    "cotelettes-agneau.png" = "lamb-platters.png"
    "kefta-aubergines.png" = "kofta-box.png"
    "brochettes-boeuf.png" = "skewers-prep.png"
    "brochettes-mixte.png" = "mixed-grill.png"
    "grillade-1kg.png" = "grill-platter.png"
    "grand-plateau.png" = "mezze-platter.png"
    "the-menthe.png" = "drinks-mint.png"
}

$ok = 0
$fail = 0

foreach ($entry in $Catalog.GetEnumerator()) {
    $dest = Join-Path $DishesDir $entry.Key
    try {
        curl.exe -fsSL -o $dest $entry.Value
        if ((Get-Item $dest).Length -lt 5000) { throw "Fichier trop petit" }
        Write-Host "OK $($entry.Key)"
        $ok++
    } catch {
        Write-Host "FAIL $($entry.Key): $_"
        $fail++
    }
}

foreach ($entry in $LocalCopies.GetEnumerator()) {
    $src = Join-Path $ImagesDir $entry.Value
    $dest = Join-Path $DishesDir $entry.Key
    if (Test-Path $src) {
        Copy-Item -Force $src $dest
        Write-Host "COPY $($entry.Key)"
        $ok++
    } else {
        Write-Host "MISSING local $($entry.Value)"
        $fail++
    }
}

Write-Host "`nDone: $ok OK, $fail failed"
