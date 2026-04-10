$apiKey   = "AIzaSyDstB29g-xmQ_F-V1BaPJJyX_gQM7k5qAw"
$model    = "gemini-2.0-flash-lite"
$endpoint = "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=$apiKey"

$bodyObj = @{
    systemInstruction = @{
        parts = @(@{ text = "Voce e Senior, tutor gentil do SeniorEase para idosos. Portugues do Brasil. Frases curtas. Responda SOMENTE em JSON valido." })
    }
    contents = @(@{
        role  = "user"
        parts = @(@{ text = 'Tela: TasksScreen. IDs disponiveis: btn_nova_tarefa (Nova Tarefa), btn_historico (Ver Historico). Responda: {"voice_response":"...","highlight_id":"...","next_step":"..."}' })
    })
    generationConfig = @{
        temperature      = 0.2
        maxOutputTokens  = 200
        responseMimeType = "application/json"
    }
    safetySettings = @(
        @{ category = "HARM_CATEGORY_HARASSMENT";        threshold = "BLOCK_LOW_AND_ABOVE" }
        @{ category = "HARM_CATEGORY_HATE_SPEECH";       threshold = "BLOCK_LOW_AND_ABOVE" }
        @{ category = "HARM_CATEGORY_SEXUALLY_EXPLICIT"; threshold = "BLOCK_LOW_AND_ABOVE" }
        @{ category = "HARM_CATEGORY_DANGEROUS_CONTENT"; threshold = "BLOCK_LOW_AND_ABOVE" }
    )
}

$body = $bodyObj | ConvertTo-Json -Depth 10
$bytes = [System.Text.Encoding]::UTF8.GetBytes($body)

Write-Host ""
Write-Host "=== Testando Gemini $model ===" -ForegroundColor Cyan
$start = Get-Date

try {
    $wr = Invoke-WebRequest -Uri $endpoint -Method POST `
        -ContentType "application/json; charset=utf-8" `
        -Body $bytes -UseBasicParsing

    $elapsed = [math]::Round(((Get-Date) - $start).TotalMilliseconds)
    $response = $wr.Content | ConvertFrom-Json
    $rawText  = $response.candidates[0].content.parts[0].text
    $parsed   = $rawText | ConvertFrom-Json

    Write-Host ""
    Write-Host "SUCESSO! Resposta em ${elapsed}ms" -ForegroundColor Green
    Write-Host "──────────────────────────────────────────────"
    Write-Host "voice_response : $($parsed.voice_response)"
    Write-Host "highlight_id   : $($parsed.highlight_id)"
    Write-Host "next_step      : $($parsed.next_step)"
    Write-Host "──────────────────────────────────────────────"
    Write-Host ""
    Write-Host "JSON completo:" -ForegroundColor Magenta
    Write-Host $rawText

} catch {
    $elapsed = [math]::Round(((Get-Date) - $start).TotalMilliseconds)
    Write-Host ""
    Write-Host "ERRO HTTP: $($_.Exception.Message)" -ForegroundColor Red

    # Tenta ler o corpo da resposta de erro
    $errBody = $null
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd() | ConvertFrom-Json
        Write-Host "Codigo   : $($errBody.error.code)"    -ForegroundColor Red
        Write-Host "Status   : $($errBody.error.status)"  -ForegroundColor Red
        Write-Host "Mensagem : $($errBody.error.message)" -ForegroundColor Yellow
        if ($errBody.error.details) {
            $errBody.error.details | ConvertTo-Json -Depth 4 | Write-Host -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host "(Nao foi possivel ler detalhes do erro)"
    }

    Write-Host ""
    Write-Host "Dica: Se for 429, a cota gratuita foi atingida." -ForegroundColor DarkYellow
    Write-Host "  - Cota por minuto (RPM): aguarde 60s e tente de novo."
    Write-Host "  - Cota diaria (QPD):     aguarde ate amanha ou ative faturamento em aistudio.google.com"
}
