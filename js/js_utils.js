
function refreshNumOnCart() {
    const cart_num_elem = document.getElementById("cartnum");
    fetch('server/handler.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            func: 'get_cart_num'
        }).toString()
     })
    .then(response => response.text())
    .then(data => {
        const response = data.trim();
        // console.log(response);
        if (response.startsWith("OK")) {
            const cartNum = parseInt(response.split("_")[1]);
            if (cartNum > 9) {
                cart_num_elem.innerText = "9+";
            } else {
                cart_num_elem.innerText = cartNum;
            }
            // if (cartNum > 0) {
                cart_num_elem.style.display = "flex";
            // } else {
            //    cart_num_elem.style.display = "none";
            // }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getNumOfNewNotifications() {
    return new Promise(resolve => {
        fetch('server/handler.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                func: 'get_new_notifications_num'
            }).toString()
         })
        .then(response => response.text())
        .then(data => {
            const response = data.trim();
            if (response === "error" || isNaN(parseInt(response))) {
                resolve(false);
            } else {
                resolve(parseInt(response));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            resolve(false);
        });
    });
}

let notifications_check_cycle = false;
async function checkNotifications(remove_notifies = 0) {
    if (notifications_check_cycle) {
        console.warn("Cycle for notifications checking already started!");
        return;
    }
    notifications_check_cycle = true;
    const notify_num_elem = document.getElementById("notifynum");
    while (true) {
        console.log("Check notifications...");
        let notifications = await getNumOfNewNotifications();
        if (notifications === false) {
            console.error('Failed to get new notifications number!');
            await wait(3000); // 3s
        } else {
            if (notifications > 0 && remove_notifies > 0) {
                console.log("Remove:", remove_notifies);
                notifications -= remove_notifies;
                remove_notifies = 0;
            }
            if (notifications > 9) {
                notify_num_elem.innerText = "9+";
            } else {
                notify_num_elem.innerText = notifications;
            }
            if (notifications > 0) {
                notify_num_elem.style.display = "flex";
            } else {
                notify_num_elem.style.display = "none";
            }
            await wait(20 * 1000); // 20s
        }
    }
}

function formatTimestamp(phpTimestamp) {
    const date = new Date(phpTimestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function splitEveryN(str, n) {
    const arr = [];

    for (let i = 0; i < str.length; i += n) {
        arr.push(str.slice(i, i + n));
    }

    return arr;
}
