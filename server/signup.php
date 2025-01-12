<?php

require_once 'database.php';
require_once 'app_utils.php';

function redirect($page, $status) {
    echo "<!DOCTYPE html><html><head><title>Redirect...</title><script>
            sessionStorage.setItem(\"status_signup\", \"$status\");
            window.location.replace(\"$page\");
          </script></head></html>";
}

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    session_start();

    if (isset($_SESSION['LOGGED'])) {
        header("Location: index.html");
        exit;
    }

    $app_utils = new AppUtils($conn);

    $signup = $app_utils->sign_up($_POST['nome'], $_POST['email'], $_POST['password']);

    if ($signup === null) {
        redirect("../signup.html", "sql_error");
        exit;
    } else if ($signup === false) {
        redirect("../signup.html", "already_exists");
        exit;
    } else {
        redirect("../login.html", "OK");
        exit;
    }

}
