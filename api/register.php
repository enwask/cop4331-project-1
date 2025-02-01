<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    registerError("Failed to connect to database");
    exit();
}

// Check if form is sumbmitted 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Accept POST body as JSON
    $_POST = json_decode(file_get_contents('php://input'), true);

    // ID is auto-incremented
    $Login = $_POST['Login'];
    $Password = $_POST['Password'];
    $FirstName = $_POST['FirstName'];
    $LastName = $_POST['LastName'];

    // Validate input
    if (!preg_match('/\w+/', $Login)) {
        registerError('Invalid login');
        exit();
    }
    if ($Password === '') {
        registerError('Password cannot be empty');
        exit();
    }
    if ($FirstName === '') {
        registerError('First name cannot be empty');
        exit();
    }
    if ($LastName === '') {
        registerError('Last name cannot be empty');
        exit();
    }

    // Check whether a user exists with this login
    $stmt_check = $conn->prepare("SELECT ID
        FROM Users
        WHERE Login = ?
        LIMIT 1");
    $stmt_check->bind_param("s", $Login);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    if ($result_check->num_rows > 0) {
        registerError("Username is already taken");
        exit();
    }

    // Prepare SQL statement to create new user
    $stmt = $conn->prepare('INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)');
    $stmt->bind_param('ssss', $FirstName, $LastName, $Login, $Password);
    $stmt->execute();

    echo 'Executed';
    $result = $stmt->get_result();

    // Check if the insert was successful
    if ($conn->affected_rows > 0) {
        // Redirect to login page
        registerSuccess();
    } else {
        registerError('Failed to create user');
    }

    // Close prepared statement
    $stmt->close();
} else {
    registerError("Invalid request");
    exit();
}

// Close the SQL connection
$conn->close();

function registerSuccess()
{
    header('Content-type: application/json');
    echo '{"status": true, "error": ""}';
}

function registerError($error)
{
    header('Content-type: application/json');
    echo '{"status": false, "error": "' . $error . '"}';
}

?>
