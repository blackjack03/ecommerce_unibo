
(async () => {

    const session = await check_login();
    if (session !== 'admin') {
        window.location.replace("../index.html");
    }

})();


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("logoutBtn").style.display = "block";
    document.getElementById("accountBtn").style.display = "block";

    checkNotifications();

    const new_product = sessionStorage.getItem("product_added");
    if (new_product !== null) {
        if (sessionStorage.getItem("product_added") === "error") {
            document.querySelector(".alert.alert-danger").style.display = "block";
        }
        sessionStorage.removeItem("product_added");
    }

    const price_field = document.getElementById("price");
    const quantiy_field = document.getElementById("qta");

    // Allow only float values
    price_field.addEventListener("keypress", (event) => {
        if (!/[0-9.,]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });

    // Allow only int values
    quantiy_field.addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });

});
