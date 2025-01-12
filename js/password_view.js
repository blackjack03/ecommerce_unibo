
document.addEventListener("DOMContentLoaded", () => {

    const showHideButton = document.getElementById("showHidePsw");
    const password = document.getElementById("password");
    const password2 = document.getElementById("password2");
    const show = document.getElementById("sh");
    const hide = document.getElementById("hd");

    showHideButton.addEventListener("click", () => {
        if (password.getAttribute("type") === "password") {
            show.style.display = "none";
            hide.style.display = "block";
            password.setAttribute("type", "text");
            password2.setAttribute("type", "text");
        } else {
            hide.style.display = "none";
            show.style.display = "block";
            password.setAttribute("type", "password");
            password2.setAttribute("type", "password");
        }
    });

});
