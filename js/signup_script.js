
(async () => {

    const session = await check_login();
    // console.log(session);
    if (session !== false) {
        window.location.replace("../index.html");
    }

})();

function check_password() {
    const password1 = document.getElementById("password");
    const password2 = document.getElementById("password2");
    if (password1.value !== password2.value) {
        return false;
    }
    return true;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("adminLoginBtn").style.display = "block";
    document.getElementById("signupBtn").style.display = "block";

    /* CHECK FOR STATUS COOKIE */

    const status_cookie = sessionStorage.getItem("status_signup");

    if (status_cookie !== null) {
        if (status_cookie === "sql_error") {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Errore sconosciuto del server.</span>",
                icon: "error"
            });
        } else if (status_cookie === "already_exists") {
            Swal.fire({
                title: "<span class='font-swal'>Email già esistente!</span>",
                html: "<span class='font-swal'>La mail inserita esiste gia!</span>",
                icon: "error"
            });
        }
        sessionStorage.removeItem("status_signup");
    }

    /* EVENTS LISTENERS */

    document.getElementById("password2").addEventListener("blur", () => {
        if (!check_password()) {
            Swal.fire({
                title: "<span class='font-swal'>Le password non corrispondono!</span>",
                icon: "error"
            });
        }
    });

    document.getElementById("form").addEventListener("submit", (event) => {
        if (!check_password()) {
            event.preventDefault();  // STOP form submit
            Swal.fire({
                title: "<span class='font-swal'>Le password non corrispondono!</span>",
                icon: "error"
            });
        }
    });

});
