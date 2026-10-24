<?php
require __DIR__ . '/_bootstrap.php';
json_out(['ok' => !empty($_SESSION['admin'])]);
