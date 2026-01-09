<?php
require "db.php";

$stmt = $pdo->query("SELECT * FROM waste_data ORDER BY timestamp DESC");
$data = $stmt->fetchAll();

header("Content-Type: application/json");
echo json_encode($data);
