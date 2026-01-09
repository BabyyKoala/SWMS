<?php
require "db.php";

$stmt = $pdo->prepare("DELETE FROM waste_data");
$stmt->execute();

echo json_encode(["success" => true]);
