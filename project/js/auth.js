const token = localStorage.getItem("climbiq_token");
const username = localStorage.getItem("climbiq_username");

if (!token) {
    window.location.href = "index.html";
}

// Show username
const whoami = document.getElementById("whoami");

if (whoami && username) {
    whoami.textContent = "Logged in as " + username;
}


// Logout
const logoutButton = document.getElementById("btn-logout");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        try {

            await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

        } catch (error) {

            console.log("Logout request failed");

        }

        localStorage.removeItem("climbiq_token");
        localStorage.removeItem("climbiq_username");

        window.location.href = "index.html";

    });

}