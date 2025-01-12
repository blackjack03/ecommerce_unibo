
function getAllNotifications() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_notifications_list'
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


    const notifications = await getAllNotifications();
    console.log(notifications);

    if (notifications === false) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
    } else {
        if (notifications.length === 0) {
            document.querySelector("body > main > section > p.text-danger").classList.remove("d-none");
        }
        for (let i = 0; i < notifications.length; i++) {
            const notify = notifications[i];
            const toReadClass = (notify["da_leggere"] === 1) ? " class='unread'" : "";
            const urlReadParam = (notify["da_leggere"] === 1) ? "&to_read=true" : "";
            const article = document.createElement("article");
            article.title = notify["oggetto"];
            article.innerHTML = `<p${toReadClass}>${notify["oggetto"]}</p><p${toReadClass}>${formatTimestamp(notify["timestamp"])}</p>`;
            article.addEventListener("click", () => {
                const id = notify["notify_id"];
                window.location.href = `../notify.html?id=${id}${urlReadParam}`;
            });
            document.querySelector("body > main > section").appendChild(article);
        }
    }

});
