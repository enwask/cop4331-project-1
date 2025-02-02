<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    editContactError("Failed to connect to database");
    exit();
}

// Check that the session has a user ID
if ($_SESSION["ID"] === null) {
    editContactError("Invalid session");
    exit();
}
$id = $_SESSION["ID"];

// Check if form is sumbmitted 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Accept POST body as JSON
    $_POST = json_decode(file_get_contents('php://input'), true);

    $ContactID = (int) $_POST['ID'];

    // Make sure contact id is an integer
    if ($ContactID < 1) {
        editContactError('Invalid contact ID');
        exit();
    }

    $FirstName = $_POST['FirstName'];
    $LastName = $_POST['LastName'];
    $Phone = $_POST['Phone'];
    $Email = $_POST['Email'];

    // Set any empty strings to null (don't update them)
    if ($FirstName === '') {
        $FirstName = null;
    }
    if ($LastName === '') {
        $LastName = null;
    }

    // Validate phone
    if ($Phone === '') {
        $Phone = null;
    }
    if ($Phone !== null && !preg_match('/^[0-9\-\s\(\)]+$/', $Phone)) {
        createContactError("Invalid phone number format");
        exit();
    }

    // Validate email
    if ($Email === '') {
        $Email = null;
    }
    if ($Email !== null && !preg_match("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/", $Email)) {
        createContactError("Invalid email format");
        exit();
    }

    // Check if user already has a contact with the same first and last name
    $stmt_check = $conn->prepare("SELECT *
        FROM Contacts
        WHERE UserID = ?
        AND ID = ?");
    $stmt_check->bind_param("si", $id, $ContactID);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    if ($result_check->num_rows < 1) {
        editContactError("No contact with this ID exists");
        exit();
    }

    // Build a query for the fields that we're updating
    $stmt = $conn->prepare("UPDATE Contacts
        SET FirstName = COALESCE(?, FirstName),
            LastName = COALESCE(?, LastName),
            Phone = COALESCE(?, Phone),
            Email = COALESCE(?, Email)
        WHERE UserID = ?
        AND ID = ?");
    $stmt->bind_param("sssssi", $FirstName, $LastName, $Phone, $Email, $id, $ContactID);
    $stmt->execute();

    // Check if the update was successful
    if ($conn->affected_rows > 0) {
        editContactSuccess();
    } else {
        editContactError("Failed to edit contact");
    }

    $stmt->close();
} else {
    editContactError("Invalid request");
    exit();
}

// Close the SQL connection
$conn->close();


function editContactError($msg)
{
    header('Content-type: application/json');
    echo '{"status": false, "error": "' . $msg . '"}';
}

function editContactSuccess()
{
    header('Content-type: application/json');
    echo '{"status": true, "error": ""}';
}

?>
