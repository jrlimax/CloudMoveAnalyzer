Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Drawing2D

$W = 1200; $H = 630
$LogoPath = "c:\Users\jose.lima\Documents\projetinho\assets\logo.png"
$OutPath  = "c:\Users\jose.lima\Documents\projetinho\assets\og-image.png"

$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Background: diagonal gradient #0D0B1E -> #16132B
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255,13,11,30)), ([System.Drawing.Color]::FromArgb(255,22,19,43)), 45
$g.FillRectangle($bg, $rect)
$bg.Dispose()

# Top radial purple glow
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(-200, -380, ($W + 400), 760)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
$pgb.CenterPoint = New-Object System.Drawing.PointF (($W/2), -100)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(140,139,92,246)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0,139,92,246))
$g.FillPath($pgb, $path)
$pgb.Dispose(); $path.Dispose()

# Bottom-right green glow
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse(($W - 500), ($H - 200), 800, 600)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
$pgb.CenterPoint = New-Object System.Drawing.PointF ([float]$W, [float]$H)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(45,34,214,143)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0,34,214,143))
$g.FillPath($pgb, $path)
$pgb.Dispose(); $path.Dispose()

# Subtle dotted grid
$dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18,139,92,246))
for ($y = 22; $y -lt $H; $y += 22) {
  for ($x = 22; $x -lt $W; $x += 22) {
    $g.FillEllipse($dotBrush, $x, $y, 2, 2)
  }
}
$dotBrush.Dispose()

# Logo with purple glow halo
$logo = [System.Drawing.Image]::FromFile($LogoPath)
$logoSize = 340
$logoX = 90
$logoY = [int](($H - $logoSize) / 2) - 10

$haloD = 460
$haloX = $logoX + ($logoSize - $haloD) / 2
$haloY = $logoY + ($logoSize - $haloD) / 2
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddEllipse($haloX, $haloY, $haloD, $haloD)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $path
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(110,139,92,246)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0,139,92,246))
$g.FillPath($pgb, $path)
$pgb.Dispose(); $path.Dispose()

$g.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)
$logo.Dispose()

# Text block on the right
$textX = 510
$brushAccent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,34,214,143))
$brushMuted  = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,200,194,222))
$brushDomain = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255,243,238,255))

$fontEyebrow = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold)
$fontTitle   = New-Object System.Drawing.Font 'Segoe UI', 44, ([System.Drawing.FontStyle]::Bold)
$fontPara    = New-Object System.Drawing.Font 'Segoe UI', 18, ([System.Drawing.FontStyle]::Regular)
$fontDomain  = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Bold)
$fontPill    = New-Object System.Drawing.Font 'Segoe UI', 13, ([System.Drawing.FontStyle]::Bold)

$g.DrawString("CLOUD MOVE ANALYZER", $fontEyebrow, $brushAccent, $textX, 150)

# Gradient title (purple -> green)
$titleRect = New-Object System.Drawing.RectangleF $textX, 195, ($W - $textX - 90), 160
$titleBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $titleRect, ([System.Drawing.Color]::FromArgb(255,139,92,246)), ([System.Drawing.Color]::FromArgb(255,34,214,143)), 35
$g.DrawString("Azure Resource", $fontTitle, $titleBrush, $textX, 195)
$g.DrawString("Move Checker",   $fontTitle, $titleBrush, $textX, 265)
$titleBrush.Dispose()

# Paragraph
$g.DrawString("Upload your Azure export and instantly see which`r`nresources can be moved between subscriptions,`r`nresource groups, and regions.", $fontPara, $brushMuted, $textX, 360)

# Footer left: domain
$g.DrawString("cloudmoveanalyzer.com", $fontDomain, $brushDomain, 90, ($H - 54))

# Footer right: pill
$pillText = "100% Free  -  No signup"
$pillW = 220; $pillH = 38
$pillX = $W - 90 - $pillW
$pillY = $H - 60
$pillRectF = New-Object System.Drawing.RectangleF $pillX, $pillY, $pillW, $pillH
$pillFill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38,34,214,143))
$pillStroke = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(115,34,214,143)), 1.5
$pathP = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = $pillH
$pathP.AddArc($pillX, $pillY, $r, $r, 90, 180)
$pathP.AddArc(($pillX + $pillW - $r), $pillY, $r, $r, 270, 180)
$pathP.CloseFigure()
$g.FillPath($pillFill, $pathP)
$g.DrawPath($pillStroke, $pathP)
$fmt = New-Object System.Drawing.StringFormat
$fmt.Alignment = [System.Drawing.StringAlignment]::Center
$fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString($pillText, $fontPill, $brushAccent, $pillRectF, $fmt)
$pillFill.Dispose(); $pillStroke.Dispose(); $pathP.Dispose()

$bmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
Write-Host "Saved $OutPath"
