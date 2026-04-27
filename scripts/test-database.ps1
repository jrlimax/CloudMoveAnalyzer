#Requires -Version 5.1
# ======================================================================
# Database Integrity Test - Cloud Move Analyzer
# Validates js/move-database.js without requiring Node.js
# Uso: .\scripts\test-database.ps1
# ======================================================================

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $root "js\move-database.js"

if (-not (Test-Path $dbPath)) {
    Write-Host "ERRO: Arquivo nao encontrado: $dbPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Database Integrity Tests" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

$content = Get-Content $dbPath -Raw

# Extrai o bloco MOVE_DB_RAW
$rawMatch = [regex]::Match($content, "(?s)const\s+MOVE_DB_RAW\s*=\s*``(.+?)``;")
if (-not $rawMatch.Success) {
    Write-Host "FALHA: MOVE_DB_RAW nao encontrado" -ForegroundColor Red
    exit 1
}
$rawCsv = $rawMatch.Groups[1].Value

$lines = $rawCsv -split "`n" | Where-Object { $_.Trim() -ne '' }
$entries = @()
$failures = @()
$passed = 0
$total = 0

# --- Helper para cada teste ---
function Test-Assertion {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    $script:total++
    try {
        $result = & $Test
        if ($result -eq $true) {
            Write-Host ("  [PASS] " + $Name) -ForegroundColor Green
            $script:passed++
        }
        else {
            Write-Host ("  [FAIL] " + $Name) -ForegroundColor Red
            if ($result -is [string]) {
                Write-Host ("         " + $result) -ForegroundColor Yellow
            }
            $script:failures += $Name
        }
    }
    catch {
        Write-Host ("  [ERROR] " + $Name + " - " + $_.Exception.Message) -ForegroundColor Red
        $script:failures += $Name
    }
}

# --- Parse ---
Write-Host "Parsing..." -ForegroundColor Magenta
foreach ($line in $lines) {
    $parts = $line.Trim() -split ','
    if ($parts.Length -ge 4 -and $parts[0] -match '/') {
        $entries += [PSCustomObject]@{
            Key       = $parts[0].Trim().ToLower()
            MoveRG    = [int]$parts[1]
            MoveSub   = [int]$parts[2]
            MoveRegion = [int]$parts[3]
        }
    }
}
Write-Host ("  {0} entradas parseadas" -f $entries.Count) -ForegroundColor Gray
Write-Host ""

# --- Tests ---
Write-Host "Validacao:" -ForegroundColor Magenta

Test-Assertion "Database parseia sem erros" {
    $entries.Count -gt 0
}

Test-Assertion "Tem pelo menos 500 entradas" {
    if ($entries.Count -ge 500) { return $true }
    return "Tem apenas $($entries.Count) entradas"
}

Test-Assertion "Todas as chaves sao lowercase" {
    $bad = $entries | Where-Object { $_.Key -cne $_.Key.ToLower() }
    if ($bad.Count -eq 0) { return $true }
    return "$($bad.Count) chaves nao sao lowercase"
}

Test-Assertion "Todas as chaves seguem formato Provider/Type" {
    $bad = $entries | Where-Object { $_.Key -notmatch '^[a-z]+\.[a-z0-9]+/[a-z0-9]+' }
    if ($bad.Count -eq 0) { return $true }
    return "$($bad.Count) chaves invalidas. Exemplo: $($bad[0].Key)"
}

Test-Assertion "Todos os valores sao 0 ou 1" {
    $bad = $entries | Where-Object {
        $_.MoveRG -notin 0,1 -or $_.MoveSub -notin 0,1 -or $_.MoveRegion -notin 0,1
    }
    if ($bad.Count -eq 0) { return $true }
    return "$($bad.Count) entradas com valores invalidos"
}

Test-Assertion "Nao ha chaves duplicadas" {
    $duplicates = $entries | Group-Object -Property Key | Where-Object { $_.Count -gt 1 }
    if ($duplicates.Count -eq 0) { return $true }
    return "$($duplicates.Count) chaves duplicadas. Exemplo: $($duplicates[0].Name)"
}

Test-Assertion "Contem Microsoft.Compute/virtualMachines" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.compute/virtualmachines' }).Count -gt 0
}

Test-Assertion "Contem Microsoft.Storage/storageAccounts" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.storage/storageaccounts' }).Count -gt 0
}

Test-Assertion "Contem Microsoft.Network/virtualNetworks" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.network/virtualnetworks' }).Count -gt 0
}

Test-Assertion "Contem Microsoft.KeyVault/vaults" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.keyvault/vaults' }).Count -gt 0
}

Test-Assertion "Contem Microsoft.Web/sites" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.web/sites' }).Count -gt 0
}

Test-Assertion "Contem Microsoft.Sql/servers" {
    @($entries | Where-Object { $_.Key -eq 'microsoft.sql/servers' }).Count -gt 0
}

Test-Assertion "VMs suportam mover entre RG e Subscription" {
    $vm = $entries | Where-Object { $_.Key -eq 'microsoft.compute/virtualmachines' } | Select-Object -First 1
    $vm.MoveRG -eq 1 -and $vm.MoveSub -eq 1
}

# --- Resultado ---
Write-Host ""
Write-Host "Resultado:" -ForegroundColor Cyan
Write-Host ("  Passou: {0}/{1}" -f $passed, $total) -ForegroundColor $(if ($failures.Count -eq 0) { "Green" } else { "Yellow" })

if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "Falhas:" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host ("  - " + $f) -ForegroundColor Red
    }
    Write-Host ""
    exit 1
}
else {
    Write-Host ""
    Write-Host "Todos os testes passaram!" -ForegroundColor Green
    Write-Host ""
    exit 0
}
