window.onload = function () {
    myFunction();
};

function myFunction() 
{
console.log("Hello")
    const params1 = new URLSearchParams(window.location.search);
//<<<<<<< HEAD
    const UserID = params1.get('value'); 
console.log(UserID);
    RetriveUserName(UserID)

//=======
    const Email = params1.get('value'); 
console.log(Email);
    RetriveUserName(Email)
//>>>>>>> 300dd86df6b11e2056d7f43bba1f592b29dbfd78
    const currentDate = new Date();
console.log(currentDate)
console.log(currentDate.toLocaleDateString()); 
     ResDate = (currentDate.toLocaleDateString());
console.log(ResDate)
}

// Retrieve the UserName through UserID
function RetriveUserName(Email) {
    const data = {
        Email: Email
    };

    

    fetch("https://localhost:7195/api/Users/RetriveUserName", {
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
        // Update the global variable
        resUserName = message;
     
        console.log("Retrieve UserName Through Email: " + resUserName);


    fetchAttendanceData(message)


document.getElementById("UserName").innerHTML= resUserName;
    })
    .catch(error => {
        alert(error);
    });
}


let resUserName = null;
var WorkingHours;
var ResCheckOut
var currentDate;
var ResDate;
let checkInTime = null;
let checkOutTime = null;
let timerInterval = null;
let timeElapsed = 0; 
let checkInCount = 0; 
let isTimerRunning = false;
let totalElapsedTime = 0;
var ResCheckIn;
var breaktime;
/*Temp variable to store the CheckIn Time Properly*/
var dbstoreconditioncheck = false;
var tempcheckin;
var tempcheckin1;
var tempcheckincondition = true;
var tempcheckindbstore = true;
/* End of Temp variable to store the CheckIn Time Properly*/





// Function to format the time as HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Function to update the timer display
function updateTimer() {
    document.getElementById('timer').textContent = formatTime(totalElapsedTime + timeElapsed);
}

// Function to reset the timer
function resetTimer() {
    totalElapsedTime = 0;
    timeElapsed = 0;
    checkInCount = 0;
    updateTimer();
    document.getElementById('status').textContent = "Status: Ready";
    document.getElementById('actionButton').textContent = "Check-In";
}

// Function to format the time as HH:MM:SS
function getTimeOnly(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}













function toggleCheckInOut() {
    if (checkInCount >= 5) { 
        alert('You have reached the maximum number of check-ins/check-outs for today.');
        return;
    }

    const actionButton = document.getElementById('actionButton');

    if (!isTimerRunning) {   
        if (checkInTime === null) {
            checkInTime = new Date();

        }
   
    // Check-In action
        actionButton.textContent = "Check-Out";
        ResCheckIn = `${getTimeOnly(checkInTime)}`;
        console.log(ResCheckIn)


        if(tempcheckincondition){
            tempcheckin = ResCheckIn;
            tempcheckincondition = false
        }
        else{
            tempcheckin1 = ResCheckIn;
        }

        document.getElementById("pa").innerHTML="";


    //For Finding the BreakTime
        console.log(dbstoreconditioncheck)

        if(dbstoreconditioncheck)    
        {  
            breaktime =  calculateInBetweenTime(ResCheckIn,ResCheckOut)

            if(tempcheckindbstore){
                dbstore(tempcheckin,ResCheckOut,WorkingHours, breaktime);
                tempcheckindbstore = false
	tempcheckincondition = true
            }
            else{
                dbstore(tempcheckin1,ResCheckOut,WorkingHours, breaktime);
	tempcheckindbstore =true
            }
           
        }
        dbstoreconditioncheck = true;

    // logic End

        checkInTime = null;
        isTimerRunning = true;

        timerInterval = setInterval(() => {
            timeElapsed++;
            updateTimer();
        }, 1000);

        checkInCount++;

    } 
  
    else {            
        // Check-Out action
        checkOutTime = new Date();
        actionButton.textContent = "Check-In";
         ResCheckOut = `${getTimeOnly(checkOutTime)}`
         WorkingHoursCalculate()
        
         console.log(ResCheckOut)

        //Working Hours Calculation
         WorkingHours = `${formatTime(totalElapsedTime + timeElapsed)}`


        isTimerRunning = false;
        clearInterval(timerInterval);
        totalElapsedTime += timeElapsed;
        timeElapsed = 0;
        updateTimer();
    } 
}



















// Set an interval to check every minute for the 12 PM reset
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetTimer();
    }
}, 60000);

function dbstore(ResCheckIn,ResCheckOut,WorkingHours,breaktime){
    
    const localDate = new Date(ResDate);
        const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
        console.log(formattedDate);


    const data = {
        Username : resUserName,
        Date : formattedDate,
        CheckIn : ResCheckIn,
        CheckOut : ResCheckOut,
        WorkingHours : WorkingHours,
        Break : breaktime
    };

    console.log(data)
    fetch("https://localhost:7195/api/Status/status", {
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
      
    })
    .catch(error => {
        alert(error);
    });
}

function calculateInBetweenTime(lastOutTimeStr, secondInTimeStr) {
   
    const today = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD format

    // Parse LastOut and InTime strings
    const lastOutTime = new Date(`${today}T${lastOutTimeStr}`);
    const secondInTime = new Date(`${today}T${secondInTimeStr}`);

    // Calculate the difference in milliseconds
    const difference = Math.abs((secondInTime - lastOutTime) / 1000);


    // Format the time difference as HH:MM:SS
    const formattedTime = formatTime(difference);
    return formattedTime;
}





//<<<<<<< HEAD
function WorkingHoursCalculate(){

    const localDate = new Date(ResDate);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    console.log(formattedDate);

    const data = {
        Username : resUserName,
        Date : formattedDate

    };

    console.log(data)
    fetch("https://localhost:7195/api/Status/WorkingHoursCalculate", {
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
        document.getElementById("pa").innerHTML=message;
    })
    .catch(error => {
        alert(error);
    });
}


function WorkingStatusStore() {
    const date = document.getElementById('dateSelect').value;
    const localDate = new Date(date);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

    const data = {
        Username: resUserName, // Ensure resUserName is defined
        Date: formattedDate
    };

    console.log("Request Data:", data);

    fetch("https://localhost:7195/api/Status/WorkingHoursStatus", {
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
        return response.json(); // Parse as JSON
    })
    .then(data => {
        console.log("Response Data:", data);

        // Wrap the object in an array
        const dataArray = Array.isArray(data) ? data : [data];

        populateTable(dataArray); // Pass the array to populateTable
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to fetch attendance data. Check the console for details.");
    });
}

//=======
async function fetchAttendanceData(username) {
    try {
        
        const response = await fetch(`https://localhost:7195/api/Status/GetAttendanceSummary?username=${encodeURIComponent(username)}`);

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Update the chart with the fetched data
        const attendanceData = {
            labels: ["Days Present", "Days Absent"],
            datasets: [{
                label: 'Attendance Summary',
                data: [data.daysPresent, data.daysAbsent], // Data from API
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        };

        // Create the chart
        const ctx = document.getElementById('attendanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: attendanceData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        enabled: true,
                    }
                }
            }
        });
    } catch (error) {
        console.error("Failed to fetch attendance data:", error);
    }
//>>>>>>> 229ab8c72e12c79f1b2199c8ef5266038c87fa09
}


async function populateTable(data) {
    const tableBody = document.getElementById("attendanceTable").querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    let serial_number = 1;

    // Ensure data is an array
    if (!Array.isArray(data)) {
        console.error("Expected an array, got:", data);
        return;
    }

    // Iterate through the data
    for (let item of data) {
        const row = document.createElement("tr");

        // Serial Number
        const idCell = document.createElement("td");
        idCell.textContent = serial_number++;
        row.appendChild(idCell);

        // Date
        const date = document.createElement("td");
        date.textContent = item.date || "N/A";
        row.appendChild(date);

        // First Check-In
        const firstCheckIn = document.createElement("td");
        firstCheckIn.textContent = item.firstCheckIn || "N/A";
        row.appendChild(firstCheckIn);

        // Last Check-Out
        const lastCheckOut = document.createElement("td");
        lastCheckOut.textContent = item.lastCheckOut || "N/A";
        row.appendChild(lastCheckOut);

        // Working Hours
        const workingHours = document.createElement("td");
        workingHours.textContent = item.workingHours || "N/A";
        row.appendChild(workingHours);

        // Status
        const status = document.createElement("td");
        status.textContent = item.status || "N/A";
        row.appendChild(status);

        // Append the row to the table body
        tableBody.appendChild(row);
    }
}



