<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    deleteContactError("Failed to connect to database");
    exit();
}

// Check that the session has a user ID
if ($_SESSION["ID"] === null) {
    deleteContactError("Invalid session");
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
        deleteContactError('Invalid contact ID');
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
        deleteContactError("No contact with this ID exists");
        exit();
    }

    // Delete the contact
    $stmt = $conn->prepare("DELETE
        FROM Contacts
        WHERE UserID = ?
        AND ID = ?");
    $stmt->bind_param("si", $id, $ContactID);
    $stmt->execute();

    // Check if the insert was successful
    if ($conn->affected_rows > 0) {
        deleteContactSuccess();
    } else {
        deleteContactError("Failed to delete contact");
    }

    $stmt->close();
} else {
    deleteContactError("Invalid request");
    exit();
}

// Close the SQL connection
$conn->close();


function deleteContactError($msg)
{
    header('Content-type: application/json');
    echo '{"status": false, "error": "' . $msg . '"}';
}

function deleteContactSuccess()
{
    header('Content-type: application/json');
    echo '{"status": true, "error": ""}';
}

?>
