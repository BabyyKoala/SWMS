<?php
require "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? null;

if (!$id) {
  http_response_code(400);
  echo json_encode(["error" => "ID missing"]);
  exit;
}

$stmt = $pdo->prepare("DELETE FROM waste_data WHERE id = ?");
$stmt->execute([$id]);

echo json_encode(["success" => true]);
