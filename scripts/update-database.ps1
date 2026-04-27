#Requires -Version 5.1
# ======================================================================
# Update Move Database from Microsoft Official Documentation
# Source: github.com/MicrosoftDocs/azure-docs (official MS docs)
# Output: js/move-database.js (updates MOVE_DB_RAW constant)
# Uso: .\scripts\update-database.ps1
# ======================================================================

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $root "js\move-database.js"

$MS_DOCS_URL = "https://raw.githubusercontent.com/MicrosoftDocs/azure-docs/main/articles/azure-resource-manager/management/move-support-resources.md"

Write-Host ""
Write-Host "Update Move Database" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Source: Microsoft Docs (official)" -ForegroundColor Gray
Write-Host "URL:    $MS_DOCS_URL" -ForegroundColor Gray
Write-Host ""

# --- 1. Baixa o markdown da Microsoft ---
Write-Host "Downloading from Microsoft Docs..." -ForegroundColor Yellow
try {
    $markdown = Invoke-WebRequest -Uri $MS_DOCS_URL -UseBasicParsing | Select-Object -ExpandProperty Content
}
catch {
    Write-Host ("ERRO ao baixar: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
}
Write-Host ("  OK - " + [math]::Round($markdown.Length / 1KB, 1) + " KB recebidos") -ForegroundColor Green

# --- 2. Remove blocos de comentario HTML ---
$markdown = [regex]::Replace($markdown, '(?s)<!--.*?-->', '')

# --- 3. Helper: converte celula em 0 ou 1 ---
function ConvertTo-MoveValue {
    param([string]$cell)

    # Remove formatacao markdown
    $clean = $cell -replace '\*\*', '' `
                   -replace '<br/?>', ' ' `
                   -replace '\[([^\]]+)\]\([^)]+\)', '$1' `
                   -replace '\s+', ' '
    $clean = $clean.Trim()

    # Heuristica: se contem "Yes" (case insensitive) e nao e apenas "No", e Yes
    if ($clean -match '(?i)\bYes\b') {
        return 1
    }
    return 0
}

# --- 4. Helper: normaliza nome de tipo com filhos ---
function Format-TypeName {
    param([string]$typeName)
    # Remove parenteses explicativos: "frontdoors (This row is...)" -> "frontdoors"
    $clean = $typeName -replace '\s*\([^)]*\)\s*', ''
    # Remove links markdown: "[text](url)" -> "text"
    $clean = $clean -replace '\[([^\]]+)\]\([^)]+\)', '$1'
    # Remove formatacao
    $clean = $clean -replace '\*\*', ''
    # "parent / child" -> "parent/child"
    $clean = $clean -replace '\s*/\s*', '/'
    # Colapsa espacos
    $clean = $clean -replace '\s+', ' '
    return $clean.Trim()
}

# --- 5. Parse: encontra cada secao "## ProviderNamespace" ---
Write-Host ""
Write-Host "Parsing markdown tables..." -ForegroundColor Yellow

$entries = New-Object System.Collections.Generic.List[PSObject]
$skippedSections = New-Object System.Collections.Generic.List[string]

# Regex para capturar cada secao: ## namespace ate o proximo ## ou fim
$sectionPattern = '(?m)^##\s+(?<ns>[Mm]icrosoft\.[A-Za-z0-9]+)\s*\r?\n(?<body>(?:(?!^##\s)[\s\S])*)'
$sectionMatches = [regex]::Matches($markdown, $sectionPattern)

foreach ($section in $sectionMatches) {
    $namespace = $section.Groups['ns'].Value
    $body = $section.Groups['body'].Value

    # Encontra linhas de tabela: "> | x | y | z | w |"
    # Ignora cabecalho ("Resource type") e separador ("-----")
    $rowPattern = '(?m)^>\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|'
    $rowMatches = [regex]::Matches($body, $rowPattern)

    $foundInSection = 0
    foreach ($row in $rowMatches) {
        $col1 = $row.Groups[1].Value.Trim()
        $col2 = $row.Groups[2].Value.Trim()
        $col3 = $row.Groups[3].Value.Trim()
        $col4 = $row.Groups[4].Value.Trim()

        # Pula cabecalho e separador
        if ($col1 -match '^(Resource type|-+|:?-+:?)$') { continue }
        if ($col1 -match '^[-:\s]+$') { continue }
        if ($col1 -eq '') { continue }
        # Pula linhas que parecem ser separadores
        if ($col2 -match '^[-:\s]+$') { continue }

        $typeName = Format-TypeName $col1

        # Pula tipos invalidos (texto descritivo como "Cognitive Search", "AKS cluster")
        if ($typeName -notmatch '^[a-zA-Z][a-zA-Z0-9]*(/[a-zA-Z][a-zA-Z0-9]*)*$') { continue }

        $fullKey = ($namespace + "/" + $typeName).ToLower()

        $entries.Add([PSCustomObject]@{
            Key       = $fullKey
            MoveRG    = ConvertTo-MoveValue $col2
            MoveSub   = ConvertTo-MoveValue $col3
            MoveRegion = ConvertTo-MoveValue $col4
        })
        $foundInSection++
    }

    if ($foundInSection -eq 0) {
        $skippedSections.Add($namespace)
    }
}

# --- 6. Remove duplicatas (mantem primeiro) ---
$uniqueEntries = $entries | Group-Object -Property Key | ForEach-Object { $_.Group | Select-Object -First 1 }
$dupCount = $entries.Count - $uniqueEntries.Count

Write-Host ("  OK - " + $entries.Count + " linhas parseadas") -ForegroundColor Green
if ($dupCount -gt 0) {
    Write-Host ("  AVISO - " + $dupCount + " duplicatas removidas") -ForegroundColor Yellow
}
if ($skippedSections.Count -gt 0) {
    Write-Host ("  INFO - " + $skippedSections.Count + " secoes sem tabela (provavelmente esperado)") -ForegroundColor Gray
}

# --- 7. Gera CSV ---
Write-Host ""
Write-Host "Generating CSV..." -ForegroundColor Yellow

$csvLines = New-Object System.Collections.Generic.List[string]
foreach ($entry in ($uniqueEntries | Sort-Object Key)) {
    $csvLines.Add(("{0},{1},{2},{3}" -f $entry.Key, $entry.MoveRG, $entry.MoveSub, $entry.MoveRegion))
}
$newCsv = $csvLines -join "`n"

Write-Host ("  OK - " + $csvLines.Count + " entradas geradas") -ForegroundColor Green

# --- 8. Atualiza js/move-database.js ---
Write-Host ""
Write-Host "Updating js/move-database.js..." -ForegroundColor Yellow

if (-not (Test-Path $dbPath)) {
    Write-Host "ERRO: $dbPath nao encontrado" -ForegroundColor Red
    exit 1
}

$jsContent = Get-Content $dbPath -Raw

# Localiza o template literal MOVE_DB_RAW por busca textual (mais robusto que regex)
$marker = "const MOVE_DB_RAW = ``"
$startIdx = $jsContent.IndexOf($marker)
if ($startIdx -lt 0) {
    # Tenta tambem com 'let'
    $marker = "let MOVE_DB_RAW = ``"
    $startIdx = $jsContent.IndexOf($marker)
}
if ($startIdx -lt 0) {
    Write-Host "ERRO: nao foi possivel localizar 'const MOVE_DB_RAW = ' no arquivo" -ForegroundColor Red
    exit 1
}

$contentStart = $startIdx + $marker.Length
$endIdx = $jsContent.IndexOf("``;", $contentStart)
if ($endIdx -lt 0) {
    Write-Host "ERRO: nao foi possivel localizar fim do template literal (``;)" -ForegroundColor Red
    exit 1
}

$updated = $jsContent.Substring(0, $contentStart) + $newCsv + $jsContent.Substring($endIdx)

if ($updated -eq $jsContent) {
    Write-Host "AVISO: conteudo identico ao atual (nada a atualizar)" -ForegroundColor Yellow
    exit 0
}

# Backup do antigo
$backupPath = "$dbPath.bak"
Copy-Item $dbPath $backupPath -Force

# Salva
Set-Content -Path $dbPath -Value $updated -Encoding UTF8 -NoNewline

# Conta entradas antigas para diff
$oldRaw = $jsContent.Substring($contentStart, $endIdx - $contentStart)
$oldCount = ($oldRaw -split "`n" | Where-Object { $_.Trim() -ne '' }).Count

Write-Host ("  OK - js/move-database.js atualizado") -ForegroundColor Green
Write-Host ("  Antes: " + $oldCount + " entradas | Agora: " + $csvLines.Count + " entradas") -ForegroundColor Gray
Write-Host ("  Backup: " + $backupPath) -ForegroundColor Gray

# --- 9. Validacao final: roda o teste de integridade ---
Write-Host ""
Write-Host "Running integrity tests..." -ForegroundColor Yellow
$testScript = Join-Path $PSScriptRoot "test-database.ps1"
if (Test-Path $testScript) {
    & $testScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "AVISO: testes falharam. Revertendo..." -ForegroundColor Red
        Copy-Item $backupPath $dbPath -Force
        Remove-Item $backupPath -Force
        exit 1
    }
}

# Remove backup se tudo OK
Remove-Item $backupPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Update completed successfully!" -ForegroundColor Green
Write-Host ""
