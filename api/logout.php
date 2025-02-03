<?php

// Resume the session
session_start();

// Verify that we got a POST request
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    // Return error response
    header('Content-type: application/json');
    echo '{"status": false, "message": "Invalid request"}';
    exit();
}

// Clear the session cookie & session variables
setcookie(session_name(), "", time() - 3600);
session_unset();

// Destroy the session
session_destroy();
session_write_close();

// Return success response
header('Content-type: application/json');
echo '{"status": true}';

?>
