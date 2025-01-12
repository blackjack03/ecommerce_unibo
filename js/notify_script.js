
let readed = true;

function getNotification(notify_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_notification',
                id: notify_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
            if (response === "error") {
                resolve(null);
            } else if (response === "issue") {
                resolve(false);
            } else {
                resolve(JSON.parse(response));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

function delNotification(notify_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'del_notification',
                id: notify_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
            if (response === "error") {
                resolve(null);
            } else if (response === "issue") {
                resolve(false);
            } else if (response === "OK") {
                resolve(true);
            } else {
                resolve(null);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

function setUnread(notify_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'set_notification_unread',
                id: notify_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
            if (response === "error") {
                resolve(null);
            } else if (response === "issue") {
                resolve(false);
            } else if (response === "OK") {
                resolve(true);
            } else {
                resolve(null);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // SESSION CHECK & INIT NAVBAR
    const session = await check_login();
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
        }
    } else {
        window.location.replace("../login.html");
    }


    const url = window.location.href;
    const parts = url.split("?");

    let notify_id = null;

    if (parts.length >= 2) {
        const query = parts.slice(1).join("?");
        const params = new URLSearchParams(query);
        if (!params.has("id") || isNaN(parseInt(params.get("id")))) {
            window.location.replace("../index.html");
            return;
        }
        notify_id = parseInt(params.get("id"));
        if (params.has("to_read") && params.get("to_read") === "true") {
            params.delete("to_read");
            // Rimosso il parametro 'to_read' dall'URL lo aggiorno senza ricaricare la pagina
            history.replaceState({}, null, `?${params.toString()}`);
            checkNotifications(1);
        } else {
            checkNotifications();
        }
    } else {
        window.location.replace("../index.html");
        return;
    }

    /*
    * Il metodo 'getNotification' setta automaticamente la notifica come letta.
    * Per evitare problemi di concorrenza con 'checkNotifications(1)', che aggiorna
    * il numero di notifiche non lette sulla campana, inserisco una breve pausa
    * prima della chiamata a 'getNotification'.
    *
    * Senza questa pausa, *potrebbe* verificarsi che 'getNotification' venga
    * elaborato sul server prima di 'checkNotifications(1)', che riduce di 1 il numero
    * delle notifiche non lette. In tal caso, il numero sulla campana risulterebbe
    * decrementato di 2 anziché di 1, creando un'incongruenza.
    */
    await wait(500);

    const notification = await getNotification(notify_id);
    console.log(notification);

    if (notification === null) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    } else if (notification === false) {
        Swal.fire({
            title: "<span class='font-swal'>Notifica non trovata!</span>",
            html: "<span class='font-swal'>La notifica non è stata trovata o non hai l'autorizzazione per vederla!</span>",
            icon: "error"
        }).then(() => {
            // Redirect to Home Page
            window.location.replace("../index.html");
        });
        return;
    }

    document.querySelector("body > header > h2").innerHTML = notification["oggetto"];
    document.querySelector("body > main > section > p").innerHTML = notification["testo"];

    document.getElementById("delNotify").addEventListener("click", async () => {
        const id = notify_id;
        const deleted = await delNotification(id);
        if (deleted === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            }).then(() => {
                // Retry
                window.location.reload();
            });
            return;
        } else if (deleted === false) {
            Swal.fire({
                title: "<span class='font-swal'>Notifica non trovata!</span>",
                html: "<span class='font-swal'>La notifica non è stata trovata o non hai l'autorizzazione per vederla!</span>",
                icon: "error"
            }).then(() => {
                // Redirect to Home Page
                window.location.replace("../index.html");
            });
            return;
        }
        Swal.fire({
            title: "<span class='font-swal'>Notifica Eliminata!</span>",
            icon: "success"
        }).then(() => {
            // Redirect to Home Page
            window.location.replace("../notifies.html");
        });
    });

    document.getElementById("setUnread").addEventListener("click", async function() {
        const id = notify_id;
        const setted = await setUnread(id);
        if (setted === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            }).then(() => {
                // Retry
                window.location.reload();
            });
            return;
        } else if (setted === false) {
            Swal.fire({
                title: "<span class='font-swal'>Notifica non trovata!</span>",
                html: "<span class='font-swal'>La notifica non è stata trovata o non hai l'autorizzazione per vederla!</span>",
                icon: "error"
            }).then(() => {
                // Redirect to Home Page
                window.location.replace("../index.html");
            });
            return;
        }
        this.disabled = true;
        this.innerHTML = `<i class="fa-solid fa-bookmark"></i> Segnato Come da Leggere`;
    });

});
