
function changePassword(old_password, new_password) {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'change_password',
                old: old_password,
                new: new_password
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            if (response === "OK") {
                resolve(true);
            } else if (response === "issue") {
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


    const form = document.querySelector("body > main > form");
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        if (!form.checkValidity()) {
            Swal.fire({
                title: "<span class='font-swal'>Completa tutti i dati richiesti!</span>",
                icon: "warning"
            });
            return;
        }

        const new_pass = document.getElementById("new_pass");
        const new_pass2 = document.getElementById("new_pass2");

        if (new_pass.value !== new_pass2.value) {
            Swal.fire({
                title: "<span class='font-swal'>Errore!</span>",
                html: "<span class='font-swal'>Le due password non corrispondono!</span>",
                icon: "error"
            });
            return;
        }

        const changed = await changePassword(document.getElementById("old_pass").value, new_pass.value);
        console.log(changed);

        if (changed === null) {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Non è stato possibile modificare la password a causa di un errore sconosciuto del server!</span>",
                icon: "error"
            });
        } else if (changed === false) {
            Swal.fire({
                title: "<span class='font-swal'>Password Sbagliata!</span>",
                html: "<span class='font-swal'>La password che hai inserito (Vecchia Password) non è corretta!</span>",
                icon: "error"
            });
        } else {
            Swal.fire({
                title: "<span class='font-swal'>Password Modificata!</span>",
                icon: "success"
            }).then(() => {
                window.location.href = "../account.html";
            });
        }
    });

});
