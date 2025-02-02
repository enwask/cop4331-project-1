<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    searchError("Failed to connect to database");
    exit();
}

// Check that the session has a user ID
if ($_SESSION["ID"] === null) {
    searchError("Invalid session");
    exit();
}
$id = $_SESSION["ID"];

// Check if form is sumbmitted 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Accept POST body as JSON
    $_POST = json_decode(file_get_contents('php://input'), true);

    // Validate email
    if (!preg_match('/\w+/', $Login)) {
        registerError('Invalid login');
        exit();
    }
    //Validate phone
    if (!preg_match('/^[0-9\-\s\(\)]+$/', $phone) && !empty($phone)) {
        createContactError("Invalid phone number format");
        exit();
    }
    //Validate names
    if ($FirstName === '') {
        createContactError('First name cannot be empty');
        exit();
    }
    if ($LastName === '') {
        createContactError('Last name cannot be empty');
        exit();
    }

    //Check whether a user exists with this id in this contact list?

    //Insert contact, am still looking for the database syntax for this

    
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
    echo '{"status": false, "count": 0, "contacts": [], "error": "' . $msg . '"}';
}

?>
