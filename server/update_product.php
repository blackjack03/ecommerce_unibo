<?php

require_once 'database.php';
require_once 'app_utils.php';

function not_allowed_exit() {
    echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="3;url=../index.html" /><title>Not Allowed</title></head>';
    echo '<body><h1 style="font-family: arial; color: red; text-align: center;">You are not allowed to do this operation!</h1></body></html>';
    exit;
}

function redirect($page, $status) {
    echo "<!DOCTYPE html><html><head><title>Redirect...</title><script>
            sessionStorage.setItem(\"status_change\", \"$status\");
            window.location.replace(\"$page\");
          </script></head></html>";
    exit;
}

function uploadImage($uploadDir, $file) {
    if ($file['error'] === UPLOAD_ERR_OK) {
        $tmpName = $file['tmp_name'];

        // Genera un nome unico per il file
        do {
            $newFileName = bin2hex(random_bytes(8)) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
            $destination = $uploadDir . DIRECTORY_SEPARATOR . $newFileName;
        } while (file_exists($destination));

        // Sposta il file nella cartella di destinazione
        if (move_uploaded_file($tmpName, $destination)) {
            return $newFileName;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] === "POST") {

    session_start();

    if ($_SESSION['user_type'] !== "admin") {
        not_allowed_exit();
    }

    $prod_id = $_POST['prod_id'];

    $app_utils = new AppUtils($conn);

    $name     = $_POST['name'];
    $descr    = $_POST['descr'];
    $price    = $_POST['price'];
    $quantity = $_POST['qta'];

    $prod_info = $app_utils->getProduct($prod_id);
    if ($prod_info === false || $prod_info === null) {
        redirect("../update_product.html?id=$prod_id", "error");
    }

    if (isset($_POST['also_image'])) {
        try {
            $uploadDir = __DIR__ . '/../products_images';
            $uploadedFiles = [];
            // Gestisce i file dai 6 input
            $img_inputs = ['ph1', 'ph2', 'ph3', 'ph4', 'ph5', 'ph6'];
            foreach ($img_inputs as $inputName) {
                if (isset($_FILES[$inputName]) && $_FILES[$inputName]['error'] !== UPLOAD_ERR_NO_FILE) {
                    $uploaded = uploadImage($uploadDir, $_FILES[$inputName]);
                    if ($uploaded === false) {
                        foreach ($uploadedFiles as $file) {
                            $image_path = $uploadDir . DIRECTORY_SEPARATOR . $file;
                            if (is_file($image_path)) {
                                unlink($image_path);
                            }
                        }
                        redirect("../update_product.html?id=$prod_id", "error");
                    }
                    array_push($uploadedFiles, $uploaded);
                }
            }
        } catch (Exception $err) {
            redirect("../update_product.html?id=$prod_id", "error");
        }

        if (!$app_utils->updateProduct($prod_id, $name, $descr, $price, $quantity, $uploadedFiles)) {
            foreach ($uploadedFiles as $file) {
                $image_path = $uploadDir . DIRECTORY_SEPARATOR . $file;
                if (is_file($image_path)) {
                    unlink($image_path);
                }
            }
            redirect("../update_product.html?id=$prod_id", "error");
        } else {
            $old_images = json_decode($prod_info["images"], true);
            foreach ($old_images as $file) {
                $image_path = $uploadDir . DIRECTORY_SEPARATOR . $file;
                if (is_file($image_path)) {
                    unlink($image_path);
                }
            }
            redirect("../update_product.html?id=$prod_id", "OK");
        }
    } else {
        if (!$app_utils->updateProduct($prod_id, $name, $descr, $price, $quantity)) {
            redirect("../update_product.html?id=$prod_id", "error");
        } else {
            redirect("../update_product.html?id=$prod_id", "OK");
        }
    }

}
