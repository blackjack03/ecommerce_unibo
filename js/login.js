
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

    if (sessionStorage.getItem("status_signup") === "OK") {
        document.querySelector("div.alert.alert-success").style.display = "block";
        sessionStorage.removeItem("status_signup");
    }

    const status_login = sessionStorage.getItem("status_login");
    if (status_login !== null) {
        if (status_login === "sql_error") {
            document.getElementById("server_issue").style.display = "block";
        } else if (status_login === "auth_error") {
            document.getElementById("credentials_issue").style.display = "block";
        }
        sessionStorage.removeItem("status_login");
    }

    let hide = true;
    document.getElementById("showHidePsw").addEventListener("click", () => {
        if (hide) {
            document.getElementById("password").type = "text";
            document.getElementById("sh").style.display = "none";
            document.getElementById("hd").style.display = "block";
            hide = false;
        } else {
            document.getElementById("password").type = "password";
            document.getElementById("hd").style.display = "none";
            document.getElementById("sh").style.display = "block";
            hide = true;
        }
    });

});
