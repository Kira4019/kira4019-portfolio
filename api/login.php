<?php
require __DIR__ . '/_bootstrap.php';
require_json_post();

$cfg  = require ROOT_DIR . '/config/admin.php';
$hash = $cfg['password_hash'] ?? '';
if ($hash === '') json_out(['error' => 'Senha do painel ainda não configurada (veja config/admin.php).'], 503);

$body = json_decode(file_get_contents('php://input'), true);
$pass = is_array($body) ? (string)($body['password'] ?? '') : '';

if (!password_verify($pass, $hash)) {
    sleep(1); // desacelera tentativas de força bruta
    json_out(['error' => 'Senha incorreta.'], 401);
}

session_regenerate_id(true);
$_SESSION['admin'] = true;
json_out(['ok' => true]);
