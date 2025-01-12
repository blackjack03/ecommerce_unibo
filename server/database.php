<?php
$hostname = "localhost";
$username = "root";
$password = "";
$dbname = "unibo_ecommerce";


$conn = mysqli_connect($hostname, $username, $password, $dbname);

if (!$conn) {
    die("Impossibile connettersi al database: " . mysqli_connect_error());
}
