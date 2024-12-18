function Login() {
    const EmailID = document.getElementById('Email').value;
    const password = document.getElementById('password').value;

    const data = {
        Email: EmailID,
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
        window.location.href = `./src/Dashboard.html?value=${encodeURIComponent(EmailID)}`;
        
    })
    
    .catch(error => {
         alert(error);
         document.getElementById("message").textContent = error;
    });
}
