
function getOrdersList() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_orders_list'
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
    // SESSION CHECK & INIT NAVBAR
    const session = await check_login();
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        checkNotifications();
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
        }
    } else {
        window.location.replace("../login.html");
    }

    const orders_list = await getOrdersList();
    console.log(orders_list);
    if (orders_list === false) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
    } else {
        if (orders_list.length === 0) {
            document.querySelector("body > main > section > p.text-danger").classList.remove("d-none");
        }
        for (let i = 0; i < orders_list.length; i++) {
            const order = orders_list[i];
            const article = document.createElement("article");
            article.innerHTML = `<p><span>Ordine&nbsp;</span>${i + 1}</p><p>${order["costo_totale"]} €</p><p>${formatTimestamp(order["timestamp"])}</p>`;
            article.addEventListener("click", () => {
                const id = order["order_id"];
                window.location.href = `../order.html?id=${id}`;
            });
            const head = document.querySelector("body > main > section > article.head");
            // document.querySelector("body > main > section").prepend(article);
            document.querySelector("body > main > section").insertBefore(article, head.nextSibling);
        }
    }

});
