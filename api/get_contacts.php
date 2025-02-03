<?php
// Start the session to get the logged-in user's ID
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    editContactError("Failed to connect to database");
    exit();
}

// check if user is logged in
if (!isset($_SESSION["ID"])) {
    echo json_encode(["status" => false, "error" => "Invalid session"]);
    exit();
}

// Fetched user's ID
$userId = $_SESSION["ID"]; 

// Query to fetch contacts for the logged-in user
$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode(["status" => true, "contacts" => $contacts]);

$stmt->close();
$conn->close();
?>
