<?php

session_start();

if (isset($_SESSION['LOGGED'])) {
    session_unset();
    $_SESSION = array();
    session_destroy();
}

header("Location: ../index.html");
