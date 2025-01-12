
function getProduct(product_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_product',
                id: product_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            if (response === "error") {
                resolve(null);
            } else if (response === "not_found") {
                resolve(false);
            } else {
                resolve(JSON.parse(data));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

function deleteProduct(product_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'delete_product',
                id: product_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            console.log(data);
            const response = data.trim();
            if (response === "OK") {
                resolve(true);
            } else {
                resolve(false);
            }
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
        if (session !== "admin") {
            window.location.replace("../index.html");
        }
    } else {
        window.location.replace("../admin_login.html");
    }


    const url = window.location.href;
    const parts = url.split("?");

    let product_id = null;

    if (parts.length >= 2) {
        const query = parts.slice(1).join("?");
        const params = new URLSearchParams(query);
        if (!params.has("id") || isNaN(parseInt(params.get("id")))) {
            window.location.replace("../index.html");
            return;
        }
        product_id = parseInt(params.get("id"));
    } else {
        window.location.replace("../index.html");
        return;
    }

    const status = sessionStorage.getItem("status_change");
    if (status !== null) {
        if (status === "OK") {
            document.querySelector("div.alert.alert-success").style.display = "block";
        } else if (status === "error") {
            document.querySelector("div.alert.alert-danger").style.display = "block";
        }
        sessionStorage.removeItem("status_change");
    }

    const product_info = await getProduct(product_id);
    console.log(product_info);

    if (product_info === null) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    } else if (product_info === false) {
        Swal.fire({
            title: "<span class='font-swal'>Prodotto non trovato!</span>",
            html: "<span class='font-swal'>Il prodotto cercato non è stato trovato nel nostro database!</span>",
            icon: "error"
        }).then(() => {
            // Redirect to Home Page
            window.location.replace("../index.html");
        });
        return;
    }

    document.querySelector("body > main > form input[name='prod_id']").value = product_info["product_id"];
    document.getElementById("name").value = product_info["nome"];
    document.getElementById("descr").value = product_info["descrizione"];
    document.getElementById("price").value = product_info["prezzo"];
    document.getElementById("qta").value = product_info["quantita"];

    document.querySelector("body > main > form button[type='submit']").disabled = false;

    document.getElementById("also_image").addEventListener("click", function() {
        if (this.checked) {
            document.getElementById("ph1").required = true;
            document.querySelector("body > main > form > fieldset").style.display = "block";
        } else {
            document.getElementById("ph1").required = false;
            document.querySelector("body > main > form > fieldset").style.display = "none";
        }
    });

    document.querySelector("body > main > footer > fieldset button").addEventListener("click", () => {
        Swal.fire({
            title: `Vuoi davvero eliminare il prodotto? L'azione NON è reversibile!`,
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: "Elimina",
            denyButtonText: `Annulla`,
            denyButtonColor: 'gray',
            confirmButtonColor: 'red'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const deleted = await deleteProduct(product_id);
                if (deleted) {
                    Swal.fire({
                        title: "Prodotto Eliminato!",
                        icon: "success"
                    }).then(() => {
                        // Refresh
                        window.location.replace("../account.html");
                    });
                } else {
                    Swal.fire({
                        title: "Errore!",
                        html: "Non è stato possibile eliminare il prodotto!",
                        icon: "error"
                    });
                }
            }
        });
    });

});
