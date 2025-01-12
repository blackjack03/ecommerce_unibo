
function getUserInfo() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_user_info'
            }).toString()
         })
        .then(response => response.json())
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(false);
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    // Functions to Create Homepage
    function createAdminDashboard() {
        const section_html = `<button class="btn btn-primary" onclick="window.location.href='orders.html';">Visualizza gli Ordini</button>
            <button class="btn btn-success" onclick="window.location.href='manage_products.html';">Modifica Catalogo Prodotti</button>
            <button class="btn btn-warning" onclick="window.location.href='notifies.html';">Visualizza Notifiche</button>
            <button class="btn btn-info" onclick="window.location.href='change_password.html';">Modifica Password</button>
            <button class="btn btn-danger" onclick="window.location.href='server/logout.php';">LOGOUT</button>`;
        document.querySelector("body > main > section").innerHTML = section_html;
    }

    function createUserDashboard() {
        const section_html = `<button class="btn btn-primary" onclick="window.location.href='orders.html';">Visualizza i Tuoi Ordini</button>
            <button class="btn btn-warning" onclick="window.location.href='notifies.html';">Visualizza Notifiche</button>
            <button class="btn btn-dark" onclick="window.location.href='cards.html';">Gestisci Carte di Credito</button>
            <button class="btn btn-info" onclick="window.location.href='change_password.html';">Modifica Password</button>
            <button class="btn btn-danger" onclick="window.location.href='server/logout.php';">LOGOUT</button>`;
        document.querySelector("body > main > section").innerHTML = section_html;
    }


    // SESSION CHECK & INIT NAVBAR
    const session = await check_login();
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        checkNotifications();
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
            createUserDashboard();
        } else {
            createAdminDashboard();
        }
    } else {
        window.location.replace("../login.html");
    }

    const user_info = await getUserInfo();
    console.log(user_info);

    if (user_info !== false) {
        const completition = (user_info === "admin") ? 'Amministratore' : user_info["nome"];
        document.querySelector("body > header > h2").innerText = `Ciao ${completition}`;
    }

});
