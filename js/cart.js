
/* Set Toatr Settings */
toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}


/* OTHER */
const quantities_cache = {};
const products_costs = {};
let cardsRetrieved = false;

function getCartList() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_cart'
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

function modifyQuantity(id, quantity) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'change_quantity_cart',
                id: id,
                qty: quantity
            }).toString()
        })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            if (response === 'OK') {
                resolve(true);
            } else if (response === 'quantity_issue') {
                resolve(false);
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

function deleteFromCart(id) {
    fetch('server/handler.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            func: 'delete_from_cart',
            id: id
        }).toString()
    })
    .then(response => response.text())
    .then(data => {
        const response = data.trim();
        if (response === 'OK') {
            toastr["success"]("Prodotto rimosso!");
            document.getElementById(`row_${id}`).remove();
            delete quantities_cache[`${id}`];
            refreshNumOnCart();
            document.getElementById("total").innerText = `${calculateCartTotal().toFixed(2)} €`;
            if (document.querySelectorAll("body > main > table tbody tr[id^='row_']").length === 0) {
                document.getElementById("put_order").disabled = true;
                document.getElementById("emptyrow").style.display = "block";
                document.querySelectorAll("body > main > table tfoot")[0].style.display = "none";
            }
        } else {
            toastr["error"]("Errore durante l'aggiornamento del carrello!");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        toastr["error"]("Errore durante l'aggiornamento del carrello!");
    });
}

function userHasCard() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'user_has_card'
            }).toString()
         })
        .then(response => response.json())
        .then(data => {
            resolve(data.status);
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(false);
        });
    });
}

function getUserCards() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_cards'
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

function calculateCartTotal() {
    const keys = Object.keys(quantities_cache);
    let total = 0;
    for (const key of keys) {
        total += quantities_cache[key] * products_costs[key];
    }
    return total;
}

function disableAllTableInput() {
    const tableInputs = [...document.querySelectorAll('body > main > table input[type="number"]')];
    const tableButtons = [...document.querySelectorAll('body > main > table button')];
    const all_elements = tableInputs.concat(tableButtons);
    for (const element of all_elements) {
        element.disabled = true;
    }
}

function putOrder() {
    const type = {};
    if (document.getElementById("contrassegno").checked) {
        type["type"] = "contrassegno";
    } else if (document.getElementById("carta").checked) {
        type["type"] = "carta";
        type["card_id"] = document.getElementById("cards").value;
    }
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'put_order',
                type: JSON.stringify(type)
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            if (response === "error") {
                resolve(null);
            } else if (response === "issue") {
                resolve(false);
            } else {
                resolve(response);
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
            document.querySelectorAll("body > main > table thead tr th")[0].removeAttribute("colspan");
            document.querySelector("#emptyrow td").setAttribute("colspan", "4");
            document.querySelectorAll("body > main > table  tfoot tr td")[0].setAttribute("colspan", "3");
        } else {
            document.querySelectorAll("body > main > table thead tr th")[0].setAttribute("colspan", "2");
            document.querySelector("#emptyrow td").setAttribute("colspan", "5");
            document.querySelectorAll("body > main > table tfoot tr td")[0].setAttribute("colspan", "4");
        }
    }
    handleOrientationChange(mediaQueryPortrait);
    mediaQueryPortrait.addEventListener('change', handleOrientationChange);


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
        window.location.replace("../login.html");
    }

    const isUserHasCard = await userHasCard();
    if (isUserHasCard === null) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    } else if (isUserHasCard) {
        document.getElementById("carta").disabled = false;
    }

    // Cart Handle
    const cart = await getCartList();
    // console.log(cart);
    if (cart === false) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
            icon: "error"
        }).then(() => {
            // Retry
            window.location.reload();
        });
        return;
    }

    const table = document.querySelector("body > main > table tbody");

    for (const prod of cart) {
        const id = prod.product_id;
        quantities_cache[`${id}`] = prod.qta;
        products_costs[`${id}`] = prod.prezzo;
        const image_name = JSON.parse(prod.images)[0];

        /* Create HTML */
        // Table Row <tr>
        const row = document.createElement("tr");
        row.id = `row_${id}`;

        // TD for Image
        const td_img = document.createElement("td");
        td_img.className = "tdImage";
        td_img.innerHTML = `<img src="products_images/${image_name}" alt="Immagine di ${prod.nome}" />`;
        // TD for Product Name
        const td_name = document.createElement("td");
        td_name.className = "tdName";
        td_name.innerHTML = `<a href="product.html?id=${id}" target="_blank">${prod.nome}</a>`;
        // TD for product's price
        const td_price = document.createElement("td");
        td_price.innerHTML = `<strong>${prod.prezzo} €</strong>`;
        // TD for selected Quantity
        const td_quantity = document.createElement("td");
        const qty_input = document.createElement("input");
        qty_input.type = "number";
        qty_input.min = "1";
        qty_input.max = prod.disponibile;
        // qty_input.id = `quantity_${id}`;
        qty_input.value = prod.qta;
        qty_input.addEventListener("change", async function() {
            const prod_id = id;
            const val = parseInt(this.value);
            if (isNaN(val) || val < 1) {
                toastr["error"]("Quantità non valida!");
                this.value = quantities_cache[`${prod_id}`];
                return;
            } else if (val > this.max) {
                toastr["error"]("Quantità non disponibile!");
                this.value = quantities_cache[`${prod_id}`];
                return;
            }
            const resp = await modifyQuantity(prod_id, val);
            if (resp === true) {
                quantities_cache[`${prod_id}`] = val;
                refreshNumOnCart();
                document.getElementById("total").innerText = `${calculateCartTotal().toFixed(2)} €`;
                toastr["success"]("Carrello aggiornato!");
            } else if (resp === false) {
                this.value = quantities_cache[`${prod_id}`];
                toastr["error"]("Quantità non disponibile!");
            } else {
                this.value = quantities_cache[`${prod_id}`];
                toastr["error"]("Errore durante l'aggiornamento del carrello!");
            }
        });
        td_quantity.appendChild(qty_input);
        // TD for Remove from Cart Button
        const td_delete = document.createElement("td");
        td_delete.className = "tdDelete";
        const del_button = document.createElement("button");
        del_button.className = "btn btn-danger";
        del_button.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        del_button.addEventListener("click", () => {
            const prod_id = id;
            deleteFromCart(prod_id);
        });
        td_delete.appendChild(del_button);

        // Add ALL Elements to Table
        row.appendChild(td_img);
        row.appendChild(td_name);
        row.appendChild(td_price);
        row.appendChild(td_quantity);
        row.appendChild(td_delete);
        table.prepend(row);
    }

    if (cart.length === 0) {
        document.getElementById("emptyrow").style.display = "block";
    } else {
        document.getElementById("total").innerText = `${calculateCartTotal().toFixed(2)} €`;
        document.querySelectorAll("body > main > table tfoot")[0].style.display = "table-footer-group";
        document.getElementById("put_order").disabled = false;
    }

    // ADD others EventListeners
    document.getElementById("contrassegno").addEventListener("change", function() {
        if (this.checked) {
            document.querySelector("body > main > fieldset > fieldset").style.display = "none";
        }
    });

    document.getElementById("carta").addEventListener("change", async function() {
        const cart_field = document.querySelector("body > main > fieldset > fieldset");
        if (this.checked) {
            cart_field.style.display = "block";
        }
        if (!cardsRetrieved) {
            const cards = await getUserCards();
            if (cards === false) {
                Swal.fire({
                    title: "<span class='font-swal'>Errore del Server!</span>",
                    html: "<span class='font-swal'>Non è stato possibile prendere le carte!<br/>Riprova più tardi o contatta l'assistenza.</span>",
                    icon: "error"
                });
                document.querySelector("body > main > fieldset > fieldset").style.display = "none";
                document.querySelector("body > main > fieldset > fieldset label[for='cards']").style.display = "none";
                document.getElementById("cards").style.display = "none";
                document.getElementById("contrassegno").checked = true;
            } else {
                for (const card of cards) {
                    const option = document.createElement("option");
                    option.value = card.id_carta;
                    option.textContent = card.nome_carta;
                    if (card.is_default === 1) {
                        option.selected = true;
                    }
                    document.getElementById("cards").appendChild(option);
                }
                document.querySelector("body > main > fieldset > fieldset > i").remove();
                document.querySelector("body > main > fieldset > fieldset label[for='cards']").style.display = "block";
                document.getElementById("cards").style.display = "block";
                cardsRetrieved = true;
            }
        }
    });

    document.getElementById("put_order").addEventListener("click", async function() {
        this.disabled = true;
        disableAllTableInput();
        this.querySelector("i").style.display = "inline-block";
        const ordered = await putOrder();
        console.log(ordered);
        if (ordered === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile completare l'ordine!<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            }).then(() => {
                window.location.reload();
            });
        } else if (ordered === false) {
            Swal.fire({
                title: "<span class='font-swal'>Errore!</span>",
                html: "<span class='font-swal'>Non è stato possibile completare l'ordine!<br/><strong>Potrebbe essere successo che:</strong> <ul style='text-align: left;'><li>Errore del server</li><li>Uno dei prodotti potrebbe non essere disponibile nella quantità selezionata</li></ul></span>",
                icon: "error"
            }).then(() => {
                window.location.reload();
            });
        } else {
            sessionStorage.setItem("order_id", ordered);
            window.location.href = "done.html";
        }
    });

});
