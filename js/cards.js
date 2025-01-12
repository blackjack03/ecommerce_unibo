
function getCards() {
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

function deleteCard(card_id) {
    fetch('server/handler.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            func: 'remove_card',
            id: card_id
        }).toString()
     })
    .then(response => response.text())
    .then(data => {
        const response = data.trim();
        console.log(response);
        if (response === "OK") {
            Swal.fire({
                title: "<span class='font-swal'>Carta Eliminata!</span>",
                icon: "success"
            });
            document.getElementById(`card${card_id}`).remove();
        } else {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile eliminare la carta!</span>",
                icon: "error"
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Non è stato possibile eliminare la carta!</span>",
            icon: "error"
        });
    });
}

function setCardAsDefault(card_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'set_card_default',
                id: card_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
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

function addCard(card_info) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'add_card',
                info: JSON.stringify(card_info)
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
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
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
        } else {
            window.location.replace("../index.html");
        }
    } else {
        window.location.replace("../login.html");
    }


    const cards = await getCards();
    console.log(cards);

    if (cards === false) {
        Swal.fire({
            title: "<span class='font-swal'>Errore del Server!</span>",
            html: "<span class='font-swal'>Non è stato possibile recuperare le tue carte a causa di un errore sconosciuto del server!</span>",
            icon: "error"
        });
    } else {
        const cardsContainer = document.querySelector("body > main > section");
        for (const card of cards) {
            const numero_carta = splitEveryN(card["numero_carta"], 4).join(" ");
            const icon = (card["is_default"] === 1) ? `<i class="fa-solid fa-star" data-id="${card["id_carta"]}"></i>` : `<i class="fa-regular fa-star" data-id="${card["id_carta"]}"></i>`;
            const article = document.createElement("article");
            article.id = "card" + card["id_carta"];
            article.innerHTML = `<header>${icon}<h3>${card["nome_carta"]}</h3><button class="btn btn-danger" onclick="deleteCard(${card["id_carta"]});"><i class="fa-solid fa-trash"></i></button></header>
<main><p>${card["nome_sulla_carta"]}</p><p>${numero_carta}</p><p><span class="fw-bold">Scadenza</span><span>${card["scadenza"]}</span></p><p><span class="fw-bold">CVV</span><span>${card["CVV"]}</span></p></main>`;
            cardsContainer.appendChild(article);
        }
        if (cards.length === 0) {
            cardsContainer.innerHTML = '<p class="noCardsAlert">Non hai inserito nessuna carta di credito!</p>';
        }
        const all_icons = document.querySelectorAll("body > main > section > article > header > i");
        for (const icon of all_icons) {
            icon.addEventListener("click", async function() {
                const id = this.dataset.id;
                if (this.classList.contains("fa-solid")) {
                    return;
                }
                const now_default_elem = document.querySelector("body > main > section > article > header > i.fa-solid");
                if (now_default_elem) {
                    now_default_elem.classList.replace("fa-solid", "fa-regular");
                }
                const setted = await setCardAsDefault(id);
                if (setted) {
                    this.classList.remove("fa-regular");
                    this.classList.add("fa-solid");
                } else {
                    Swal.fire({
                        title: "<span class='font-swal'>Errore del Server!</span>",
                        html: "<span class='font-swal'>Non è stato possibile impostare la carta come carta di default!</span>",
                        icon: "error"
                    });
                }
            });
        }
    }

    document.getElementById("numero_carta").addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });

    document.getElementById("cvv").addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });

    document.getElementById("numero_carta").addEventListener("input", function (event) {
        const rawValue = this.value.replace(/\s+/g, ""); // Rimuove gli spazi esistenti
        if (rawValue.length > 16) {
            this.value = splitEveryN(rawValue.slice(0, 16), 4).join(" ");
            return;
        }
        const formattedValue = splitEveryN(rawValue, 4).join(" ");
        this.value = formattedValue;
    });

    const this_year = new Date().getFullYear();
    for (let year = this_year; year <= this_year + 25; year++) {
        const option = document.createElement("option");
        option.value = year.toString().slice(2);
        option.textContent = year;
        if (year === this_year + 1) {
            option.selected = true;
        }
        document.getElementById("scadenza_yy").appendChild(option);
    }

    const form = document.getElementById("add_new_card_form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.checkValidity()) {
            Swal.fire({
                title: "<span class='font-swal'>Completa tutti i dati della carta!</span>",
                icon: "warning"
            });
            return;
        }
        const card_expired = document.getElementById("scadenza_gg").value + "/" + document.getElementById("scadenza_yy").value;
        const card_info = {
            "nome_carta": document.getElementById("nome_carta").value,
            "nome": document.getElementById("nome").value,
            "numero_carta": document.getElementById("numero_carta").value.split(" ").join(""),
            "scadenza": card_expired,
            "cvv": document.getElementById("cvv").value
        };
        const added = await addCard(card_info);
        if (added) {
            Swal.fire({
                title: "<span class='font-swal'>Carta Aggiunta!</span>",
                icon: "success"
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile aggiungere la carta!</span>",
                icon: "error"
            });
        }
    });

});
