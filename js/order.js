
function getOrder(id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_order',
                id: id
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
                resolve(JSON.parse(response));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

function getOrderProducts(order_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_order_products',
                id: order_id
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
                resolve(JSON.parse(response));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(false);
        });
    });
}

function changeStatus(order_id, status) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'change_delivery_status',
                id: order_id,
                status: status
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
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
    /* JS for responsive table */
    const mediaQueryPortrait = window.matchMedia('(orientation: portrait)');
    function handleOrientationChange(e) {
        if (e.matches) {
            document.querySelectorAll("body > main > section > table thead tr th")[0].removeAttribute("colspan");
            document.querySelectorAll("body > main > section > table tfoot tr td")[0].setAttribute("colspan", "3");
        } else {
            document.querySelectorAll("body > main > section > table thead tr th")[0].setAttribute("colspan", "2");
            document.querySelectorAll("body > main > section > table tfoot tr td")[0].setAttribute("colspan", "4");
        }
    }
    handleOrientationChange(mediaQueryPortrait);
    mediaQueryPortrait.addEventListener('change', handleOrientationChange);


    const url = window.location.href;
    const parts = url.split("?");

    let order_id = null;

    if (parts.length >= 2) {
        const query = parts.slice(1).join("?");
        const params = new URLSearchParams(query);
        if (!params.has("id") || isNaN(parseInt(params.get("id")))) {
            window.location.replace("../index.html");
            return;
        }
        order_id = parseInt(params.get("id"));
    } else {
        window.location.replace("../index.html");
        return;
    }


    // SESSION CHECK & INIT NAVBAR
    const session = await check_login();
    let last_delivery_state_val = null;
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        checkNotifications();
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
        } else {
            const main = document.querySelector("body > main");
            const fieldset = document.createElement("fieldset");
            fieldset.className = "border p-2 adminPanel";
            const legend = document.createElement("legend");
            legend.className = "float-none w-auto";
            legend.textContent = "Cambia Stato Ordine";
            fieldset.appendChild(legend);
            const select = document.createElement("select");
            select.id = "status_selector";
            select.innerHTML = `<option value="default" selected disabled>Stato Spedizione</option>
<option value="Inserito">Inserito</option>
<option value="Evaso">Evaso</option>
<option value="Spedito">Spedito</option>
<option value="In Consegna">In Consegna</option>
<option value="Consegnato">Consegnato</option>`;
            select.addEventListener("change", function() {
                console.log(this.value);
                Swal.fire({
                    title: `Vuoi cambiare lo stato della spedizione da <span class="underline">${last_delivery_state_val}</span> a <span class="underline">${this.value}</span>?`,
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: "Cambia",
                    denyButtonText: `Annulla`
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        const changed = await changeStatus(order_id, this.value);
                        if (changed) {
                            last_delivery_state_val = this.value;
                            Swal.fire({
                                title: "Stato Spedizione Cambiato!",
                                icon: "success"
                            }).then(() => {
                                // Refresh
                                window.location.reload();
                            });
                        } else {
                            this.value = last_delivery_state_val;
                            Swal.fire({
                                title: "Errore!",
                                html: "Non è stato possibile modificare lo stato della spedizione per un errore o non sei autorizzato a farlo!",
                                icon: "error"
                            });
                        }
                    } else {
                        this.value = last_delivery_state_val;
                    }
                });
            });
            fieldset.appendChild(select);
            // Add Admin classes
            main.classList.add("admin");
            document.querySelector("section.generalInfo").classList.add("admin");
            document.querySelector("section.tracking").classList.add("admin");
            document.querySelector("section.details").classList.add("admin");
            main.prepend(fieldset);
        }
    } else {
        window.location.replace("../login.html");
    }


    const order_info = await getOrder(order_id);
    console.log(order_info);

    if (order_info === null) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    } else if (order_info === false) {
        Swal.fire({
            title: "<span class='font-swal'>Ordine non trovato!</span>",
            html: "<span class='font-swal'>L'ordine cercato non è stato trovato nel nostro database o non hai l'autorizzazione per visualizzarlo!</span>",
            icon: "error"
        }).then(() => {
            // Redirect to Home Page
            window.location.replace("../index.html");
        });
        return;
    }

    const order_products = await getOrderProducts(order_id);
    // console.log(order_products);

    if (order_products === null) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    } else if (order_products === false) {
        Swal.fire({
            title: "<span class='font-swal'>Ordine non trovato!</span>",
            html: "<span class='font-swal'>L'ordine cercato non è stato trovato nel nostro database o non hai l'autorizzazione per visualizzarlo!</span>",
            icon: "error"
        }).then(() => {
            // Redirect to Home Page
            window.location.replace("../index.html");
        });
        return;
    }

    const table = document.querySelector("body > main > section > table tbody");

    for (const prod of order_products) {
        const id = prod.product_id;
        const image_name = JSON.parse(prod.images)[0];

        /* Create HTML */
        // Table Row <tr>
        const row = document.createElement("tr");

        // TD for Image
        const td_img = document.createElement("td");
        td_img.className = "tdImage";
        const img_alt = (id !== null) ? `Immagine di ${prod.nome}` : "Prodotto Eliminato";
        td_img.innerHTML = `<img src="products_images/${image_name}" alt="${img_alt}" />`;
        // TD for Product Name
        const td_name = document.createElement("td");
        td_name.className = "tdName";
        if (id !== null) {
            td_name.innerHTML = `<a href="product.html?id=${id}" target="_blank">${prod.nome}</a>`;
        } else {
            td_name.innerHTML = prod.nome;
        }
        // TD for product's price
        const td_price = document.createElement("td");
        td_price.innerHTML = `<strong>${prod.prezzo} €</strong>`;
        // TD for quantity
        const td_quantity = document.createElement("td");
        td_quantity.innerHTML = `<strong>${prod.quantita}</strong>`;
        // TD for TOT price
        const td_tot_price = document.createElement("td");
        td_tot_price.innerHTML = `<strong>${prod.prezzo_tot} €</strong>`;

        // Add ALL Elements to Table
        row.appendChild(td_img);
        row.appendChild(td_name);
        row.appendChild(td_price);
        row.appendChild(td_quantity);
        row.appendChild(td_tot_price);
        table.prepend(row);
    }

    document.getElementById("total").innerText = `${order_info["costo_totale"]} €`;

    const starter = (session === "user") ? "Hai ordinato" : "L'utente ha ordinato";
    const card_name = (order_info["tipo_pagamento"] === "carta") ?
        ((order_info["id_carta"] === null) ?
            ' <em>(carta eliminata)</em>' :
            ` (${order_info["nome_carta"]})`
        ) :
        "";
    const payment_info = `Metodo di pagamento: <strong>${order_info["tipo_pagamento"]}${card_name}</strong>`;
    const s = (order_info["n_prodotti"] === 1) ? 'o' : 'i';
    document.querySelector("section.generalInfo > p").innerHTML = `${starter} complessivamente <strong>${order_info["n_prodotti"]} prodott${s}</strong> per un totale di <strong>${order_info["costo_totale"]} €</strong>.<br/>${payment_info}<br/>Stato Ordine: <strong>${order_info["stato_ordine"]}</strong>`;

    const stato = order_info["stato_ordine"];
    let code = -1;
    switch (stato) {
        case "Inserito":
            code = 1;
            break;
        case "Evaso":
            code = 2;
            break;
        case "Spedito":
            code = 3;
            break;
        case "In Consegna":
            code = 4;
            break;
        case "Consegnato":
            code = 5;
            break;
    }
    console.log(code);

    if (session === "admin") {
        document.getElementById("status_selector").value = stato;
        last_delivery_state_val = stato;
    }

    if (code < 5) {
        document.querySelector(`section.tracking section.icons > div:nth-of-type(${code})`).classList.add("next");
    }

    for (let i = 1; i <= code; i++) {
        if (i > 1) {
            document.querySelector(`section.tracking section.icons > div:nth-of-type(${i - 1})`).classList.add("active");
        }
        document.querySelector(`section.tracking section.status > p:nth-of-type(${i})`).classList.add("active");
        document.querySelector(`section.tracking section.icons > article:nth-of-type(${i}) div`).classList.add("active");
    }

});
