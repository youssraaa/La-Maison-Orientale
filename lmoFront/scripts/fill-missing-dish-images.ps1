# Complète les images manquantes via Pexels (licence libre)
$DishesDir = "c:\Users\user\Downloads\la_maison_orientale\lmoFront\public\images\dishes"

function Get-Pexels($id) {
    "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&w=900&h=600&fit=crop"
}

$Pexels = @{
    "warak-enab.jpg" = Get-Pexels 723198          # dolmas / stuffed leaves style
    "batata-harra.jpg" = Get-Pexels 1893556       # fries / potatoes
    "fatayer-epinards.jpg" = Get-Pexels 2430747   # pastry
    "riz.jpg" = Get-Pexels 723198                 # rice bowl
    "frites.jpg" = Get-Pexels 1893556
    "durum-falafel.jpg" = Get-Pexels 1283219
    "espresso.jpg" = Get-Pexels 302899
    "cappuccino.jpg" = Get-Pexels 2059131
    "eau.jpg" = Get-Pexels 416528
    "coca.jpg" = Get-Pexels 50593
    "fanta.jpg" = Get-Pexels 50597
    "sprite.jpg" = Get-Pexels 50597
    "ayran.jpg" = Get-Pexels 533280
    "hamburger-boeuf.jpg" = Get-Pexels 1633578
    "hamburger-poulet.jpg" = Get-Pexels 1639560
    "ailes-poulet.jpg" = Get-Pexels 60616
    "pilons-poulet.jpg" = Get-Pexels 2233348
    "filet-poulet.jpg" = Get-Pexels 60649
    "schweppes.jpg" = Get-Pexels 50597
    "tropical.jpg" = Get-Pexels 1431335
    "uludag.jpg" = Get-Pexels 50597
    "looza.jpg" = Get-Pexels 1431335
}

foreach ($entry in $Pexels.GetEnumerator()) {
    $dest = Join-Path $DishesDir $entry.Key
    if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 8000) {
        Write-Host "SKIP $($entry.Key)"
        continue
    }
    curl.exe -fsSL -L -o $dest $entry.Value
    if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 8000) {
        Write-Host "OK $($entry.Key)"
    } else {
        Write-Host "FAIL $($entry.Key)"
        if (Test-Path $dest) { Remove-Item $dest -Force }
    }
}

Write-Host "Done"
