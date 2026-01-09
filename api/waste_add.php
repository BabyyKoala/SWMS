<?php
require "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$id        = $data["id"];
$name      = $data["name"];
$category  = $data["category"];
$weight    = $data["weight"];
$timestamp = $data["timestamp"];

$stmt = $pdo->prepare(
  "INSERT INTO waste_data (id, name, category, weight, timestamp)
   VALUES (?, ?, ?, ?, ?)"
);

$stmt->execute([$id, $name, $category, $weight, $timestamp]);

echo json_encode(["success" => true]);
