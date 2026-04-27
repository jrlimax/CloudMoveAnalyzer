#Requires -Version 5.1
# ======================================================================
# Script de Minificacao - Cloud Move Analyzer
# Uso: .\minify.ps1
# Gera versoes .min.css e .min.js dos arquivos do site
# ======================================================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host ""
Write-Host "Iniciando minificacao..." -ForegroundColor Cyan

# --- Funcao: Minificar CSS ---
function Convert-Css {
    param([string]$content)

    $content = [regex]::Replace($content, '/\*[\s\S]*?\*/', '')
    $content = [regex]::Replace($content, '\s*([{}:;,>+~])\s*', '$1')
    $content = [regex]::Replace($content, ';}', '}')
    $content = [regex]::Replace($content, '\s+', ' ')
    $content = $content -replace "`r?`n", ''
    return $content.Trim()
}

# --- Funcao: Minificar JS (conservador) ---
function Convert-Js {
    param([string]$content)

    # Remove comentarios multilinha /* ... */ (preserva /*! para licencas)
    $content = [regex]::Replace($content, '/\*(?!\!)[\s\S]*?\*/', '')

    # Remove comentarios de linha (heuristica simples por linha)
    $lines = $content -split "`n"
    $cleaned = New-Object System.Collections.Generic.List[string]
    foreach ($line in $lines) {
        $idx = -1
        $inString = $false
        $stringChar = ''
        for ($i = 0; $i -lt $line.Length - 1; $i++) {
            $c = $line[$i]
            if (-not $inString -and ($c -eq '"' -or $c -eq "'" -or $c -eq '`')) {
                $inString = $true
                $stringChar = $c
            }
            elseif ($inString -and $c -eq $stringChar -and ($i -eq 0 -or $line[$i - 1] -ne '\')) {
                $inString = $false
            }
            elseif (-not $inString -and $c -eq '/' -and $line[$i + 1] -eq '/') {
                $idx = $i
                break
            }
        }
        if ($idx -ge 0) {
            $line = $line.Substring(0, $idx)
        }
        $trimmed = $line.TrimEnd()
        if ($trimmed -ne '') {
            $cleaned.Add($trimmed)
        }
    }

    $result = ($cleaned -join "`n")
    # Remove indentacao inicial
    $result = [regex]::Replace($result, '(?m)^\s+', '')
    # Remove espacos em torno de simbolos
    $result = [regex]::Replace($result, '\s*([{}();,:=<>+\-*/&|!?])\s*', '$1')
    # Restaura espacos criticos apos palavras-chave
    $keywords = @('return', 'var', 'let', 'const', 'function', 'typeof', 'new', 'delete', 'in', 'of', 'instanceof', 'throw', 'await', 'async', 'yield', 'else', 'case', 'void')
    foreach ($kw in $keywords) {
        $result = [regex]::Replace($result, "\b$kw\b(?=[a-zA-Z_\$])", "$kw ")
    }
    return $result
}

# --- Funcao: Processar arquivo ---
function Invoke-MinifyFile {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [string]$Type
    )

    if (-not (Test-Path $InputPath)) {
        Write-Host ("  Nao encontrado: " + $InputPath) -ForegroundColor Yellow
        return
    }

    $original = Get-Content $InputPath -Raw -Encoding UTF8
    $originalSize = [System.Text.Encoding]::UTF8.GetByteCount($original)

    if ($Type -eq 'css') {
        $minified = Convert-Css $original
    }
    else {
        $minified = Convert-Js $original
    }

    $minifiedSize = [System.Text.Encoding]::UTF8.GetByteCount($minified)
    $savings = [math]::Round((1 - $minifiedSize / $originalSize) * 100, 1)

    Set-Content -Path $OutputPath -Value $minified -Encoding UTF8 -NoNewline

    $name = Split-Path $InputPath -Leaf
    $origKb = [math]::Round($originalSize / 1KB, 1)
    $minKb = [math]::Round($minifiedSize / 1KB, 1)
    $msg = "  OK  {0,-25} {1,8} KB -> {2,8} KB  (-{3}%)" -f $name, $origKb, $minKb, $savings
    Write-Host $msg -ForegroundColor Green
}

# --- Processar CSS ---
Write-Host ""
Write-Host "CSS:" -ForegroundColor Magenta
Invoke-MinifyFile "$root\css\style.css" "$root\css\style.min.css" 'css'

# --- Processar JS ---
Write-Host ""
Write-Host "JavaScript:" -ForegroundColor Magenta
$jsFiles = @('app.js', 'i18n.js', 'move-database.js', 'set-lang.js')
foreach ($js in $jsFiles) {
    $inputPath = "$root\js\$js"
    $outputPath = "$root\js\$($js -replace '\.js$', '.min.js')"
    Invoke-MinifyFile $inputPath $outputPath 'js'
}

Write-Host ""
Write-Host "Minificacao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Para usar os arquivos minificados, atualize o index.html:" -ForegroundColor Cyan
Write-Host '   <link rel="stylesheet" href="css/style.min.css">' -ForegroundColor Gray
Write-Host '   <script src="js/app.min.js"></script>' -ForegroundColor Gray
Write-Host ""
Write-Host "Recomendacao: teste o site apos trocar para os arquivos .min" -ForegroundColor Yellow
Write-Host "Mantenha os arquivos originais para edicao." -ForegroundColor Yellow
Write-Host ""
