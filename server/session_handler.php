<?php

session_start();

if (isset($_SESSION['LOGGED'])) {
    echo "OK::" . $_SESSION['user_type'];
} else {
    echo "NO";
}
