let resUserName = null;
let userEmail = null; // Global variable to store user email
var WorkingHours;
var ResCheckOut;
var ResDate;
let checkInTime = null;                                                           //18-12-2024
let checkOutTime = null;
let timerInterval = null;
let timeElapsed = 0;
let checkInCount = 0;
let isTimerRunning = false;
let totalElapsedTime = 0;
var ResCheckIn;
var breaktime;
var dbstoreconditioncheck = false;
let attendanceChart = null;  // Global variable for the chart instance

const { start, end } = getDefaultDateRange();
const formattedStart = `${start.getFullYear()}-${(start.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${start.getDate().toString().padStart(2, "0")}`;

const formattedEnd = `${end.getFullYear()}-${(end.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${end.getDate().toString().padStart(2, "0")}`;

// Global variables to hold email and username
window.onload = function () {
    myFunction();
    // localStorage.clear();
};

function myFunction() {
    // Get The EmailID from URL
    const params1 = new URLSearchParams(window.location.search);
    const EmailFromURL = params1.get('value');
    userEmail = EmailFromURL; // Store the email globally

    RetriveUserName(EmailFromURL)

    // Get the Current Date
    const currentDate = new Date();
    ResDate = currentDate.toLocaleDateString();

    // Set the default date range in the date picker
    document.getElementById("daterangePicker").value = `${start
        .toLocaleDateString("en-US")
        .replace(/\//g, "-")} - ${end.toLocaleDateString("en-US").replace(
            /\//g,
            "-"
        )}`;

    // Fetch and display data for the default range
    fetchAttendanceData(resUserName, formattedStart, formattedEnd);

}

// Retrieve the UserName through UserID
function RetriveUserName(Email) {
    const data = {
        Email: Email
    };
    console.log("RetriveUserName data:", data)
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
            // Update the global variables
            resUserName = message;
            document.getElementById("UserName").innerHTML = message
            console.log("Retrieved Username:", resUserName, "Email:", userEmail)
            // Display Graph
            // fetchAttendanceData(message)
            fetchAttendanceData(message, formattedStart, formattedEnd);
            console.log(message, formattedStart, formattedEnd);
            // Restore timer state for the user
            restoreTimerState(userEmail);
        })

        .catch(error => {
            alert(error);
        });
}

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
    isTimerRunning = false;
    checkInTime = null;
    clearInterval(timerInterval);
    timerInterval = null;
    updateTimer();
    document.getElementById('status').textContent = "Status: Ready";
    document.getElementById('actionButton').textContent = "Check-In";

    // Remove timer state from localStorage
    if (userEmail) {
        localStorage.removeItem(`timerState_${userEmail}`);
    }
}

// Function to format the time as HH:MM:SS
function getTimeOnly(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Save the timer state in local storage
function saveTimerState(email) {
    if (!email) return;
    const timerState = {
        checkInTime: checkInTime ? checkInTime.toISOString() : null,
        timeElapsed: timeElapsed,
        totalElapsedTime: totalElapsedTime,
        isTimerRunning: isTimerRunning,
        checkInCount: checkInCount,
        ResCheckIn: ResCheckIn,
        ResCheckOut: ResCheckOut,
        breaktime: breaktime,
        dbstoreconditioncheck: dbstoreconditioncheck
    };
    localStorage.setItem(`timerState_${email}`, JSON.stringify(timerState));
    console.log("Timer state saved:", timerState);
}

// Restore the timer state from local storage
function restoreTimerState(email) {
    if (!email) return;
    const savedState = localStorage.getItem(`timerState_${email}`);
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            console.log("Restoring timer state:", state);
            checkInTime = state.checkInTime ? new Date(state.checkInTime) : null;
            timeElapsed = state.timeElapsed || 0;
            totalElapsedTime = state.totalElapsedTime || 0;
            isTimerRunning = state.isTimerRunning || false;
            checkInCount = state.checkInCount || 0;
            ResCheckIn = state.ResCheckIn || null;
            ResCheckOut = state.ResCheckOut || null;
            breaktime = state.breaktime || null;
            dbstoreconditioncheck = state.dbstoreconditioncheck || false;

            updateTimer();

            if (isTimerRunning) {
                resumeTimer(email);
                // Update the button text to 'Check-Out'
                document.getElementById('actionButton').textContent = "Check-Out";
                document.getElementById('status').textContent = "Status: Working";
            } else {
                // Update the button text to 'Check-In'
                document.getElementById('actionButton').textContent = "Check-In";
                document.getElementById('status').textContent = "Status: Ready";
            }
        } catch (error) {
            console.error("Error restoring timer state:", error);
            // Optionally clear corrupted state
            localStorage.removeItem(`timerState_${email}`);
        }
    }
}

// Resume the timer
function resumeTimer(email) {
    if (timerInterval) clearInterval(timerInterval); // Clear any existing intervals
    timerInterval = setInterval(() => {
        timeElapsed++;
        updateTimer();
        saveTimerState(email); // Continuously save the updated timer state
    }, 1000);
}

// Function to toggle Check-In/Check-Out
function toggleCheckInOut() {
    if (!userEmail) {
        alert("User email not found.");
        return;
    }

    if (checkInCount >= 5) {
        alert('You have reached the maximum number of check-ins/check-outs for today.');
        return;
    }

    const actionButton = document.getElementById('actionButton');

    if (!isTimerRunning) {
        // Check-In action
        if (checkInTime === null) {
            checkInTime = new Date();
        }

        actionButton.textContent = "Check-Out";
        ResCheckIn = `${getTimeOnly(checkInTime)}`;
        dbstore(ResCheckIn);

        document.getElementById("pa").innerHTML = "";

        if (dbstoreconditioncheck) {
            breaktime = calculateInBetweenTime(ResCheckIn, ResCheckOut);
            BreakTimeStore();
        }
        dbstoreconditioncheck = true;

        // logic End

        checkInTime = null;
        isTimerRunning = true;
        resumeTimer(userEmail); // Start the timer and save state

        checkInCount++;

        saveTimerState(userEmail); // Save state after check-in

    } else {
        // Check-Out action
        checkOutTime = new Date();
        actionButton.textContent = "Check-In";
        ResCheckOut = `${getTimeOnly(checkOutTime)}`;

        // Working Hours Calculation
        WorkingHours = `${formatTime(totalElapsedTime + timeElapsed)}`;
        CheckOutTimeStore();
        StatusCheck();

        isTimerRunning = false;
        clearInterval(timerInterval);
        timerInterval = null;
        totalElapsedTime += timeElapsed;
        timeElapsed = 0;
        updateTimer();

        saveTimerState(userEmail); // Save state after check-out
    }
}

function dbstore(ResCheckIn) {

    const localDate = new Date(ResDate);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

    const data = {
        Username: resUserName,
        Date: formattedDate,
        CheckIn: ResCheckIn,
    };

    console.log("dbstore data:", data)
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
        .then(_message => {
            // Optionally handle response
        })
        .catch(error => {
            alert(error);
        });
}

function CheckOutTimeStore() {

    const localDate = new Date(ResDate);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

    const data = {
        Username: resUserName,
        Date: formattedDate,
        CheckIn: ResCheckIn,
        CheckOut: ResCheckOut,
        WorkingHours: WorkingHours
    };

    console.log("CheckOutTimeStore data:", data)

    fetch("https://localhost:7195/api/Status/CheckOutTimeStore", {
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
        .then(_message => {
            // Optionally handle response
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
    console.log("Break time:", formattedTime)
    return formattedTime;

}

function BreakTimeStore() {
    const localDate = new Date(ResDate);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    console.log("BreakTimeStore formattedDate:", formattedDate);

    const data = {
        Username: resUserName,
        Date: formattedDate,
        CheckOut: ResCheckOut,
        Break: breaktime
    };

    console.log("BreakTimeStore data:", data)

    fetch("https://localhost:7195/api/Status/BreakTimeStore", {
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
        .then(_message => {
            // Optionally handle response
        })
        .catch(error => {
            alert(error);
        });
}

function StatusCheck() {

    const localDate = new Date(ResDate);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD
    console.log("StatusCheck formattedDate:", formattedDate);

    const data = {
        WorkingHours: WorkingHours
    };

    console.log("StatusCheck data:", data)
    fetch("https://localhost:7195/api/Status/StatusCheck", {
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
            document.getElementById("pa").innerHTML = message;
        })
        .catch(error => {
            alert(error);
        });
}

//Get_the_Workstatus_Details_using_Date
function Get_the_Workstatus_Details_using_Date() {

    const date = document.getElementById('dateRange').value;
    console.log("Selected date:", date)
    const localDate = new Date(date);
    const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as YYYY-MM-DD

    const data = {
        Username: resUserName, // Ensure resUserName is defined
        Date: formattedDate
    };

    fetch("https://localhost:7195/api/Status/GetWorkingStatus", {
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
            const dataArray = Array.isArray(data) ? data : [data];
            populateTable(dataArray); // Pass the array to populateTable
        })
        .catch(_error => {
            alert("Failed to fetch attendance data. Check the console for details.");
        });
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

        var statuscheck = item.status;
        if (isTimerRunning) {
            statuscheck = "Working"
        }
        // Status
        const status = document.createElement("td");
        status.textContent = statuscheck || "N/A";
        row.appendChild(status);

        // Append the row to the table body
        tableBody.appendChild(row);
    }
}

// Set an interval to check every minute for the 12 PM reset
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetTimer();
    }
}, 60000);

// Function to calculate the default date range
function getDefaultDateRange() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const previousMonth = currentMonth - 1;

    // Default start date: Previous month's 26th
    const startOfRange = new Date(currentYear, previousMonth, 26);

    // Default end date: Current month's 25th or today's date if today is before the 25th
    let endOfRange;
    if (today.getDate() < 25) {
        endOfRange = today;
    } else {
        endOfRange = new Date(currentYear, currentMonth, 25);
    }

    return { start: startOfRange, end: endOfRange };
}

// Function to fetch and update attendance data
async function fetchAttendanceData(username, startDate, endDate) {
    try {
        const response = await fetch(
            `https://localhost:7195/api/Status/GetAttendanceSummaryByDateRange?username=${encodeURIComponent(
                username
            )}&startDate=${startDate}&endDate=${endDate}`
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        // Prepare data for the chart
        const attendanceData = {
            labels: ["Present", "CL", "LOP"],
            datasets: [
                {
                    label: "Attendance",
                    data: [data.daysPresent, data.casualLeaveDays, data.daysAbsent],
                    backgroundColor: [
                        "rgba(75, 192, 192, 0.2)", // Present
                        "rgba(141, 86, 255, 0.2)", // CL
                        "rgba(255, 99, 132, 0.2)", // Absent
                    ],
                    borderColor: [
                        "rgba(75, 192, 192, 1)", // Present
                        "rgb(141, 93, 254)", // CL
                        "rgba(255, 99, 132, 1)", // Absent
                    ],
                    borderWidth: 1,
                },
            ],
        };

        // Update or create the chart
        const ctx = document
            .getElementById("attendanceChart")
            .getContext("2d");

        if (attendanceChart) {
            attendanceChart.data = attendanceData;
            attendanceChart.update();
        } else {
            attendanceChart = new Chart(ctx, {
                type: "doughnut",
                data: attendanceData,
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { position: "top" },
                        tooltip: { enabled: true },
                    },
                },
            });
        }
    } catch (error) {
        console.error("Failed to fetch attendance data:", error);
    }
}

// Date range picker and search functionality
$(document).ready(function () {
    // Initialize date range picker
    $("#daterangePicker").daterangepicker({
        opens: "right",
        autoApply: true,
        maxDate: moment().format("MM/DD/YYYY"), // Prevent future dates
        locale: {
            format: "MM/DD/YYYY",
        },
    });

    // Search button functionality
    $("#searchButton").on("click", function () {
        const selectedRange = $("#daterangePicker").val();
        const [startDate, endDate] = selectedRange.split(" - ");

        const formattedStart = moment(startDate, "MM/DD/YYYY").format("YYYY-MM-DD");
        const formattedEnd = moment(endDate, "MM/DD/YYYY").format("YYYY-MM-DD");

        // Fetch and update graph
        fetchAttendanceData(resUserName, formattedStart, formattedEnd);
    });
});

//For calender purpose and add event
document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    // Retrieve saved events from localStorage
    const savedEvents = JSON.parse(localStorage.getItem('events')) || [];

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: savedEvents, // Load saved events
        dateClick: function (info) {
            // Prompt for event title
            const title = prompt("Enter Event Title:");
            if (title) {
                const newEvent = {
                    title: title,
                    start: info.dateStr,
                    allDay: true,
                    id: Date.now().toString() // Unique ID for the event
                };

                // Add the event to the calendar
                calendar.addEvent(newEvent);

                // Save to localStorage
                savedEvents.push(newEvent);
                localStorage.setItem('events', JSON.stringify(savedEvents));

                alert("Event added successfully!");
            }
        },
        eventClick: function (info) {
            // Confirm event deletion
            if (confirm(`Delete event: "${info.event.title}"?`)) {
                // Remove event from calendar
                info.event.remove();

                // Update localStorage
                const updatedEvents = savedEvents.filter(event => event.id !== info.event.id);
                localStorage.setItem('events', JSON.stringify(updatedEvents));

                alert("Event deleted successfully!");
            }
        }
    });

    calendar.render();
});
