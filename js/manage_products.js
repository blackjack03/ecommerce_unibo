
function getProductsList() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_products_list'
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
        if (session !== "admin") {
            window.location.replace("../index.html");
        }
    } else {
        window.location.replace("../admin_login.html");
    }


    const prods_list = await getProductsList();
    const quantities = {};
    console.log(prods_list);

    for (const prod of prods_list) {
        const option = document.createElement("option");
        option.value = prod.product_id;
        option.textContent = prod.nome;
        document.getElementById("product_selector").appendChild(option);
        quantities[String(prod.product_id)] = prod.quantita;
    }

    document.querySelector("body > main > section > fieldset > form").addEventListener("submit", (event) => {
        event.preventDefault();
    });

    document.getElementById("product_selector").addEventListener("change", function() {
        const p = document.querySelector("body > main > section > fieldset > form > p");
        p.innerText = `Quantità del prodotto rimanente: ${quantities[this.value]}`;
    });

    document.querySelector("body > main > section > fieldset > form > button[class='btn btn-primary']").addEventListener("click", () => {
        const selected_product = document.getElementById("product_selector").value;
        if (selected_product === "default") {
            Swal.fire({
                title: "<span class='font-swal'>Seleziona un Prodotto!</span>",
                html: "<span class='font-swal'>Seleziona un Prodotto per modificarlo!</span>",
                icon: "info"
            });
            return;
        }
        window.open(`../update_product.html?id=${selected_product}`, '_blank');
    });

    document.querySelector("body > main > section > fieldset > form > button[class='btn btn-secondary']").addEventListener("click", () => {
        const selected_product = document.getElementById("product_selector").value;
        if (selected_product === "default") {
            Swal.fire({
                title: "<span class='font-swal'>Seleziona un Prodotto!</span>",
                html: "<span class='font-swal'>Seleziona un Prodotto per visualizzarlo!</span>",
                icon: "info"
            });
            return;
        }
        window.open(`../product.html?id=${selected_product}`, '_blank');
    });

});
