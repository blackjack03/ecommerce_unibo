
document.addEventListener("DOMContentLoaded", async () => {
    // SESSION CHECK & INIT NAVBAR
    const session = await check_login();
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        checkNotifications();
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
        } else {
            window.location.replace("../index.html");
        }
    } else {
        window.location.replace("../index.html");
    }

    const order_id = sessionStorage.getItem("order_id");
    if (order_id !== null) {
        document.querySelector("body > main > footer a").setAttribute("href", `order.html?id=${order_id}`);
        document.querySelector("body > main").style.display = "flex";
        sessionStorage.removeItem("order_id");
    } else {
        window.location.replace("../index.html");
    }

});
