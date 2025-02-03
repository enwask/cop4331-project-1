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
    // Prepare SQL statement for search
    $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email
        FROM Contacts
        WHERE UserID = ?");

    // Bind user ID and query (with wildcards on both sides)
    $stmt->bind_param("s", $id);
    $stmt->execute();

    // Get the results and store them in an array
    $result = $stmt->get_result();
    $arr = array();
    while ($row = $result->fetch_assoc()) {
        array_push($arr, array(
            "id" => $row['ID'],
            "firstName" => $row['FirstName'],
            "lastName" => $row['LastName'],
            "phone" => $row['Phone'],
            "email" => $row['Email']
        ));
    }

    // Send the results back to the client
    sendSearchResults($arr);
    $stmt->close();
} else {
    searchError("Invalid request");
    exit();
}

// Close the SQL connection
$conn->close();

function sendSearchResults($arr)
{
    header('Content-type: application/json');
    echo '{"status": true, "count": ' . count($arr) . ', "contacts": [' . json_encode($arr) . '], "error": ""}';
}

function searchError($msg)
{
    header('Content-type: application/json');
    echo '{"status": false, "count": 0, "contacts": [], "error": "' . $msg . '"}';
}

?>
