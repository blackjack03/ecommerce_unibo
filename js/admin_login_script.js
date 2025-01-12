
(async () => {

    const session = await check_login();
    console.log(session);
    if (session !== false) {
        window.location.replace("../index.html");
    }

})();


document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").style.display = "block";
    document.getElementById("adminLoginBtn").style.display = "block";
    document.getElementById("signupBtn").style.display = "block";

    const status_cookie = sessionStorage.getItem("status_login");
    console.log(status_cookie);

    if (status_cookie !== null) {
        if (status_cookie === "sql_error") {
            Swal.fire({
                title: "<span class='font-swal'>Errore del Server!</span>",
                html: "<span class='font-swal'>Errore sconosciuto del server.</span>",
                icon: "error"
            });
        } else if (status_cookie === "auth_error") {
            Swal.fire({
                title: "<span class='font-swal'>Password Sbagliata!</span>",
                html: "<span class='font-swal'>Password inserita non corretta!<br/>Riprova!</span>",
                icon: "error"
            });
        }/* else {
            Swal.fire({
                title: "<span class='font-swal'>Errore Sconosciuto!</span>",
                icon: "error"
            });
        }*/
        sessionStorage.removeItem("status_login");
    }

});
