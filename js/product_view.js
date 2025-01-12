
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
                resolve(JSON.parse(response));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(null);
        });
    });
}

function addToCart(product_id, quantity) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'add_to_cart',
                id: product_id,
                qty: quantity
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
            if (response === "error") {
                resolve(null);
            } else if (response === "quantity_issue") {
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

function getReviews(product_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_reviews',
                id: product_id
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

function userCanComment(product_id) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'user_can_comment',
                id: product_id
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            console.log(response);
            if (response === "NO") {
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

function insertReview(product_id, rate, title, text) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'insert_review',
                id: product_id,
                rate: rate,
                title: title,
                text: text
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
    // SESSION CHECK & INIT NAVBAR
    let isLoggedAsUser = false;
    let isLoggedAsAdmin = false;
    const session = await check_login();
    if (session !== false) {
        document.getElementById("logoutBtn").style.display = "block";
        document.getElementById("accountBtn").style.display = "block";
        checkNotifications();
        if (session === "user") {
            refreshNumOnCart();
            document.querySelectorAll(".nav-item.cart")[0].style.display = "block";
            isLoggedAsUser = true;
        } else {
            document.getElementById("cart_adder_form").style.display = "none";
            document.querySelector("body > main > footer > section > button").style.display = "none";
            isLoggedAsAdmin = true;
        }
    } else {
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("adminLoginBtn").style.display = "block";
        document.getElementById("signupBtn").style.display = "block";
    }


    const new_product = sessionStorage.getItem("product_added");
    if (new_product !== null) {
        if (sessionStorage.getItem("product_added") === "OK") {
            document.querySelector(".alert.alert-success").style.display = "block";
        }
        sessionStorage.removeItem("product_added");
    }


    // Allow only int values on quantity selector
    document.getElementById("quantity").addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });


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

    if (isLoggedAsAdmin) {
        const modify_btn = document.createElement("button");
        modify_btn.className = "btn btn-primary";
        modify_btn.innerHTML = '<i class="fa-solid fa-pen"></i> Modifica Prodotto';
        modify_btn.addEventListener("click", () => {
            window.location.href = `update_product.html?id=${product_id}`;
        });
        document.querySelector("body > main > section").insertBefore(modify_btn, document.getElementById("desc"));
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

    // Add images
    const slideShowIndicators = document.getElementById("slideIndicators");
    const slideShowImages = document.getElementById("slideImageContainer");
    const images = JSON.parse(product_info.images);
    const firstImg = document.createElement("img");
    firstImg.src = `products_images/${images[0]}`;
    firstImg.alt = `Immagine 1 di ${product_info.nome}`;
    firstImg.classList.add("d-block", "w-100");
    document.getElementById("slideFirstImageContainer").replaceChildren();
    document.getElementById("slideFirstImageContainer").appendChild(firstImg);
    for (let i = 1; i < images.length; i++) {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.dataset.bsTarget = "#carousel";
        indicator.dataset.bsSlideTo = i;
        indicator.setAttribute("aria-label", `Slide ${i + 1}`);
        slideShowIndicators.appendChild(indicator);
        const container = document.createElement("div");
        container.className = "carousel-item";
        const image = document.createElement("img");
        image.src = `products_images/${images[i]}`;
        image.alt = `Immagine ${i + 1} di ${product_info.nome}`;
        image.classList.add("d-block", "w-100");
        container.appendChild(image);
        slideShowImages.appendChild(container);
    }

    const prod_rate = Math.round(product_info.avg_rate);
    let htmlContent = "";
    for (let j = 1; j <= 5; j++) {
        if (j <= prod_rate) {
            htmlContent += `<i class="fa-solid fa-star"></i>`;
        } else {
            htmlContent += `<i class="fa-regular fa-star"></i>`;
        }
    }
    htmlContent += `<span>${prod_rate.toFixed(2)}</span>`;
    document.querySelector("body > main > section > section.rate").innerHTML = htmlContent;

    document.getElementById("price").innerText = product_info.prezzo.toFixed(2) + " €";
    document.getElementById("prodName").innerText = product_info.nome;
    document.getElementById("desc").innerHTML = product_info.descrizione;

    if (product_info.quantita === 0) {
        document.getElementById("quantity").disabled = true;
        document.getElementById("addToCart").disabled = true;
        document.getElementById("warn2").style.display = "block";
    } else if (product_info.quantita <= 10) {
        const s = (product_info.quantita === 1) ? "o" : "i";
        document.getElementById("warn1").innerText = `Solo ${product_info.quantita} pezz${s} rimast${s}!`;
        document.getElementById("warn1").style.display = "block";
    }

    if (product_info.quantita > 0) {
        document.getElementById("quantity").max = product_info.quantita;
    }

    /* ADD others EVENTS LISTENERS */

    document.getElementById("cart_adder_form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const qty = parseInt(document.getElementById("quantity").value);
        if (isNaN(qty) || qty < 1) {
            toastr["error"]("Quantità non valida!");
            document.getElementById("quantity").value = 1;
            return;
        }
        if (!isLoggedAsUser) {
            Swal.fire({
                title: "<span class='font-swal'>Non sei Loggato!</span>",
                html: "<span class='font-swal'>Devi essere loggato per aggiungere l'articolo al carrello!</span>",
                icon: "info"
            });
            return;
        }
        document.getElementById("addToCart").disabled = true;
        const added = await addToCart(product_id, qty);
        if (added === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Prodotto non aggiunto al carrello a causa di un errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            });
        } else if (added === false) {
            toastr["error"]("Quantità scelta non disponibile!");
        } else {
            toastr["success"]("Prodotto aggiunto al carrello!");
        }
        document.getElementById("addToCart").disabled = false;
        refreshNumOnCart();
    });

    document.querySelector("body > main > footer > button").addEventListener("click", async function() {
        this.disabled = true;

        const id = product_id;
        const reviews = await getReviews(id);
        console.log(reviews);

        if (reviews === false) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile recuperare le recensioni a causa di un errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            });
            this.disabled = false;
            return;
        }

        this.style.display = "none";

        const reviews_section = document.querySelector("body > main > footer > section");

        reviews_section.style.display = "block";

        if (reviews.length === 0) {
            document.querySelector("body > main > footer > section > p").style.display = "block";
        }

        for (const review of reviews) {
            const article = document.createElement("article");
            const name = document.createElement("p");
            name.className = "name";
            name.innerHTML = '<i class="fa-solid fa-circle-user"></i> ' + review["name"];
            // Create section for rate
            const rate = document.createElement("section");
            rate.className = "rate";
            const prod_rate = review["stars"];
            let htmlContent = "";
            for (let j = 1; j <= 5; j++) {
                if (j <= prod_rate) {
                    htmlContent += `<i class="fa-solid fa-star"></i>`;
                } else {
                    htmlContent += `<i class="fa-regular fa-star"></i>`;
                }
            }
            rate.innerHTML = htmlContent;
            const h3 = document.createElement("h4");
            h3.innerText = review["titolo"];
            const review_text = document.createElement("p");
            review_text.textContent = review["testo"];
            // Append all elems to article
            article.appendChild(name);
            article.appendChild(rate);
            article.appendChild(h3);
            article.appendChild(review_text);
            // Append review to revies section
            reviews_section.appendChild(article);
        }

    });

    document.querySelector("body > main > footer > section > button").addEventListener("click", async () => {
        if (!isLoggedAsUser) {
            Swal.fire({
                title: "<span class='font-swal'>Non sei Loggato!</span>",
                html: "<span class='font-swal'>Devi essere loggato per aggiungere una recensione!</span>",
                icon: "info"
            });
            return;
        }
        const id = product_id;
        const can_comment = await userCanComment(id);
        if (can_comment === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                icon: "error"
            });
        } else if (can_comment === false) {
            Swal.fire({
                title: "<span class='font-swal'>Non puoi commentare!</span>",
                html: "<span class='font-swal'>Non puoi lasciare una recensione a questo prodotto perchè non lo hai mai acquistato o ne hai già scritta una.</span>",
                icon: "warning"
            });
        } else {
            document.querySelector("body > aside").style.display = "block";
        }
    });

    document.querySelector("body > aside > section > button").addEventListener("click", () => {
        document.querySelector("body > aside").style.display = "none";
    });

    // Stars Rate System
    let rank = 0;
    let rank_selected = false;

    const stars = document.querySelectorAll("body > aside > section > section.rate i");

    document.querySelector("body > aside > section > section.rate").addEventListener("mouseleave", (event) => {
        if (rank_selected) {
            return;
        }
        console.log("OUT");
        for (const star of stars) {
            star.classList.replace("fa-solid", "fa-regular");
        }
    });

    for (const star of stars) {
        star.addEventListener("mouseenter", function() {
            if (rank_selected) {
                return;
            }
            const my_rank = this.dataset.rank;
            for (let j = 1; j <= 5; j++) {
                if (j <= my_rank) {
                    stars[j - 1].classList.replace("fa-regular", "fa-solid");
                } else {
                    stars[j - 1].classList.replace("fa-solid", "fa-regular");
                }
            }
        });

        star.addEventListener("click", function() {
            const my_rank = this.dataset.rank;
            for (let j = 1; j <= 5; j++) {
                if (j <= my_rank) {
                    stars[j - 1].classList.replace("fa-regular", "fa-solid");
                } else {
                    stars[j - 1].classList.replace("fa-solid", "fa-regular");
                }
            }
            rank = my_rank;
            rank_selected = true;
        });
    }

    document.querySelector("body > aside > section > form").addEventListener("submit", async (event) => {
        event.preventDefault();
        document.querySelector("body > aside > section > form > button").disabled = true;
        const id = product_id;
        const stars = rank;
        if (stars === 0) {
            Swal.fire({
                title: "<span class='font-swal'>Seleziona il numero di stelle che vuoi dare al prodotto!</span>",
                icon: "warning"
            });
            document.querySelector("body > aside > section > form > button").disabled = false;
            return;
        }
        const title = document.getElementById("rev_title").value;
        const review = document.getElementById("rev_text").value;
        const inserted = await insertReview(id, stars, title, review);
        if (inserted) {
            Swal.fire({
                title: "<span class='font-swal'>Recensione Aggiunta!</span>",
                icon: "success"
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile inserire la recensione a causa di un errore sconosciuto del server.<br/>Riprova più tardi o contatta l'assistenza.</span>",
                icon: "error"
            });
            document.querySelector("body > aside > section > form > button").disabled = false;
        }
    });

});
