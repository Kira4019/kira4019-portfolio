<?php
require __DIR__ . '/_bootstrap.php';
require_auth();
require_json_post();

$raw = file_get_contents('php://input');
if (strlen($raw) > 1024 * 1024) json_out(['error' => 'Conteúdo grande demais.'], 413);

$data = json_decode($raw, true);
if (!is_array($data)) json_out(['error' => 'JSON inválido.'], 400);

// Garante a estrutura mínima antes de sobrescrever o site.
foreach (['site', 'brand', 'profile', 'hero', 'about', 'servers', 'contact', 'footer'] as $key) {
    if (!isset($data[$key]) || !is_array($data[$key])) {
        json_out(['error' => "Seção obrigatória ausente: $key"], 400);
    }
}

$file = ROOT_DIR . '/data/site.json';
if (is_file($file)) @copy($file, ROOT_DIR . '/data/site.backup.json');

$json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
$tmp  = $file . '.tmp';
if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $file)) {
    json_out(['error' => 'Não foi possível gravar data/site.json. Verifique as permissões da pasta data/.'], 500);
}
json_out(['ok' => true]);
