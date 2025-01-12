<?php

require_once 'database.php';
require_once 'app_utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    session_start();

    $F = $_POST['func'];
    $app_utils = new AppUtils($conn);

    switch ($F) {

        case 'get_products':
            $prod_per_page = $_POST['max_prods'];
            $page = $_POST['page'];
            $out = $app_utils->getProducts($prod_per_page, $page);
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'count_products':
            $prod_per_page = $_POST['max_prods'];
            $out = $app_utils->getMaxPageLimit($prod_per_page);
            echo ($out === false) ? 'error' : $out;
            break;

        case 'get_product':
            $prod_id = $_POST['id'];
            $out = $app_utils->getProduct($prod_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'not_found' : json_encode($out));
            break;

        case 'add_to_cart':
            $user_id = $_SESSION['user_id'];
            $prod_id = $_POST['id'];
            $quantity = $_POST['qty'];
            $out = $app_utils->addToCart($user_id, $prod_id, $quantity);
            echo ($out === null) ? 'error' : (($out === false) ? 'quantity_issue' : 'OK');
            break;

        case 'get_cart_num':
            $user_id = $_SESSION['user_id'];
            $out = $app_utils->countCartProducts($user_id);
            echo ($out === false) ? 'error' : "OK_$out";
            break;

        case 'get_cart':
            $user_id = $_SESSION['user_id'];
            $out = $app_utils->getCart($user_id);
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'change_quantity_cart':
            $user_id = $_SESSION['user_id'];
            $prod_id = $_POST['id'];
            $quantity = $_POST['qty'];
            $out = $app_utils->changeQuantityOnCart($user_id, $prod_id, $quantity);
            echo ($out === null) ? 'error' : (($out === false) ? 'quantity_issue' : 'OK');
            break;

        case 'delete_from_cart':
            $user_id = $_SESSION['user_id'];
            $prod_id = $_POST['id'];
            $out = $app_utils->deleteFromCart($user_id, $prod_id);
            echo ($out === false) ? 'error' : 'OK';
            break;

        case 'user_has_card':
            $user_id = $_SESSION['user_id'];
            $out = $app_utils->userHasCard($user_id);
            echo ($out === null) ? 'error' : (($out === false) ? '{"status":false}' : '{"status":true}');
            break;

        case 'get_cards':
            $user_id = $_SESSION['user_id'];
            $out = $app_utils->getUserCards($user_id);
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'put_order':
            $user_id = $_SESSION['user_id'];
            $type = json_decode($_POST['type'], true);
            $out = $app_utils->putOrder($user_id, $type);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : $out);
            break;

        case 'get_orders_list':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $out = $app_utils->getOrdersList($user_id, $user_type);
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'get_order':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $order_id = $_POST['id'];
            $out = $app_utils->getOrder($order_id, $user_id, $user_type);
            echo ($out === null) ? 'error' : (($out === false) ? 'not_found' : json_encode($out));
            break;

        case 'get_order_products':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $order_id = $_POST['id'];
            $out = $app_utils->getOrderProducts($order_id, $user_id, $user_type);
            echo ($out === null) ? 'error' : (($out === false) ? 'not_found' : json_encode($out));
            break;

        case 'change_delivery_status':
            if (isset($_SESSION['user_type']) && $_SESSION['user_type'] === "admin") {
                $user_id = $_SESSION['user_id'];
                $order_id = $_POST['id'];
                $status = $_POST['status'];
                $out = $app_utils->changeDeliveryStatus($order_id, $status);
                echo ($out === false) ? 'error' : 'OK';
            } else {
                header('HTTP/1.1 403 Forbidden');
                echo "Not Authorized";
            }
            break;

        case 'get_new_notifications_num':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            if ($user_type === "admin") {
                $out = $app_utils->getNewNotificationsNum($user_type);
            } else {
                $out = $app_utils->getNewNotificationsNum($user_type, $user_id);
            }
            echo ($out === false) ? 'error' : $out;
            break;

        case 'get_notifications_list':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            if ($user_type === "admin") {
                $out = $app_utils->getNotificationsList($user_type);
            } else {
                $out = $app_utils->getNotificationsList($user_type, $user_id);
            }
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'get_notification':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $notify_id = $_POST['id'];
            $out = $app_utils->getNotification($notify_id, $user_type, $user_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : json_encode($out));
            break;

        case 'del_notification':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $notify_id = $_POST['id'];
            $out = $app_utils->deleteNotification($notify_id, $user_type, $user_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : 'OK');
            break;

        case 'set_notification_unread':
            $user_id = $_SESSION['user_id'];
            $user_type = $_SESSION['user_type'];
            $notify_id = $_POST['id'];
            $out = $app_utils->setNotificationUnread($notify_id, $user_type, $user_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : 'OK');
            break;

        case 'set_card_default':
            $user_id = $_SESSION['user_id'];
            $card_id = $_POST['id'];
            $out = $app_utils->setCardDefault($card_id, $user_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : 'OK');
            break;

        case 'remove_card':
            $user_id = $_SESSION['user_id'];
            $card_id = $_POST['id'];
            $out = $app_utils->removeCard($card_id, $user_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : 'OK');
            break;

        case 'add_card':
            $user_id = $_SESSION['user_id'];
            $card_info = json_decode($_POST['info'], true);
            $out = $app_utils->addCard($user_id, $card_info);
            echo ($out === false) ? 'error' : 'OK';
            break;
        
        case 'change_password':
            $user_id = $_SESSION['user_id'];
            $old_password = $_POST['old'];
            $new_password = $_POST['new'];
            $out = $app_utils->changePassword($user_id, $old_password, $new_password);
            echo ($out === null) ? 'error' : (($out === false) ? 'issue' : 'OK');
            break;

        case 'get_user_info':
            $user_id = $_SESSION['user_id'];
            $out = $app_utils->getUserInfo($user_id);
            echo ($out === false || $out === null) ? 'error' : json_encode($out);
            break;
        
        case 'delete_product':
            if (isset($_SESSION['user_type']) && $_SESSION['user_type'] === "admin") {
                $product_id = $_POST['id'];
                $out = $app_utils->deleteProduct($product_id);
                echo ($out === false || $out === null) ? 'error' : 'OK';
            } else {
                header('HTTP/1.1 403 Forbidden');
                echo "Not Authorized";
            }
            break;
        
        case 'get_products_list':
            $out = $app_utils->getProductsList();
            echo ($out === false) ? 'error' : json_encode($out);
            break;

        case 'get_reviews':
            $prod_id = $_POST['id'];
            $out = $app_utils->getReviews($prod_id);
            echo ($out === false) ? 'error' : json_encode($out);
            break;
        
        case 'user_can_comment':
            $user_id = $_SESSION['user_id'];
            $prod_id = $_POST['id'];
            $out = $app_utils->userCanComment($user_id, $prod_id);
            echo ($out === null) ? 'error' : (($out === false) ? 'NO' : 'OK');
            break;

        case 'insert_review':
            $user_id = $_SESSION['user_id'];
            $prod_id = $_POST['id'];
            $rate = $_POST['rate'];
            $title = $_POST['title'];
            $text = $_POST['text'];
            if (!$app_utils->userCanComment($user_id, $prod_id)) {
                echo "error";
            } else {
                $out = $app_utils->insertReview($user_id, $prod_id, $rate, $title, $text);
                echo ($out === false) ? 'error' : 'OK';
            }
            break;

        default:
            header('HTTP/1.1 501 Not Implemented');
            echo "Function ('func' parameter) '$F' not found!";

    }

}
