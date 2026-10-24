<?php
require __DIR__ . '/_bootstrap.php';
require_auth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['file'])) {
    json_out(['error' => 'Nenhum arquivo enviado.'], 400);
}
$f = $_FILES['file'];
if ($f['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'Falha no envio do arquivo.'], 400);
if ($f['size'] > 3 * 1024 * 1024) json_out(['error' => 'Imagem maior que 3 MB.'], 413);

// SVG fica de fora de propósito (pode carregar scripts).
$allowed = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp', 'image/gif' => 'gif'];
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
if (!isset($allowed[$mime])) json_out(['error' => 'Use PNG, JPG, WEBP ou GIF.'], 415);
if (@getimagesize($f['tmp_name']) === false) json_out(['error' => 'Arquivo não é uma imagem válida.'], 415);

$dir = ROOT_DIR . '/assets/uploads';
if (!is_dir($dir) && !mkdir($dir, 0755, true)) json_out(['error' => 'Não foi possível criar assets/uploads.'], 500);

$name = bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
if (!move_uploaded_file($f['tmp_name'], "$dir/$name")) json_out(['error' => 'Não foi possível salvar a imagem.'], 500);

json_out(['ok' => true, 'path' => "assets/uploads/$name"]);
