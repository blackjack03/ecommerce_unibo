<?php

/* Inserisco Europe/Rome come timezone */
date_default_timezone_set('Europe/Rome');

enum UserType: string {
    case Admin = "admin";
    case User = "user";
}

class AppUtils {

    private $conn;

    /* CONSTRUCT */

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /* PRIVATE FUNCTIONS */

    private function retrieveFromSTMT($stmt) {
        $tuples = [];
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            array_push($tuples, $row);
        }
        $result->free();
        return $tuples;
    }

    private function email_exists($email) {
        $query = "SELECT * FROM utenti WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $stmt->store_result();
        $ar = $stmt->num_rows;
        $stmt->close();
        if ($ar > 0) {
            return true;
        } else {
            return false;
        }
    }

    private function checkProductAvailability($id, $quantity) {
        $stmt = $this->conn->prepare("SELECT quantita FROM prodotti WHERE product_id = ?");
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $max_available = $this->retrieveFromSTMT($stmt)[0]["quantita"];
        $stmt->close();
        return $quantity <= $max_available;
    }

    private function getProductInfo($id) {
        $query = "SELECT nome, prezzo, quantita, images, avg_rate FROM prodotti WHERE product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt)[0];
        $stmt->close();
        return $result;
    }

    private function getLastID() {
        $query = 'SELECT LAST_INSERT_ID() AS last_id;';
        $result = $this->conn->query($query);
        if ($result) {
            $row = $result->fetch_assoc();
            return $row['last_id'];
        }
        return false;
    }

    private function getCardName($card_id) {
        $query = "SELECT nome_carta FROM carte WHERE id_carta = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $card_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt)[0];
        $stmt->close();
        return $result["nome_carta"];
    }

    private function getUserIdByOrder($order_id) {
        $query = "SELECT user_id FROM ordini WHERE order_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $order_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) === 0) {
            $stmt->close();
            return false;
        }
        return $result[0]["user_id"];
    }

    private function setNotificationReaded($notify_id) {
        $query = "UPDATE notifiche SET da_leggere = 0 WHERE notify_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $notify_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        return true;
    }

    private function checkProductQuantitiesAfterOrder($productIDs, $user_id) {
        $sql = "SELECT product_id, quantita FROM prodotti WHERE product_id = ?";
        $stmt = $this->conn->prepare($sql);
        foreach ($productIDs as $productID) {
            $stmt->bind_param('i', $productID);
            if (!$stmt->execute()) {
                $stmt->close();
                return false;
            }
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                if ((int)$row['quantita'] === 0) {
                    $prod_id = $row['product_id'];
                    if (!$this->createNotification($user_id, UserType::User,
                    "Prodotto Esaurito!",
                    "Uno dei prodotti del catagolo (<a href='product.html?id=$prod_id'>clicca qui per vederlo</a>) è appena ESAURITO!")) {
                        $stmt->close();
                        return false;
                    }
                }
            }
        }
        $stmt->close();
        return true;
    }

    private function getRateInfo($product_id) {
        $query = "SELECT stars FROM recensioni WHERE product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        $stars = [];
        foreach ($result as $res) {
            array_push($stars, $res["stars"]);
        }
        $stmt->close();
        return $stars;
    }

    private function calculateArrayOffset($pageIndex, $len, $max, &$startOffset, &$endOffset) {
        if ($pageIndex < 1) {
            $pageIndex = 1;
        }

        $startOffset = ($pageIndex - 1) * $max;

        if ($startOffset < 0) {
            $startOffset = 0;
        }

        $endOffset = $startOffset + $max - 1;

        if ($endOffset >= $len) {
            $endOffset = $len - 1;
        }
    }

    /* PUBLIC FUNCTIONS */

    public function admin_login($password) {
        $query = "SELECT user_id, password FROM utenti WHERE tipo = 'admin'";
        $stmt = $this->conn->prepare($query);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt)[0];
        $hashed_pass = $result['password'];
        $stmt->close();
        if (password_verify($password, $hashed_pass)) {
            return $result["user_id"];
        } else {
            return false;
        }
    }

    public function sign_up($name, $email, $password) {
        $already_exists = $this->email_exists($email);

        if ($already_exists === null) {
            return null;
        } else if ($already_exists === true) {
            return false;
        }

        $query = "INSERT INTO utenti (nome, email, password) VALUES (?, ?, ?)";
        $hashed_pass = password_hash($password, PASSWORD_BCRYPT, ["cost" => 12]);
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("sss", $name, $email, $hashed_pass);

        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }

        $stmt->close();
        return true;
    }

    public function login($email, $password) {
        $query = "SELECT user_id, password FROM utenti WHERE email = ? AND tipo = 'user'";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $email);

        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }

        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $stmt->close();
            if (password_verify($password, $row['password'])) {
                return $row['user_id'];
            } else {
                return false;
            }
        } else {
            $stmt->close();
            return false;  // e-mail not found
        }
    }

    public function addProduct($name, $descr, $price, $quantity, $img_names) {
        $query = "INSERT INTO prodotti (nome, descrizione, prezzo, quantita, images) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        $raw_arr_obj = json_encode($img_names);
        if ($raw_arr_obj === false) {
            return false;
        }

        $null = null; // Placeholder per il tipo BLOB
        $stmt->bind_param("sbdis", $name, $null, $price, $quantity, $raw_arr_obj);
        $stmt->send_long_data(1, $descr);
    
        if ($stmt->execute()) {
            $inserted_id = $this->conn->insert_id;
            $stmt->close();
            return $inserted_id;
        } else {
            $stmt->close();
            return false;
        }
    }

    public function updateProduct($prod_id, $name, $descr, $price, $quantity, $img_names = null) {
        $null = null; // Placeholder per il tipo BLOB
        if ($img_names !== null) {
            $query = "UPDATE prodotti SET nome = ?, descrizione = ?, prezzo = ?, quantita = ?, images = ? WHERE product_id = ?";
            $stmt = $this->conn->prepare($query);
            $raw_arr_obj = json_encode($img_names);
            if ($raw_arr_obj === false) {
                return false;
            }
            $stmt->bind_param("sbdisi", $name, $null, $price, $quantity, $raw_arr_obj, $prod_id);
        } else {
            $query = "UPDATE prodotti SET nome = ?, descrizione = ?, prezzo = ?, quantita = ? WHERE product_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("sbdii", $name, $null, $price, $quantity, $prod_id);
        }

        $stmt->send_long_data(1, $descr);

        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }

    public function getProducts($max_prod_page, $page_index) {
        $query = "SELECT * FROM prodotti ORDER BY (quantita = 0), avg_rate DESC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $prods = $this->retrieveFromSTMT($stmt);
        $prod_len = count($prods);
        $startOffset = 0;
        $endOffset   = 0;
        $this->calculateArrayOffset($page_index, $prod_len, $max_prod_page, $startOffset, $endOffset);
        return array_slice($prods, $startOffset, $endOffset - $startOffset + 1);
    }

    public function getMaxPageLimit($max_prod_page) {
        $query = "SELECT COUNT(*) AS count FROM prodotti";
        $stmt = $this->conn->prepare($query);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        return ceil($result[0]['count'] / $max_prod_page);
    }

    public function getProduct($product_id) {
        $query = "SELECT * FROM prodotti WHERE product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) === 0) {
            $stmt->close();
            return false;
        } else {
            $stmt->close();
            return $result[0];
        }
    }

    public function createNotification($user_id, UserType $made_by, $object, $text) {
        $query = "INSERT INTO notifiche (user_id, created_by, oggetto, testo, timestamp) VALUES (?, ?, ?, ?, ?)";
        $now = time();
        $stmt = $this->conn->prepare($query);
        $created_by = (string)$made_by->value;
        $null = null;
        $stmt->bind_param("issbi", $user_id, $created_by, $object, $null, $now);
        $stmt->send_long_data(3, $text);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    /**
     * Funzione per aggiungere un prodotto al carrello con la quantita' voluta
     * @return bool|null
     * Torna null in caso di errore imprevisto
     * Torna false se il prodotto NON è disponibile nella quantita' scelta
     * Torna true se il prodotto è stato aggiunto al carrello
     */
    public function addToCart($user_id, $product_id, $quantity) {
        $available = $this->checkProductAvailability($product_id, $quantity);
        if ($available === null) {
            return null;
        } else if ($available === false) {
            return false;
        }

        $query = "INSERT INTO prodotti_carrello (user_id, product_id, quantita)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantita = quantita + VALUES(quantita)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iii", $user_id, $product_id, $quantity);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $stmt->close();
        return true;
    }

    public function countCartProducts($user_id) {
        $query = "SELECT SUM(quantita) AS qta FROM prodotti_carrello WHERE user_id = ? GROUP BY user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        $stmt->close();
        if (count($result) === 0) {
            return 0;
        }
        return $result[0]["qta"];
    }

    public function getCart($user_id) {
        $query = "SELECT product_id, SUM(quantita) AS qta FROM prodotti_carrello WHERE user_id = ? GROUP BY product_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $cart_list = $this->retrieveFromSTMT($stmt);
        $prods_list = [];
        foreach ($cart_list as &$prod) {
            $prod["qta"] = intval($prod["qta"]);
            $info = $this->getProductInfo($prod['product_id']);
            if ($info === false) {
                return false;
            }
            $info["disponibile"] = $info["quantita"];
            unset($info["quantita"]);
            array_push($prods_list, array_merge($prod, $info));
        }
        $stmt->close();
        return $prods_list;
    }

    public function changeQuantityOnCart($user_id, $product_id, $quantity) {
        $available = $this->checkProductAvailability($product_id, $quantity);
        if ($available === null) {
            return null;
        } else if ($available === false) {
            return false;
        }

        $query = "UPDATE prodotti_carrello SET quantita = ? WHERE user_id = ? AND product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("iii", $quantity, $user_id, $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    public function deleteFromCart($user_id, $product_id) {
        $query = "DELETE FROM prodotti_carrello WHERE user_id = ? AND product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $user_id, $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    public function userHasCard($user_id) {
        $query = "SELECT * FROM carte WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) > 0) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }

    public function getUserCards($user_id) {
        $query = "SELECT * FROM carte WHERE user_id = ? ORDER BY is_default DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        $stmt->close();
        return $result;
    }

    public function putOrder($user_id, $payment_info) {
        $cart = $this->getCart($user_id);
        if ($cart === false) {
            return null;
        }
        $this->conn->begin_transaction(); // Start
        $now = time();
        if ($payment_info['type'] === "carta") {
            $query = "INSERT INTO ordini (id_carta, user_id, tipo_pagamento, timestamp) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("iisi", $payment_info['card_id'], $user_id, $payment_info['type'], $now);
        } else {
            $query = "INSERT INTO ordini (user_id, tipo_pagamento, timestamp) VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("isi", $user_id, $payment_info['type'], $now);
        }
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }
        if (!$this->conn->query("SET sql_mode = 'STRICT_ALL_TABLES'")) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }
        $order_id = $this->getLastID();
        $query1 = "INSERT INTO prodotti_ordine (user_id, order_id, product_id, prezzo_unitario, quantita) VALUES (?, ?, ?, ?, ?)";
        $query1_1 = "UPDATE prodotti SET quantita = quantita - ? WHERE product_id = ?";
        $products_ids = [];
        $tot_quantity = 0;
        $tot_price = 0;
        if (count($cart) === 0) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        try {
            foreach ($cart as &$prod) {
                $prod_info = $this->getProductInfo($prod["product_id"]);
                if ($prod_info === false) {
                    $this->conn->rollback(); // Rollback
                    $stmt->close();
                    return false;
                }
                $stmt = $this->conn->prepare($query1);
                $stmt->bind_param("iiidi",
                    $user_id,
                    $order_id,
                    $prod["product_id"],
                    $prod_info["prezzo"],
                    $prod["qta"]
                );
                array_push($products_ids, $prod["product_id"]);
                if (!$stmt->execute()) {
                    $this->conn->rollback(); // Rollback
                    $stmt->close();
                    return null;
                }
                $stmt = $this->conn->prepare($query1_1);
                $stmt->bind_param("ii", $prod["qta"], $prod["product_id"]);
                if (!$stmt->execute()) {
                    $this->conn->rollback(); // Rollback
                    $stmt->close();
                    return false; // Il prodotto POTREBBE essere finito o è un errore diverso
                }
                $tot_quantity += $prod["qta"];
                $tot_price += $prod["qta"] * $prod["prezzo"];
            }
        } catch(Exception $err) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false; // Il prodotto POTREBBE essere finito o è un errore diverso
        }

        // Modify tot quantity and tot price
        $query = "UPDATE ordini SET n_prodotti = ?, costo_totale = ? WHERE order_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("idi", $tot_quantity, $tot_price, $order_id);
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }

        if (!$this->conn->query("SET sql_mode = ''")) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }

        $query = "DELETE FROM prodotti_carrello WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }

        $s = ($tot_quantity === 1) ? 'o' : 'i';
        $notiy_text = "È stato effettuato un nuovo ordine!<br/>Sono stati ordinati $tot_quantity prodott$s per un totale di $tot_price €.<br/><a href='order.html?id=$order_id'>Clicca qui per visualizzare tutti i dettagli dell'ordine</a>";
        $create_notification = $this->createNotification($user_id, UserType::User, "Nuovo Ordine", $notiy_text);
        if ($create_notification === false) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }

        if (!$this->checkProductQuantitiesAfterOrder($products_ids, $user_id)) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return null;
        }

        $this->conn->commit(); // Confirm changes
        $stmt->close();
        return $order_id;
    }

    public function getOrdersList($user_id, $user_type) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT order_id, costo_totale, timestamp FROM ordini ORDER BY timestamp";
            $stmt = $this->conn->prepare($query);
        } else {
            $query = "SELECT order_id, costo_totale, timestamp FROM ordini WHERE user_id = ? ORDER BY timestamp";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $user_id);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $result = $this->retrieveFromSTMT($stmt);
        $stmt->close();
        return $result;
    }

    public function getOrder($order_id, $user_id, $user_type) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT * FROM ordini WHERE order_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $order_id);
        } else {
            $query = "SELECT * FROM ordini WHERE order_id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $order_id, $user_id);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) === 0) {
            $stmt->close();
            return false;
        } else {
            $order = $result[0];
            if ($order["id_carta"] !== null) {
                $card_name = $this->getCardName($order["id_carta"]);
                if ($card_name === false) {
                    $card_name = null;
                }
                $order["nome_carta"] = $card_name;
            }
            $stmt->close();
            return $order;
        }
    }

    public function getOrderProducts($order_id, $user_id, $user_type) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT product_id, prezzo_unitario, quantita FROM prodotti_ordine WHERE order_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $order_id);
        } else {
            $query = "SELECT product_id, prezzo_unitario, quantita FROM prodotti_ordine WHERE order_id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $order_id, $user_id);
        }
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) === 0) {
            $stmt->close();
            return false;
        }
        foreach ($result as &$prod) {
            if ($prod["product_id"] !== null) {
                $info = $this->getProductInfo($prod["product_id"]);
                if ($info === false) {
                    $stmt->close();
                    return null;
                }
                $prod["nome"] = $info["nome"];
                $prod["prezzo"] = $prod["prezzo_unitario"];
                $prod["prezzo_tot"] = $prod["prezzo_unitario"] * $prod["quantita"];
                $prod["images"] = $info["images"];
            } else {
                $prod["nome"] = "<em>Prodotto Eliminato</em>";
                $prod["prezzo"] = $prod["prezzo_unitario"];
                $prod["prezzo_tot"] = $prod["prezzo_unitario"] * $prod["quantita"];
                $prod["images"] = "[\"default.jpg\"]";
            }
        }
        $stmt->close();
        return $result;
    }

    public function changeDeliveryStatus($order_id, $status) {
        $this->conn->begin_transaction(); // Start
        $query = "UPDATE ordini SET stato_ordine = ? WHERE order_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $status, $order_id);
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        $user_id = $this->getUserIdByOrder($order_id);
        if ($user_id === false) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        if (!$this->createNotification($user_id, UserType::Admin,
      "Stato della Spedizione Cambiato!",
        "Lo stato di un tuo ordine (<a href='order.html?id=$order_id'>clicca qui per vederlo</a>) è cambiato!<br/>Stato attuale della spedizione: <strong>$status</strong>")) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        $this->conn->commit(); // Confirm changes
        $stmt->close();
        return true;
    }

    public function getNewNotificationsNum($user_type, $user_id = null) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT COUNT(*) AS count FROM notifiche WHERE created_by = 'user' AND da_leggere = 1";
            if ($result = $this->conn->query($query)) {
                $row = $result->fetch_assoc();
                $notification_num = $row["count"];
                $result->free();
                return $notification_num;
            }
            return false;
        } else {
            $query = "SELECT COUNT(*) AS count FROM notifiche WHERE created_by = 'admin' AND user_id = ? AND da_leggere = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $user_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return false;
            }
            $notification_num = $this->retrieveFromSTMT($stmt)[0]["count"];
            $stmt->close();
            return $notification_num;
        }
    }

    public function getNotificationsList($user_type, $user_id = null) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT notify_id, oggetto, da_leggere, timestamp FROM notifiche WHERE created_by = 'user' ORDER BY timestamp DESC";
            $stmt = $this->conn->prepare($query);
            if (!$stmt->execute()) {
                $stmt->close();
                return false;
            }
            $result = $this->retrieveFromSTMT($stmt);
            $stmt->close();
            return $result;
        } else {
            $query = "SELECT notify_id, oggetto, da_leggere, timestamp FROM notifiche WHERE created_by = 'admin' AND user_id = ? ORDER BY timestamp DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $user_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return false;
            }
            $result = $this->retrieveFromSTMT($stmt);
            $stmt->close();
            return $result;
        }
    }

    public function getNotification($notify_id, $user_type, $user_id) {
        if ($user_type === UserType::Admin->value) {
            $query = "SELECT * FROM notifiche WHERE notify_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $notify_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            $result = $this->retrieveFromSTMT($stmt)[0];
            $stmt->close();
            if (!$this->setNotificationReaded($notify_id)) {
                return null;
            }
            return $result;
        } else {
            $query = "SELECT * FROM notifiche WHERE notify_id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $notify_id, $user_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            $result = $this->retrieveFromSTMT($stmt);
            if (count($result) === 0) {
                $stmt->close();
                return false;
            }
            $stmt->close();
            if (!$this->setNotificationReaded($notify_id)) {
                return null;
            }
            return $result[0];
        }
    }

    public function deleteNotification($notify_id, $user_type, $user_id) {
        if ($user_type === UserType::Admin->value) {
            $query = "DELETE FROM notifiche WHERE notify_id = ? AND created_by = 'user'";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $notify_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        } else {
            $query = "DELETE FROM notifiche WHERE notify_id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $notify_id, $user_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        }
    }

    public function setNotificationUnread($notify_id, $user_type, $user_id) {
        if ($user_type === UserType::Admin->value) {
            $query = "UPDATE notifiche SET da_leggere = 1 WHERE notify_id = ? AND created_by = 'user'";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("i", $notify_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        } else {
            $query = "UPDATE notifiche SET da_leggere = 1 WHERE notify_id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bind_param("ii", $notify_id, $user_id);
            if (!$stmt->execute()) {
                $stmt->close();
                return null;
            }
            if ($stmt->affected_rows > 0) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        }
    }

    public function setCardDefault($card_id, $user_id) {
        $query = "UPDATE carte SET is_default = 0 WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $this->conn->rollback();
            $stmt->close();
            return null;
        }
        $this->conn->begin_transaction(); // Start
        $query = "UPDATE carte SET is_default = 1 WHERE id_carta = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $card_id, $user_id);
        if (!$stmt->execute()) {
            $this->conn->rollback();
            $stmt->close();
            return null;
        }
        if ($stmt->affected_rows > 0) {
            $this->conn->commit();
            $stmt->close();
            return true;
        } else {
            $this->conn->rollback();
            $stmt->close();
            return false;
        }
    }

    public function removeCard($card_id, $user_id) {
        $query = "DELETE FROM carte WHERE id_carta = ? AND user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $card_id, $user_id);
        if (!$stmt->execute()) {
            $this->conn->rollback();
            $stmt->close();
            return null;
        }
        if ($stmt->affected_rows > 0) {
            $stmt->close();
            return true;
        } else {
            $this->conn->rollback();
            $stmt->close();
            return false;
        }
    }

    public function addCard($user_id, $card_info) {
        $query = "INSERT INTO carte (user_id, nome_carta, nome_sulla_carta, numero_carta, CVV, scadenza) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("isssss", $user_id, $card_info["nome_carta"], $card_info["nome"], $card_info["numero_carta"], $card_info["cvv"], $card_info["scadenza"]);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    public function changePassword($user_id, $old_password, $new_password) {
        $query = "SELECT password FROM utenti WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $old_hashed_pass = $this->retrieveFromSTMT($stmt)[0]["password"];
        if (!password_verify($old_password, $old_hashed_pass)) {
            $stmt->close();
            return false;
        }
        $query = "UPDATE utenti SET password = ? WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $new_hashed_pass = password_hash($new_password, PASSWORD_BCRYPT);
        $stmt->bind_param("si", $new_hashed_pass, $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        return true;
    }
    
    public function getUserInfo($user_id) {
        $query = "SELECT nome, email, tipo FROM utenti WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $user_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $user_info = $this->retrieveFromSTMT($stmt);
        if (count($user_info) === 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return $user_info[0];
    }

    public function deleteProduct($product_id) {
        $prod_info = $this->getProductInfo($product_id);
        if ($prod_info === false) {
            return null;
        }
        $prod_images = json_decode($prod_info["images"], true);
        $query = "DELETE FROM prodotti WHERE product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        if ($stmt->affected_rows > 0) {
            foreach ($prod_images as $img) {
                $img_path = __DIR__ . "/../products_images/" . $img;
                if (is_file($img_path)) {
                    unlink($img_path);
                }
            }
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }

    public function getProductsList() {
        $query = "SELECT product_id, nome, quantita FROM prodotti";
        $stmt = $this->conn->prepare($query);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $products_list = $this->retrieveFromSTMT($stmt);
        $stmt->close();
        return $products_list;
    }

    public function getReviews($product_id) {
        $query = "SELECT * FROM recensioni WHERE product_id = ? ORDER BY timestamp DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }
        $reviews = $this->retrieveFromSTMT($stmt);
        foreach ($reviews as &$review) {
            $user_info = $this->getUserInfo($review["user_id"]);
            if ($user_info === false || $user_info === null) {
                $review["name"] = "Utente Eliminato";
            }
            /*$prod_info = $this->getProductInfo($product_id);
            if ($prod_info === false) {
                $stmt->close();
                return false;
            }*/
            $review["name"] = $user_info["nome"];
            // $review["avg_rate"] = $prod_info["avg_rate"];
        }
        $stmt->close();
        return $reviews;
    }

    public function userCanComment($user_id, $product_id) {
        $query = "SELECT * FROM recensioni WHERE user_id = ? AND product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $user_id, $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) > 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        $query = "SELECT * FROM prodotti_ordine WHERE user_id = ? AND product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("ii", $user_id, $product_id);
        if (!$stmt->execute()) {
            $stmt->close();
            return null;
        }
        $result = $this->retrieveFromSTMT($stmt);
        if (count($result) === 0) {
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    public function insertReview($user_id, $product_id, $rate, $title, $text) {
        $this->conn->begin_transaction(); // Start
        $query = "INSERT INTO recensioni (user_id, product_id, stars, titolo, testo, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
        $null = null;
        $stmt = $this->conn->prepare($query);
        $now = time();
        $stmt->bind_param("iiisbi", $user_id, $product_id, $rate, $title, $null, $now);
        $stmt->send_long_data(4, $text);
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        // Change AVG Rate of product
        $rates = $this->getRateInfo($product_id);
        if ($rates === false) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        $new_avg_rate = array_sum($rates) / count($rates);
        $query = "UPDATE prodotti SET avg_rate = ? WHERE product_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("di", $new_avg_rate, $product_id);
        if (!$stmt->execute()) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        // Send Notification to Admin
        $user_info = $this->getUserInfo($user_id);
        if ($user_info === false || $user_info === null) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        $user_name = $user_info["nome"];
        $user_email = $user_info["email"];
        $s = ($rates === 1) ? "a" : "e";
        if (!$this->createNotification($user_id, UserType::User,
        "Recensione Aggiunta! ($rate stell$s)",
          "L'utente $user_name (e-mail dell'utente: <em>$user_email</em>) ha appena aggiunto una recensione ad un prodotto! (<a href='product.html?id=$product_id'>Visualizza il Prodotto Cliccando Qui</a>)<br/>L'utente ha recensito il prodotto con <strong>$rate stell$s</strong> e mettendo come titolo <strong>$title</strong>")) {
            $this->conn->rollback(); // Rollback
            $stmt->close();
            return false;
        }
        // OK
        $this->conn->commit(); // Commit
        $stmt->close();
        return true;
    }

}
