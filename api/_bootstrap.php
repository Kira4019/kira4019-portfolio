<?php
// Base comum dos endpoints do painel.
declare(strict_types=1);

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['SERVER_PORT'] ?? '') == 443);
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => $https,
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

const ROOT_DIR = __DIR__ . '/..';

function json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function require_auth(): void {
    if (empty($_SESSION['admin'])) {
        json_out(['error' => 'Sessão expirada. Faça login novamente.'], 401);
    }
}

function require_json_post(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Método inválido'], 405);
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
        json_out(['error' => 'Requisição inválida'], 415);
    }
}
