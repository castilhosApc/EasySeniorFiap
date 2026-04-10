<?php
/**
 * POST /api/ai-assistant
 *
 * Recebe o contexto da UI e devolve orientação gerada pelo Gemini 1.5 Flash.
 *
 * Request body (JSON):
 * {
 *   "screen_name": "TasksScreen",
 *   "ui_elements": [
 *     { "id": "btn_nova_tarefa", "label": "Nova Tarefa" },
 *     { "id": "btn_historico",   "label": "Ver Histórico" }
 *   ],
 *   "user_context": "Idoso, 72 anos, usa o app há 2 dias"   // opcional
 * }
 *
 * Response (JSON):
 * {
 *   "voice_response": "Olá! O botão Nova Tarefa está destacado para você.",
 *   "highlight_id":   "btn_nova_tarefa",
 *   "next_step":      "Toque no botão destacado para criar uma nova tarefa."
 * }
 */

declare(strict_types=1);

require_once __DIR__ . '/../config/gemini.php';

// ─── CORS ─────────────────────────────────────────────────────────────────────

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Validação do método ──────────────────────────────────────────────────────

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido. Use POST.']);
    exit;
}

// ─── Leitura e validação do body ──────────────────────────────────────────────

$rawBody = file_get_contents('php://input');
$body    = json_decode($rawBody, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido no corpo da requisição.']);
    exit;
}

$screenName  = trim($body['screen_name']  ?? '');
$uiElements  = $body['ui_elements']       ?? [];
$userContext = trim($body['user_context'] ?? '');

if ($screenName === '' || !is_array($uiElements) || count($uiElements) === 0) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Campos obrigatórios ausentes: screen_name e ui_elements (array não vazio).',
    ]);
    exit;
}

// ─── Montagem do Prompt ───────────────────────────────────────────────────────

/**
 * Lista formatada dos elementos disponíveis na tela:
 * - btn_nova_tarefa: "Nova Tarefa"
 * - btn_historico:   "Ver Histórico"
 */
$elementsList = implode("\n", array_map(
    fn($el) => sprintf('- %s: "%s"', $el['id'] ?? '?', $el['label'] ?? '?'),
    $uiElements
));

/** IDs válidos para validação posterior */
$validIds = array_map(fn($el) => $el['id'] ?? '', $uiElements);

$contextLine = $userContext !== ''
    ? "Contexto do usuário: {$userContext}\n"
    : '';

// ─── System Instruction (espírito do tutor) ──────────────────────────────────
// Separado do prompt para usar o campo nativo systemInstruction da API Gemini.
// Isso garante que o "caráter" do tutor persista mesmo com prompts curtos.
$systemInstruction = <<<SYSTEM
Você é Sênior, um tutor de tecnologia gentil e paciente do aplicativo SeniorEase.
Seu único propósito é guiar pessoas idosas com carinho, clareza e sem pressa.

PRINCÍPIOS INEGOCIÁVEIS:
- Jamais use termos técnicos (ex: "clique", "interface", "navegar"). Use "toque", "aperte", "selecione".
- Fale sempre em tom caloroso, como um neto explicando ao avô. Nunca seja frio ou mecânico.
- Frases curtas. Máximo 2 frases por resposta de voz.
- Nunca mencione erros do usuário. Reforce o que ele PODE fazer.
- Você NUNCA inventa IDs de elementos. Usa somente os IDs fornecidos na lista.
SYSTEM;

// ─── Prompt de tarefa (dinâmico por tela) ─────────────────────────────────────
$prompt = <<<PROMPT
O usuário está na tela "{$screenName}".
{$contextLine}
Elementos disponíveis nesta tela — use SOMENTE estes IDs no campo highlight_id:
{$elementsList}

Identifique o elemento mais útil agora e responda com o JSON abaixo.
REGRA CRÍTICA: "highlight_id" deve ser EXATAMENTE um dos IDs listados acima.

{
  "voice_response": "<mensagem acolhedora, máx. 2 frases, para ser lida em voz alta>",
  "highlight_id":   "<ID exato de um dos elementos acima>",
  "next_step":      "<instrução simples do próximo passo>"
}
PROMPT;

// ─── Chamada ao Gemini 1.5 Flash ──────────────────────────────────────────────

$requestPayload = json_encode([

    // ── Espírito do tutor (System Instruction nativa da API) ──────────────────
    'systemInstruction' => [
        'parts' => [
            ['text' => $systemInstruction],
        ],
    ],

    // ── Mensagem do usuário (contexto dinâmico da tela) ───────────────────────
    'contents' => [
        [
            'role'  => 'user',
            'parts' => [
                ['text' => $prompt],
            ],
        ],
    ],

    // ── Fine-tuning de geração ─────────────────────────────────────────────────
    'generationConfig' => [
        // Temperatura baixa = respostas precisas e previsíveis (não "criativas")
        // Faixa ideal para assistente de idosos: 0.1 – 0.3
        'temperature'      => 0.2,
        'maxOutputTokens'  => 300,
        'topP'             => 0.8,   // foco nas palavras mais prováveis
        'topK'             => 20,    // limita o vocabulário criativo
        // JSON Mode: garante que o app consiga ler a resposta diretamente
        'responseMimeType' => 'application/json',
    ],

    // ── Safety Settings no nível MÁXIMO ───────────────────────────────────────
    // BLOCK_LOW_AND_ABOVE bloqueia qualquer conteúdo com probabilidade
    // LOW, MEDIUM ou HIGH de ser prejudicial — proteção total para idosos.
    'safetySettings' => [
        ['category' => 'HARM_CATEGORY_HARASSMENT',        'threshold' => 'BLOCK_LOW_AND_ABOVE'],
        ['category' => 'HARM_CATEGORY_HATE_SPEECH',       'threshold' => 'BLOCK_LOW_AND_ABOVE'],
        ['category' => 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold' => 'BLOCK_LOW_AND_ABOVE'],
        ['category' => 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold' => 'BLOCK_LOW_AND_ABOVE'],
    ],
]);

$ch = curl_init(GEMINI_ENDPOINT);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $requestPayload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => GEMINI_TIMEOUT_SEC,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);

$rawResponse = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError   = curl_error($ch);
curl_close($ch);

// ─── Tratamento de erro de rede ───────────────────────────────────────────────

if ($curlError !== '') {
    http_response_code(502);
    echo json_encode([
        'error'   => 'Falha ao conectar ao Gemini.',
        'details' => $curlError,
    ]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(502);
    $decoded = json_decode($rawResponse, true);
    echo json_encode([
        'error'   => 'Gemini retornou erro HTTP ' . $httpCode,
        'details' => $decoded['error']['message'] ?? $rawResponse,
    ]);
    exit;
}

// ─── Parse da resposta do Gemini ──────────────────────────────────────────────

$geminiResponse = json_decode($rawResponse, true);
$generatedText  = $geminiResponse['candidates'][0]['content']['parts'][0]['text'] ?? '';

if ($generatedText === '') {
    http_response_code(502);
    echo json_encode(['error' => 'Gemini retornou resposta vazia.']);
    exit;
}

$aiResult = json_decode($generatedText, true);

if (json_last_error() !== JSON_ERROR_NONE || !isset($aiResult['highlight_id'])) {
    http_response_code(502);
    echo json_encode([
        'error'    => 'Gemini retornou JSON malformado.',
        'raw'      => $generatedText,
    ]);
    exit;
}

// ─── Validação de segurança: highlight_id deve ser um ID real da tela ─────────

if (!in_array($aiResult['highlight_id'], $validIds, true)) {
    // Fallback: usa o primeiro elemento da lista
    $aiResult['highlight_id'] = $validIds[0];
    $aiResult['next_step']    = ($aiResult['next_step'] ?? '') . ' [ID corrigido automaticamente]';
}

// ─── Resposta final ───────────────────────────────────────────────────────────

http_response_code(200);
echo json_encode([
    'voice_response' => $aiResult['voice_response'] ?? '',
    'highlight_id'   => $aiResult['highlight_id'],
    'next_step'      => $aiResult['next_step']      ?? '',
]);
