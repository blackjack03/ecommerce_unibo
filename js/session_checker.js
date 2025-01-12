function check_login() {
    return new Promise(resolve => {
        fetch('server/session_handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
         })
        .then(response => response.text())
        .then(data => {
            if (data.trim().startsWith('OK')) {
                console.log("Logged In!");
                const user_type = data.trim().split("::")[1];
                console.log("User Type:", user_type);
                localStorage.setItem("user_type", user_type);
                resolve(user_type);
            } else {
                console.log("No logged in!");
                console.log("Data:", data);
                resolve(false);
            }
        }).catch(error => {
            console.error("Errore durante il fetch:", error);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            resolve(false);
        });
    });
}
