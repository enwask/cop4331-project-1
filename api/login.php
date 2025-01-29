<?php
// Start/resume session (access session data) 
session_start();
include 'db.php';

// Connection error check
if ($conn->connect_error) {
    loginError("Failed to connect to database");
    exit();
}

// Check if form is sumbmitted 
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $Login = $_POST['Login'];
    $Password = $_POST['Password'];

    if (!preg_match('/\w+/', $Login)) {
        loginError('Invalid login');
        exit();
    }
    if ($Password === '') {
        loginError('Password cannot be empty');
        exit();
    }

    // Prepare SQL statement 
    $stmt = $conn->prepare("SELECT ID, Password, FirstName, LastName
        FROM Users
        WHERE Login = ?
        LIMIT 1");
    $stmt->bind_param("s", $Login);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();

        // Verify password
        if ($Password === $row['Password']) {
            $_SESSION['ID'] = $row['ID'];
            loginSuccess($_SESSION['ID'], $row['FirstName'], $row['LastName']);
        } else {
            loginError("Invalid password");
        }
    } else {
        loginError("Invalid login");
    }

    // Close prepared statement
    $stmt->close();
} else {
    loginError("Invalid request");
}

// Close the SQL connection
$conn->close();

function loginSuccess($id, $firstName, $lastName)
{
    header('Content-type: application/json');
    echo '{"id": ' . $id . ',"firstName": "' . $firstName . '", "lastName": "' . $lastName . '", "error": ""}';
}

function loginError($error)
{
    header('Content-type: application/json');
    echo '{"id": 0, "firstName": "", "lastName": "", "error": "' . $error . '"}';
}

?>
