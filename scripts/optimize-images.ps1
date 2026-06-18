# scripts/optimize-images.ps1
# Resize + re-encode PNGs using System.Drawing (no external deps).
# Backups already live in assets/_originals/. Run from repo root.

Add-Type -AssemblyName System.Drawing

function Resize-Png {
    param(
        [string]$InPath,
        [string]$OutPath,
        [int]$MaxWidth,
        [int]$MaxHeight
    )

    $src = [System.Drawing.Image]::FromFile((Resolve-Path $InPath))
    try {
        # Keep aspect ratio
        $ratio = [Math]::Min($MaxWidth / $src.Width, $MaxHeight / $src.Height)
        if ($ratio -gt 1) { $ratio = 1 } # never upscale
        $w = [int][Math]::Round($src.Width  * $ratio)
        $h = [int][Math]::Round($src.Height * $ratio)

        $bmp = New-Object System.Drawing.Bitmap $w, $h
        $bmp.SetResolution(72, 72)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.CompositingQuality   = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.InterpolationMode    = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode        = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode      = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.Clear([System.Drawing.Color]::Transparent)
            $g.DrawImage($src, 0, 0, $w, $h)
        } finally { $g.Dispose() }

        # Save as PNG (System.Drawing strips most ancillary chunks automatically)
        $bmp.Save((Join-Path (Get-Location) $OutPath), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        $newSize = (Get-Item $OutPath).Length
        $oldSize = (Get-Item $InPath).Length
        $savedKB = [Math]::Round(($oldSize - $newSize) / 1KB, 1)
        $pct     = [Math]::Round(($oldSize - $newSize) / $oldSize * 100, 1)
        "  {0,-30}  {1,4}x{2,-4}  {3,7:N1} KB -> {4,7:N1} KB  (-{5} KB, -{6}%)" -f $OutPath, $w, $h, ($oldSize/1KB), ($newSize/1KB), $savedKB, $pct
    } finally { $src.Dispose() }
}

function Resave-Png {
    param([string]$InPath, [string]$OutPath)
    $src = [System.Drawing.Image]::FromFile((Resolve-Path $InPath))
    try {
        $bmp = New-Object System.Drawing.Bitmap $src.Width, $src.Height
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.Clear([System.Drawing.Color]::Transparent)
            $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
        } finally { $g.Dispose() }
        $bmp.Save((Join-Path (Get-Location) $OutPath), [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        $newSize = (Get-Item $OutPath).Length
        $oldSize = (Get-Item $InPath).Length
        "  {0,-30}  resave        {1,7:N1} KB -> {2,7:N1} KB" -f $OutPath, ($oldSize/1KB), ($newSize/1KB)
    } finally { $src.Dispose() }
}

Write-Host "=== Optimizing assets ==="
Write-Host ""
Write-Host "Logo (target 512x512 max):"
Resize-Png -InPath 'assets\_originals\logo.png'     -OutPath 'assets\logo.png'     -MaxWidth 512  -MaxHeight 512
Write-Host ""
Write-Host "OG image (keep 1200x630, just re-encode):"
Resave-Png -InPath 'assets\_originals\og-image.png' -OutPath 'assets\og-image.png'
Write-Host ""
Write-Host "Favicon (keep 128x128 master, add 32x32 variant):"
Resave-Png -InPath 'assets\_originals\favicon.png'  -OutPath 'assets\favicon.png'
Resize-Png -InPath 'assets\_originals\favicon.png'  -OutPath 'assets\favicon-32.png' -MaxWidth 32 -MaxHeight 32
Write-Host ""
Write-Host "=== Done ==="
