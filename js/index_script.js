const MAX_PRODUCTS_PER_PAGE = 8;
let PAGE_INDEX = 1;


function getAndPutProducts(page_number, prods_per_page) {
    const products = document.querySelectorAll("#products article");

    for (const product of products) {
        product.innerHTML = "";
        product.style.display = "grid";
        if (!product.classList.contains("loading")) {
            product.classList.add("loading");
        }
    }

    fetch('server/handler.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            func: 'get_products',
            max_prods: prods_per_page,
            page: page_number
        }).toString()
     })
    .then(response => response.json())
    .then(data => {
        if (data.length === 0) {
            document.querySelector("body > main section#products > p").classList.remove("d-none");
        }

        for (let i = 0; i < data.length; i++) {
            const prod = data[i];

            // Create header and main
            const header = document.createElement("header");
            const main = document.createElement("main");

            // Create image
            const img = document.createElement("img");
            img.src = "products_images/" + JSON.parse(prod.images)[0];
            img.alt = prod.nome;

            // Create title (product name)
            const name = document.createElement("h3");
            name.textContent = prod.nome;

            // Create <p> for description
            const desc = document.createElement("p");
            desc.className = "prod_desc";
            desc.textContent = prod.descrizione;

            // Create section for rate
            const rate = document.createElement("section");
            const prod_rate = Math.round(prod.avg_rate);
            let htmlContent = "";
            for (let j = 1; j <= 5; j++) {
                if (j <= prod_rate) {
                    htmlContent += `<i class="fa-solid fa-star"></i>`;
                } else {
                    htmlContent += `<i class="fa-regular fa-star"></i>`;
                }
            }
            rate.innerHTML = htmlContent;

            // Create <p> for price
            const price = document.createElement("p");
            price.className = "price";
            price.textContent = prod.prezzo.toFixed(2) + " €";

            if (prod.quantita === 0) {
                const outOfStock = document.createElement("p");
                outOfStock.className = "out_of_stock";
                outOfStock.textContent = "ESAURITO";
                products[i].appendChild(outOfStock);
            }

            // Add elements
            header.appendChild(img);
            main.appendChild(name);
            main.appendChild(desc);
            main.appendChild(rate);
            main.appendChild(price);
            products[i].classList.remove("loading");
            products[i].dataset.id = prod.product_id;
            products[i].appendChild(header);
            products[i].appendChild(main);
        }

        for (let i = prods_per_page; i > data.length; i--) {
            products[i - 1].style.display = "none";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // todo
    });
}

function redirectWithoutReload(page, override = false) {
    if (!override) {
        history.pushState({}, null, "?page=" + page);
    } else {
        history.replaceState({}, null, "?page=" + page);
    }
}

function getMaxPages(prods_per_page) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'count_products',
                max_prods: prods_per_page
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            if (data.trim() === "error") {
                resolve(false);
            }
            resolve(parseInt(data.trim()));
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(false);
        });
    });
}

function checkBackNextBtn(max_pages) {
    const back_page_btn = document.getElementById("backPage");
    const next_page_btn = document.getElementById("nextPage");
    if (PAGE_INDEX > 1) {
        back_page_btn.disabled = false;
    } else {
        back_page_btn.disabled = true;
    }
    if (PAGE_INDEX < max_pages) {
        next_page_btn.disabled = false;
    } else {
        next_page_btn.disabled = true;
    }
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
        document.getElementById("loginBtn").style.display = "block";
        document.getElementById("adminLoginBtn").style.display = "block";
        document.getElementById("signupBtn").style.display = "block";
    }


    const page_number_input = document.getElementById("pageNum");
    const back_page_btn = document.getElementById("backPage");
    const next_page_btn = document.getElementById("nextPage");

    const max_pages = await getMaxPages(MAX_PRODUCTS_PER_PAGE);
    if (max_pages === false || isNaN(max_pages)) {
        console.log("Errore nel fetch della pagina max!");
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


    /* Page Changer Listeners */
    document.getElementById("pageChanger").addEventListener("submit", (event) => {
        event.preventDefault();
    });

    // Allow only int values
    page_number_input.addEventListener("keypress", (event) => {
        if (!/[0-9]/.test(event.key) && event.key.toLowerCase() !== "enter") {
            event.preventDefault();
        }
    });

    page_number_input.addEventListener("change", () => {
        let page_val = parseInt(page_number_input.value);
        if (page_val < 1 || isNaN(page_val)) {
            page_val = 1;
            page_number_input.value = page_val;
        } else if (page_val > max_pages) {
            page_val = max_pages;
            page_number_input.value = page_val;
        }
        PAGE_INDEX = page_val;
        // document.getElementById("main").scrollTop = 0;
        checkBackNextBtn(max_pages);
        redirectWithoutReload(PAGE_INDEX);
        getAndPutProducts(PAGE_INDEX, MAX_PRODUCTS_PER_PAGE);
    });

    back_page_btn.addEventListener("click", () => {
        if (PAGE_INDEX > 1) {
            PAGE_INDEX--;
            if (PAGE_INDEX === 1) {
                back_page_btn.disabled = true;
            }
            // document.getElementById("main").scrollTop = 0;
            page_number_input.value = PAGE_INDEX;
            checkBackNextBtn(max_pages);
            redirectWithoutReload(PAGE_INDEX);
            getAndPutProducts(PAGE_INDEX, MAX_PRODUCTS_PER_PAGE);
        }
    });

    next_page_btn.addEventListener("click", () => {
        if (PAGE_INDEX < max_pages) {
            PAGE_INDEX++;
            if (PAGE_INDEX === max_pages) {
                next_page_btn.disabled = true;
            }
            // document.getElementById("main").scrollTop = 0;
            page_number_input.value = PAGE_INDEX;
            checkBackNextBtn(max_pages);
            redirectWithoutReload(PAGE_INDEX);
            getAndPutProducts(PAGE_INDEX, MAX_PRODUCTS_PER_PAGE);
        }
    });


    // Read and parse page URL
    const url = window.location.href;
    const parts = url.split("?");

    let page_number = 1;

    if (parts.length >= 2) {
        const query = parts.slice(1).join("?");
        const params = new URLSearchParams(query);
        if (params.has("page")) {
            page_number = parseInt(params.get("page"));
            if (isNaN(page_number) || page_number < 1) {
                page_number = 1;
                redirectWithoutReload(1, true);
            } else if (page_number > max_pages) {
                page_number = max_pages;
                redirectWithoutReload(max_pages, true);
            }
            PAGE_INDEX = page_number;
        }
    }

    page_number_input.value = PAGE_INDEX;

    checkBackNextBtn(max_pages);

    getAndPutProducts(page_number, MAX_PRODUCTS_PER_PAGE);

    const products = document.querySelectorAll("#products article");
    for (const product of products) {
        product.addEventListener("click", function() {
            const prod_id = this.dataset.id;
            window.location.href = `product.html?id=${prod_id}`;
        });
    }

});
