<?php
require __DIR__ . '/_bootstrap.php';
$_SESSION = [];
session_destroy();
json_out(['ok' => true]);
