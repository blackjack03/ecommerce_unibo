<?php

require_once 'database.php';
require_once 'app_utils.php';

function redirect($page, $status) {
    echo "<!DOCTYPE html><html><head><title>Redirect...</title><script>
            sessionStorage.setItem(\"status_login\", \"$status\");
            window.location.replace(\"$page\");
          </script></head></html>";
}

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    session_start();

    if (isset($_SESSION['LOGGED'])) {
        header("Location: ../index.html");
        exit;
    }

    $app_utils = new AppUtils($conn);

    $type = $_POST['user_type'];
    $password = $_POST['password'];

    if ($type === "user") {
        $email = $_POST['email'];
        $logged = $app_utils->login($email, $password);
        if ($logged === null) {
            redirect("../login.html", "sql_error");
            exit;
        } else if ($logged === false) {
            redirect("../login.html", "auth_error");
            exit;
        } else {
            $_SESSION['LOGGED'] = 1;
            $_SESSION['user_type'] = 'user';
            $_SESSION['user_id'] = $logged;
            header("Location: ../index.html");
            exit;
        }
    } else {
        $logged = $app_utils->admin_login($password);
        if ($logged === null) {
            redirect("../admin_login.html", "sql_error");
            exit;
        } else if ($logged === false) {
            redirect("../admin_login.html", "auth_error");
            exit;
        } else {
            $_SESSION['LOGGED'] = 1;
            $_SESSION['user_type'] = 'admin';
            $_SESSION['user_id'] = $logged;
            header("Location: ../index.html");
            exit;
        }
    }

}
