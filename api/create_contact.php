<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    createContactError("Failed to connect to database");
    exit();
}

// Check that the session has a user ID
if ($_SESSION["ID"] === null) {
    createContactError("Invalid session");
    exit();
}
$id = $_SESSION["ID"];

// Check if form is sumbmitted 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Accept POST body as JSON
    $_POST = json_decode(file_get_contents('php://input'), true);

    $FirstName = $_POST['FirstName'];
    $LastName = $_POST['LastName'];
    $Email = $_POST['Email'];
    $Phone = $_POST['Phone'];

    // Validate names
    if ($FirstName === '') {
        createContactError('First name cannot be empty');
        exit();
    }
    if ($LastName === '') {
        createContactError('Last name cannot be empty');
        exit();
    }
    // Validate phone
    if (!preg_match('/^[0-9\-\s\(\)]+$/', $Phone) && !empty($Phone)) {
        createContactError("Invalid phone number format");
        exit();
    }
    // Validate email
    if (!preg_match("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/", $Email)) {
        createContactError("Invalid email format");
        exit();
    }

    // Check if user already has a contact with the same first and last name
    $stmt_check = $conn->prepare("SELECT *
        FROM Contacts
        WHERE UserID = ?
        AND (LOWER(FirstName) = LOWER(?) AND LOWER(LastName) = LOWER(?))");
    $stmt_check->bind_param("sss", $id, $FirstName, $LastName);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    if ($result_check->num_rows > 0) {
        createContactError("Contact with this name already exists");
        exit();
    }

    // Insert contact, am still looking for the database syntax for this
    $stmt = $conn->prepare("INSERT INTO Contacts (FirstName, LastName, Phone, Email, UserID)
        VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $FirstName, $LastName, $Phone, $Email, $id);
    $stmt->execute();
    
    // Check if the insert was successful
    if ($conn->affected_rows > 0) {
        createContactSuccess();
    } else {
        createContactError("Failed to create contact");
    }

    $stmt->close();
} else {
    createContactError("Invalid request");
    exit();
}

// Close the SQL connection
$conn->close();


function createContactError($msg)
{
    header('Content-type: application/json');
    echo '{"status": false, "error": "' . $msg . '"}';
}

function createContactSuccess()
{
    header('Content-type: application/json');
    echo '{"status": true, "error": ""}';
}

?>
