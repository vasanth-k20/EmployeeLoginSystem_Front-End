function Login() {
    const UserId = document.getElementById('value').value;
    const password = document.getElementById('password').value;

    const data = {
        UserID: UserId,
        Password: password
    };

    console.log(data);
    fetch("https://localhost:7195/api/Users/Login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    
    .then(response => {
        if (!response.ok) {
            return response.text().then(errorMessage => {
                throw new Error(errorMessage || "Network response was not ok");
            });
        }
        return response.text();
    })
    .then(message => {
        window.location.href = `Dashboard.html?value=${encodeURIComponent(UserId)}`;
        
    })
    
    .catch(error => {
         alert(error);
         document.getElementById("message").textContent = error;
    });
}



