
function Register(event) {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    // Data to be sent to the backend
    const data = {
        username: username,
        email: email,
        password: password
    };

    console.log(data)

    fetch("https://localhost:7195/api/Users/register", {
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
        // Display the backend response message
        alert(message);
        document.getElementById("message").textContent = message;
        document.getElementById("form").reset();  

        window.location.href = "/index.html";
        // window.location.href = `Login.html?value=${encodeURIComponent(username)}`;
       
    })
    
    .catch(error => {
         alert(error);
         document.getElementById("message").textContent = error;
    });
    
}
