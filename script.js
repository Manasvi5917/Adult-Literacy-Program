const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
// Create Account elements
const signupPage = document.getElementById("signupPage");
const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

const showSignupButton = document.getElementById("showSignupButton");
const showLoginButton = document.getElementById("showLoginButton");


// Show Create Account page
showSignupButton.addEventListener("click", function () {
    loginPage.classList.add("hidden");
    signupPage.classList.remove("hidden");
    signupMessage.textContent = "";
});


// Return to Login page
showLoginButton.addEventListener("click", function () {
    signupPage.classList.add("hidden");
    loginPage.classList.remove("hidden");
    signupMessage.textContent = "";
});


// Create a new account
signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const role = document.getElementById("accountRole").value;

  if (!name || !email || !username || !password || !confirmPassword || !role) {  
        signupMessage.style.color = "red";
        signupMessage.textContent = "Please fill in all fields.";
        return;
    }

    if (password.length < 6) {
        signupMessage.style.color = "red";
        signupMessage.textContent = "Password must contain at least 6 characters.";
        return;
    }

    if (password !== confirmPassword) {
        signupMessage.style.color = "red";
        signupMessage.textContent = "Passwords do not match.";
        return;
    }

    let accounts = [];

    try {
        accounts = JSON.parse(
            localStorage.getItem("literacyAccounts")
        ) || [];
    } catch {
        accounts = [];
    }

    const usernameExists = accounts.some(function (account) {
    return String(account.username || "").toLowerCase() === username.toLowerCase();
});

const emailExists = accounts.some(function (account) {
    return String(account.email || "").toLowerCase() === email.toLowerCase();
});
    if (usernameExists || emailExists) {
        signupMessage.style.color = "red";
        signupMessage.textContent =
            usernameExists
                ? "This username is already registered."
                : "This email is already registered.";
        return;
    }

    accounts.push({
    name: name,
    email: email,
    username: username,
    password: password,
    role: role,
    status: role === "learner" ? "approved" : "pending"
});

    localStorage.setItem("literacyAccounts", JSON.stringify(accounts));

    signupMessage.style.color = "green";
    signupMessage.textContent = "Account created successfully! Please log in.";

    signupForm.reset();

    setTimeout(function () {
        signupPage.classList.add("hidden");
        loginPage.classList.remove("hidden");

        document.getElementById("username").value = username;
        document.getElementById("password").value = "";

        loginMessage.style.color = "green";
        loginMessage.textContent = "Account created. Please enter your password.";
    }, 1000);
});

// Demo credentials only.
// Use server-side authentication for a real application.
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "1234";

// Login
// Login using a registered account

// Login using a registered account
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    let accounts = [];

    try {
        accounts = JSON.parse(
            localStorage.getItem("literacyAccounts")
        ) || [];
    } catch {
        accounts = [];
    }

    // Demo administrator account
    const isDemoAdmin = username === "admin" && password === "1234";

    const account = accounts.find(function (item) {
        return item.username.toLowerCase() === username.toLowerCase()
            && item.password === password;
    });

    if (isDemoAdmin || account) {

        // Check Admin approval
        if (!isDemoAdmin && account.status && account.status !== "approved") {
            loginMessage.style.color = "red";
            loginMessage.textContent =
                "Your account is pending Admin approval.";
            return;
        }

        // ADMIN LOGIN
        if (isDemoAdmin || account.role === "admin") {

            loginMessage.style.color = "green";
            loginMessage.textContent = "Admin login successful!";

            setTimeout(function () {
                loginPage.classList.add("hidden");
                signupPage.classList.add("hidden");
                document.getElementById("learnerPortal").classList.add("hidden");
                dashboardPage.classList.remove("hidden");

                showDashboard();
            }, 500);

            return;
        }

     // LEARNER LOGIN
if (account.role === "learner") {

    // Automatically record attendance
    let attendance = [];

    try {
        const savedAttendance = JSON.parse(
            localStorage.getItem("literacyAttendance")
        );

        attendance = Array.isArray(savedAttendance)
            ? savedAttendance
            : [];
    } catch {
        attendance = [];
    }

    const today = new Date().toLocaleDateString("en-CA");

    // Prevent duplicate attendance on the same day
    const alreadyMarked = attendance.some(function (record) {
        return record.username === account.username
            && record.date === today;
    });

    if (!alreadyMarked) {
        attendance.push({
            name: account.name,
            username: account.username,
            date: today,
            time: new Date().toLocaleTimeString(),
            status: "Present"
        });

        localStorage.setItem(
            "literacyAttendance",
            JSON.stringify(attendance)
        );
    }

    // Store logged-in learner
    localStorage.setItem(
        "currentLearner",
        JSON.stringify(account)
    );

    loginMessage.style.color = "green";
    loginMessage.textContent = "Login successful!";

    setTimeout(function () {

        loginPage.classList.add("hidden");
        signupPage.classList.add("hidden");
        learnerPortal.classList.add("hidden");

        dashboardPage.classList.remove("hidden");
setDashboardRole("learner");

        // Display the shared dashboard
        showSection("overview");

        // Set dashboard name for learner
        const profileName = document.querySelector("#dashboardPage .topbar");

        if (profileName) {
            const heading = profileName.querySelector("h1");

            if (heading) {
                heading.textContent = "Welcome, " + account.name + "!";
            }
        }

        renderLearnerOwnResults();

    }, 500);

    return;
}

        // TEACHER / VOLUNTEER RESTRICTION
        loginMessage.style.color = "red";
        loginMessage.textContent =
            "Teacher and Volunteer portals are not yet available.";

    } else {
        loginMessage.style.color = "red";
        loginMessage.textContent = "Invalid username or password.";
    }
});

// Load learner records
function getLearners() {
    try {
        return JSON.parse(localStorage.getItem("literacyLearners")) || [];
    } catch {
        return [];
    }
}

// Display dashboard statistics
function showDashboard() {
    setDashboardRole("admin");
    const learners = getLearners();

    // Demo attendance figures until attendance management is implemented.
    const present = 42;
    const absent = 8;
    const totalAttendance = present + absent;
    const percentage = totalAttendance > 0
        ? Math.round((present / totalAttendance) * 100)
        : 0;

    document.getElementById("totalLearners").textContent = learners.length;
    document.getElementById("presentLearners").textContent = present;
    document.getElementById("absentLearners").textContent = absent;
    document.getElementById("attendanceRate").textContent = percentage + "%";

    document.getElementById("progressRing").style.background =
        `conic-gradient(#6547a5 0% ${percentage}%, #eee8f4 ${percentage}% 100%)`;

    document.getElementById("ringPercent").textContent = percentage + "%";

    document.getElementById("legendPresent").textContent = present;
    document.getElementById("legendAbsent").textContent = absent;
    document.getElementById("legendTotal").textContent = totalAttendance;

    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

    displayLearners();
}



// Navigation and dashboard section switching

function showSection(sectionId) {

    const learner = getLoggedInLearner();

    // Hide all dashboard sections
    document.querySelectorAll("#dashboardPage .dashboard-section")
        .forEach(function (section) {
            section.classList.add("hidden");
        });

    const section = document.getElementById(sectionId);

    if (!section) return;

    section.classList.remove("hidden");

    // LEARNER: Show only personal attendance
    if (learner && sectionId === "attendanceManagement") {

        const adminElements = section.querySelectorAll(
            ".attendance-controls, .table-wrapper, #saveAttendance, #attendanceMessage"
        );

        adminElements.forEach(function (element) {
            element.style.display = "none";
        });

        let personalAttendance = document.getElementById("personalAttendanceView");

        if (!personalAttendance) {
            personalAttendance = document.createElement("div");
            personalAttendance.id = "personalAttendanceView";
            section.appendChild(personalAttendance);
        }

        let records = [];

        try {
            records = JSON.parse(localStorage.getItem("literacyAttendance")) || [];
        } catch {
            records = [];
        }

        if (!Array.isArray(records)) {
            records = [];
        }

        const myRecords = records.filter(function (record) {
            return record.username === learner.username;
        });

        personalAttendance.innerHTML = `
            <h2>My Attendance</h2>
            <p>Here is your personal attendance record.</p>

            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${
                            myRecords.length === 0
                            ? `<tr><td colspan="3">No attendance records found.</td></tr>`
                            : myRecords.map(record => `
                                <tr>
                                    <td>${escapeProfileText(record.date || "-")}</td>
                                    <td>${escapeProfileText(record.time || "-")}</td>
                                    <td>${escapeProfileText(record.status || "-")}</td>
                                </tr>
                            `).join("")
                        }
                    </tbody>
                </table>
            </div>
        `;
    }

    // ADMIN: Refresh all learners' progress
    if (!learner && sectionId === "learningProgress") {
        displayProgress();
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Navigation links
document.querySelectorAll(".nav-link").forEach(function (link) {

    link.addEventListener("click", function (event) {
        event.preventDefault();

        const sectionId = link.getAttribute("href").substring(1);

        // Update active navigation link
        document.querySelectorAll(".nav-link").forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

        // Load section data when needed
        if (sectionId === "achievements") {
            loadAchievementLearners();
        }

        if (sectionId === "learnerProfile") {
            loadProfileLearners();
        }

        if (sectionId === "smartAssistant") {
            loadProgressLearners();
            displayProgress();
            analyzeLearningProgress();
        }

        // Display selected section
        showSection(sectionId);
    });
});

document.querySelectorAll(".nav-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const sectionId = link.getAttribute("href").substring(1);

        // Update active navigation option
        document.querySelectorAll(".nav-link").forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");

        // Hide optional sections first
        document.getElementById("registration").classList.add("hidden");
        document.getElementById("learners").classList.add("hidden");

        if (sectionId === "achievements") {
            loadAchievementLearners();
        }

        if (sectionId === "learnerProfile") {
            loadProfileLearners();
        }

        if (sectionId === "smartAssistant") {
            loadProgressLearners();
            displayProgress();
            analyzeLearningProgress();
        }

        // Show the selected section
        showSection(sectionId);
    });
});


// Open Registration Page from Overview
document.getElementById("registerButton").addEventListener("click", function () {
    showSection("registration");

    document.querySelectorAll(".nav-link").forEach(function (link) {
        link.classList.remove("active");
    });
});

// Open attendance section
document.getElementById("attendanceButton").addEventListener("click", function () {
    showSection("attendance");
});

// Save new learner
document.getElementById("registrationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const learner = {
        name: document.getElementById("learnerName").value.trim(),
        age: document.getElementById("learnerAge").value,
        phone: document.getElementById("learnerPhone").value.trim(),
        gender: document.getElementById("learnerGender").value,
        address: document.getElementById("learnerAddress").value.trim()
    };

    if (!learner.name || !learner.age || !learner.phone ||
        !learner.gender || !learner.address) {
        alert("Please fill in all the fields.");
        return;
    }

    const learners = getLearners();
    learners.push(learner);

    localStorage.setItem("literacyLearners", JSON.stringify(learners));

    alert("Learner registered successfully!");

    this.reset();
    showDashboard();

    document.getElementById("registration").classList.add("hidden");
    document.getElementById("learners").classList.remove("hidden");
    showSection("learners");
});

// Display registered learners safely
function displayLearners() {
    const learners = getLearners();
    const table = document.getElementById("learnerTable");

    table.replaceChildren();

    if (learners.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No learners registered yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    learners.forEach(function (learner) {
        const row = document.createElement("tr");

        [learner.name, learner.age, learner.phone, learner.gender]
            .forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

        table.appendChild(row);
    });
}

// Logout
document.getElementById("logoutButton").addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
        dashboardPage.classList.add("hidden");
        loginPage.classList.remove("hidden");
        loginForm.reset();
        loginMessage.textContent = "";
    }
});
// Set today's date
const attendanceDate = document.getElementById("attendanceDate");

attendanceDate.value = new Date().toLocaleDateString("en-CA");

// Load learners for attendance
document.getElementById("loadAttendance").addEventListener("click", function () {
    const learners = getLearners();
    const table = document.getElementById("attendanceTable");

    table.replaceChildren();

    if (learners.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 2;
        cell.textContent = "No learners registered yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    const date = attendanceDate.value;
    const allRecords = JSON.parse(
        localStorage.getItem("literacyAttendance") || "{}"
    );

    const savedRecords = allRecords[date] || {};

    learners.forEach(function (learner, index) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = learner.name;

        const statusCell = document.createElement("td");
        const select = document.createElement("select");

        select.className = "attendance-status";
        select.dataset.index = index;

        ["Present", "Absent"].forEach(function (status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            select.appendChild(option);
        });

        // Restore the saved status or default to Present
        select.value = savedRecords[index] || "Present";

        statusCell.appendChild(select);
        row.appendChild(nameCell);
        row.appendChild(statusCell);

        table.appendChild(row);
    });
});


// Save attendance records
document.getElementById("saveAttendance").addEventListener("click", function () {
    const date = attendanceDate.value;
    const learners = getLearners();
    const selects = document.querySelectorAll(".attendance-status");
    const message = document.getElementById("attendanceMessage");

    if (!date) {
        message.style.color = "red";
        message.textContent = "Please select a date.";
        return;
    }

    if (learners.length === 0) {
        message.style.color = "red";
        message.textContent = "Register learners before marking attendance.";
        return;
    }

    if (selects.length !== learners.length) {
        message.style.color = "red";
        message.textContent = "Please load the learners first.";
        return;
    }

    const records = {};

    selects.forEach(function (select) {
        records[select.dataset.index] = select.value;
    });

    const allRecords = JSON.parse(
        localStorage.getItem("literacyAttendance") || "{}"
    );

    allRecords[date] = records;

    localStorage.setItem(
        "literacyAttendance",
        JSON.stringify(allRecords)
    );

    message.style.color = "green";
    message.textContent = "Attendance saved successfully!";

    updateAttendanceStatistics(date);
});


// Update dashboard attendance statistics
function updateAttendanceStatistics(date) {
    const learners = getLearners();
    const allRecords = JSON.parse(
        localStorage.getItem("literacyAttendance") || "{}"
    );

    const records = allRecords[date] || {};

    const present = Object.values(records).filter(
        status => status === "Present"
    ).length;

    const absent = Object.values(records).filter(
        status => status === "Absent"
    ).length;

    const total = learners.length;
    const percentage = total > 0
        ? Math.round((present / total) * 100)
        : 0;

    document.getElementById("totalLearners").textContent = total;
    document.getElementById("presentLearners").textContent = present;
    document.getElementById("absentLearners").textContent = absent;
    document.getElementById("attendanceRate").textContent =
        percentage + "%";

    document.getElementById("ringPercent").textContent =
        percentage + "%";

    document.getElementById("progressRing").style.background =
        `conic-gradient(#6547a5 0% ${percentage}%, #eee8f4 ${percentage}% 100%)`;

    document.getElementById("legendPresent").textContent = present;
    document.getElementById("legendAbsent").textContent = absent;
    document.getElementById("legendTotal").textContent = total;
}


// Load attendance when the date changes
attendanceDate.addEventListener("change", function () {
    document.getElementById("loadAttendance").click();
});
// Learning Progress Tracker

const progressForm = document.getElementById("progressForm");

function getProgressRecords() {
    try {
        return JSON.parse(localStorage.getItem("literacyProgress")) || [];
    } catch {
        return [];
    }
}

// Load registered learners into dropdown
function loadProgressLearners() {
    const learners = getLearners();
    const dropdown = document.getElementById("progressLearner");

    dropdown.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a learner";
    dropdown.appendChild(defaultOption);

    learners.forEach(function (learner, index) {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = learner.name;
        dropdown.appendChild(option);
    });
}

// Skill Assessment Questions
const skillQuestions = {

    Reading: [
        {
            question: "Which word means the opposite of 'big'?",
            options: ["Small", "Tall", "Wide", "Heavy"],
            answer: "Small"
        },
        {
            question: "Which word describes a happy person?",
            options: ["Sad", "Joyful", "Angry", "Tired"],
            answer: "Joyful"
        },
        {
            question: "Where do we usually buy medicines?",
            options: ["School", "Farm", "Pharmacy", "Park"],
            answer: "Pharmacy"
        },
        {
            question: "Choose the correct spelling.",
            options: ["Frend", "Friend", "Freind", "Friedn"],
            answer: "Friend"
        },
        {
            question: "What do we use to read a story?",
            options: ["Book", "Plate", "Chair", "Spoon"],
            answer: "Book"
        }
    ],

    Writing: [
        {
            question: "Choose the correct sentence.",
            options: [
                "She go to school.",
                "She goes to school.",
                "She going school.",
                "She gone school."
            ],
            answer: "She goes to school."
        },
        {
            question: "Which word is correctly spelled?",
            options: ["Becaus", "Beacause", "Because", "Becouse"],
            answer: "Because"
        },
        {
            question: "Which punctuation mark ends a question?",
            options: [".", ",", "!", "?"],
            answer: "?"
        },
        {
            question: "Choose the correct spelling.",
            options: ["Apel", "Apple", "Appel", "Aple"],
            answer: "Apple"
        },
        {
            question: "Choose the correct sentence.",
            options: [
                "I are happy.",
                "I am happy.",
                "I is happy.",
                "I be happy."
            ],
            answer: "I am happy."
        }
    ],

    Mathematics: [
        {
            question: "What is 5 + 3?",
            options: ["6", "7", "8", "9"],
            answer: "8"
        },
        {
            question: "What is 10 - 4?",
            options: ["5", "6", "7", "8"],
            answer: "6"
        },
        {
            question: "What is 3 × 4?",
            options: ["7", "12", "10", "16"],
            answer: "12"
        },
        {
            question: "What is 20 ÷ 5?",
            options: ["2", "3", "4", "5"],
            answer: "4"
        },
        {
            question: "You have ₹10 and spend ₹4. How much is left?",
            options: ["₹5", "₹6", "₹7", "₹8"],
            answer: "₹6"
        }
    ]
};

// Display questions for selected skill
function displaySkillQuiz() {
    const subject = document.getElementById("learningSubject").value;
    const container = document.getElementById("quizContainer");

    container.replaceChildren();

    if (!subject || !skillQuestions[subject]) {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent =
            "Select a learner and skill to begin the assessment.";

        container.appendChild(message);
        return;
    }

    const questions = skillQuestions[subject];

    questions.forEach(function (item, index) {

        const questionBox = document.createElement("div");
        questionBox.className = "assessment-question";

        const heading = document.createElement("h3");
        heading.textContent = (index + 1) + ". " + item.question;

        questionBox.appendChild(heading);

        item.options.forEach(function (option) {

            const label = document.createElement("label");
            label.className = "assessment-option";

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "question" + index;
            radio.value = option;

            const text = document.createElement("span");
            text.textContent = option;

            label.append(radio, text);
            questionBox.appendChild(label);
        });

        container.appendChild(questionBox);
    });
}

// Automatically calculate remark
function getProgressRemark(percentage) {
    if (percentage < 40) return "Needs Support";
    if (percentage < 60) return "Making Progress";
    if (percentage < 80) return "Good Progress";
    return "Excellent";
}

// Display learner assessment progress for Admin
function displayProgress() {

    let assessmentRecords = [];

    try {
        assessmentRecords = JSON.parse(
            localStorage.getItem("literacyLearnerAssessments")
        ) || [];
    } catch {
        assessmentRecords = [];
    }

    const table = document.getElementById("progressTable");

    table.replaceChildren();

    if (assessmentRecords.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No learner assessments submitted yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    assessmentRecords.forEach(function (record) {

        const row = document.createElement("tr");

        // Learner name
        const learnerCell = document.createElement("td");
        learnerCell.textContent = record.name || "Learner";

        // Subject
        const subjectCell = document.createElement("td");
        subjectCell.textContent = record.subject;

        // Percentage progress bar
        const progressCell = document.createElement("td");

        const bar = document.createElement("div");
        bar.className = "progress-bar";

        const fill = document.createElement("div");
        fill.className = "progress-fill";
        fill.style.width = record.percentage + "%";

        bar.appendChild(fill);

        const value = document.createElement("span");
        value.className = "progress-value";
        value.textContent = record.percentage + "%";

        progressCell.append(bar, value);

        // Score and date
        const remarkCell = document.createElement("td");

        const remark = document.createElement("span");
        remark.className = "progress-remark";
        remark.textContent =
            record.score + "/" + record.totalQuestions +
            " | " + record.date;

        remarkCell.appendChild(remark);

        row.append(
            learnerCell,
            subjectCell,
            progressCell,
            remarkCell
        );

        table.appendChild(row);
    });
}

// Automatically score and save assessment
progressForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const learnerIndex =
        document.getElementById("progressLearner").value;

    const subject =
        document.getElementById("learningSubject").value;

    const learners = getLearners();

    if (learnerIndex === "" || !learners[Number(learnerIndex)]) {
        alert("Please select a learner.");
        return;
    }

    if (!subject || !skillQuestions[subject]) {
        alert("Please select a learning skill.");
        return;
    }

    const questions = skillQuestions[subject];
    let score = 0;

    // Check all answers
    for (let i = 0; i < questions.length; i++) {

        const selected = progressForm.querySelector(
            'input[name="question' + i + '"]:checked'
        );

        if (!selected) {
            alert("Please answer all the questions.");
            return;
        }

        if (selected.value === questions[i].answer) {
            score++;
        }
    }

    // Calculate percentage
    const percentage = Math.round(
        (score / questions.length) * 100
    );

    const remark = getProgressRemark(percentage);

    const records = getProgressRecords();

    records.push({
        learnerIndex: Number(learnerIndex),
        subject: subject,
        percentage: percentage,
        remark: remark,
        notes: "",
        date: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem(
        "literacyProgress",
        JSON.stringify(records)
    );

    alert(
        "Assessment completed!\n\n" +
        "Score: " + score + "/" + questions.length +
        "\nProgress: " + percentage + "%" +
        "\nRemark: " + remark
    );

    progressForm.reset();

    displaySkillQuiz();
    displayProgress();
});

// Show questions when skill changes
document.getElementById("learningSubject")
    .addEventListener("change", displaySkillQuiz);

// Initialize
loadProgressLearners();
displaySkillQuiz();
displayProgress();
// ==========================================
// SMART LEARNING ASSISTANT
// ==========================================

function analyzeLearningProgress() {

    const learners = getLearners();
    const records = getProgressRecords();

    const resultsContainer =
        document.getElementById("smartLearnerResults");

    let needSupport = 0;
    let goodProgress = 0;

    resultsContainer.replaceChildren();

    // Check whether learners and progress records exist

    if (learners.length === 0 || records.length === 0) {

        document.getElementById("smartTotal").textContent = "0";
        document.getElementById("smartSupport").textContent = "0";
        document.getElementById("smartGoodProgress").textContent = "0";

        const message = document.createElement("p");

        message.textContent =
            "Register learners and record their learning progress to see suggestions.";

        resultsContainer.appendChild(message);

        return;
    }

    // Keep the latest record for each learner and subject

    const latestRecords = new Map();

    records.forEach(function (record) {

        const key = record.learnerIndex + "-" + record.subject;
        const previousRecord = latestRecords.get(key);

        if (
            !previousRecord ||
            String(record.date || "") >= String(previousRecord.date || "")
        ) {
            latestRecords.set(key, record);
        }

    });

    // Group progress records by learner

    const learnerResults = new Map();

    latestRecords.forEach(function (record) {

        const learner = learners[record.learnerIndex];

        if (!learner) {
            return;
        }

        if (!learnerResults.has(record.learnerIndex)) {

            learnerResults.set(record.learnerIndex, {
                name: learner.name,
                subjects: []
            });

        }

        learnerResults.get(record.learnerIndex).subjects.push({
            subject: record.subject,
            percentage: Number(record.percentage)
        });

    });

    // Analyze each learner

    learnerResults.forEach(function (result) {

        const total = result.subjects.reduce(
            function (sum, item) {
                return sum + item.percentage;
            },
            0
        );

        const average = Math.round(
            total / result.subjects.length
        );

        let status;
        let recommendation;
        let statusClass;

        if (average < 40) {

            status = "Needs Extra Support";
            statusClass = "support";
            needSupport++;

            recommendation =
                "Provide individual guidance and short, step-by-step practice activities.";

        } else if (average < 70) {

            status = "Keep Practising";
            statusClass = "practice";

            recommendation =
                "Provide regular exercises and revise difficult topics.";

        } else {

            status = "Good Progress";
            statusClass = "good";
            goodProgress++;

            recommendation =
                "Recognize the learner's progress and introduce suitable new learning goals.";

        }

        // Create learner card

        const card = document.createElement("div");
        card.className = "smart-learner-card";

        const heading = document.createElement("h4");
        heading.textContent = result.name;

        const averageText = document.createElement("p");

        averageText.textContent =
            "Average recorded progress: " + average + "%";

        const subjectsText = document.createElement("p");

        subjectsText.textContent =
            "Subjects: " +
            result.subjects.map(function (item) {
                return item.subject + " (" + item.percentage + "%)";
            }).join(", ");

        const suggestion = document.createElement("p");

        suggestion.textContent =
            "Suggested action: " + recommendation;

        const badge = document.createElement("span");

        badge.className = "smart-status " + statusClass;
        badge.textContent = status;

        card.append(
            heading,
            averageText,
            subjectsText,
            suggestion,
            badge
        );

        resultsContainer.appendChild(card);

    });

    // Update summary cards

    document.getElementById("smartTotal").textContent =
        learnerResults.size;

    document.getElementById("smartSupport").textContent =
        needSupport;

    document.getElementById("smartGoodProgress").textContent =
        goodProgress;

}

// Analyze progress when the button is clicked

document
    .getElementById("refreshSmartAssistant")
    .addEventListener("click", analyzeLearningProgress);

// Display the initial analysis

analyzeLearningProgress();

// ===============================
// LEARNER PROFILE VIEW
// ===============================

function loadProfileLearners() {
    const select = document.getElementById("profileLearnerSelect");

    if (!select) return;

    const learners = getLearners();
    const previousValue = select.value;

    select.innerHTML = '<option value="">-- Select a Learner --</option>';

    learners.forEach(function (learner, index) {
        const option = document.createElement("option");

        // Use learner ID when available; otherwise use the array index.
        option.value = learner.id != null ? String(learner.id) : String(index);

        option.textContent = learner.name || "Unnamed Learner";

        select.appendChild(option);
    });

    if (previousValue) {
        select.value = previousValue;
    }
}

function getProfileAttendance(learner) {
    const allRecords = JSON.parse(
        localStorage.getItem("literacyAttendance") || "{}"
    );

    const learners = getLearners();
    const learnerIndex = learners.findIndex(function (item) {
        return item === learner ||
            (
                item.name === learner.name &&
                item.age === learner.age &&
                item.phone === learner.phone
            );
    });

    const attendanceRecords = [];

    Object.keys(allRecords).forEach(function (date) {
        const dailyRecords = allRecords[date] || {};

        if (
            learnerIndex !== -1 &&
            Object.prototype.hasOwnProperty.call(
                dailyRecords,
                String(learnerIndex)
            )
        ) {
            attendanceRecords.push({
                date: date,
                status: dailyRecords[String(learnerIndex)]
            });
        }
    });

    return attendanceRecords;
}

function getProfileProgress(learner) {
    const records = getProgressRecords();
    const learners = getLearners();

    const learnerIndex = learners.findIndex(function (item) {
        return item === learner ||
            (
                item.name === learner.name &&
                item.age === learner.age &&
                item.phone === learner.phone
            );
    });

    if (learnerIndex === -1) {
        return [];
    }

    const matchingRecords = records.filter(function (record) {
        return Number(record.learnerIndex) === learnerIndex;
    });

    // Keep only the latest record for each subject.
    const latestBySubject = {};

    matchingRecords.forEach(function (record) {
        const subject = record.subject || "General Learning";
        const current = latestBySubject[subject];

        if (
            !current ||
            String(record.date || "") >= String(current.date || "")
        ) {
            latestBySubject[subject] = record;
        }
    });

    return Object.values(latestBySubject);
}
function getProfilePercentage(record) {
    const possible = Number(
        record.totalMarks ??
        record.maxMarks ??
        record.outOf ??
        100
    );

    const score = Number(
        record.marks ??
        record.score ??
        record.percentage ??
        0
    );

    if (record.percentage != null) {
        return Math.max(0, Math.min(100, Number(record.percentage) || 0));
    }

    if (possible <= 0) return 0;

    return Math.max(0, Math.min(100, (score / possible) * 100));
}

function displayLearnerProfile() {
    const select = document.getElementById("profileLearnerSelect");
    const container = document.getElementById("learnerProfileDetails");

    if (!select || !container) return;

    const selectedValue = select.value;

    if (selectedValue === "") {
        container.innerHTML =
            '<p class="profile-empty">Please select a learner first.</p>';
        return;
    }

    const learners = getLearners();

    const learner = learners.find(function (item, index) {
        const value = item.id != null ? String(item.id) : String(index);
        return value === selectedValue;
    });

    if (!learner) {
        container.innerHTML =
            '<p class="profile-empty">Learner details could not be found.</p>';
        return;
    }

    const attendance = getProfileAttendance(learner);
    const progress = getProfileProgress(learner);

    const presentCount = attendance.filter(function (record) {
        return String(record.status || "").toLowerCase() === "present";
    }).length;

    const attendancePercentage = attendance.length
        ? Math.round((presentCount / attendance.length) * 100)
        : 0;

    const averageProgress = progress.length
        ? Math.round(
            progress.reduce(function (sum, record) {
                return sum + getProfilePercentage(record);
            }, 0) / progress.length
        )
        : 0;

    const progressHTML = progress.length
        ? progress.map(function (record) {
            const subject = record.subject || "General Learning";
            const percentage = Math.round(getProfilePercentage(record));

            return `
                <div class="profile-progress-item">
                    <strong>${escapeProfileText(subject)}</strong>
                    <span>${percentage}% completed</span>
                    <div class="profile-progress-track">
                        <div class="profile-progress-fill"
                             style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join("")
        : '<p>No learning progress records are available yet.</p>';

    let achievementHTML = "";

    if (attendancePercentage >= 90 && attendance.length > 0) {
        achievementHTML +=
            '<div class="profile-achievement">🏆 Excellent Attendance!</div>';
    }

    if (averageProgress >= 70 && progress.length > 0) {
        achievementHTML +=
            '<div class="profile-achievement">🌟 Good Learning Progress!</div>';
    }

    if (!achievementHTML) {
        achievementHTML =
            '<p>Keep learning and attending regularly to unlock achievements!</p>';
    }

    container.innerHTML = `
        <div class="profile-card">
            <h3>👤 ${escapeProfileText(learner.name || "Learner")}</h3>

            <div class="profile-info-grid">
                <div class="profile-info-item">
                    <strong>Age</strong>
                    ${escapeProfileText(learner.age || "Not provided")}
                </div>

                <div class="profile-info-item">
                    <strong>Gender</strong>
                    ${escapeProfileText(learner.gender || "Not provided")}
                </div>

                <div class="profile-info-item">
                    <strong>Phone</strong>
                    ${escapeProfileText(learner.phone || "Not provided")}
                </div>

                <div class="profile-info-item">
                    <strong>Address</strong>
                    ${escapeProfileText(learner.address || "Not provided")}
                </div>
            </div>
        </div>

        <div class="profile-card">
            <h3>📅 Attendance Summary</h3>
            <p>Total attendance records: ${attendance.length}</p>
            <p>Present: ${presentCount}</p>
            <p>Attendance percentage: ${attendancePercentage}%</p>
        </div>

        <div class="profile-card">
            <h3>📚 Learning Progress</h3>
            <p>Average progress: ${averageProgress}%</p>
            ${progressHTML}
        </div>

        <div class="profile-card">
            <h3>🏅 Achievements</h3>
            ${achievementHTML}
        </div>

        <div class="profile-card">
            <h3>🎯 Learning Goals</h3>
            <p>Continue practising regularly and improve your progress in each subject.</p>
        </div>
    `;
}

function escapeProfileText(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

// Load learners and connect the button.
loadProfileLearners();

const viewProfileButton = document.getElementById("viewProfileBtn");

if (viewProfileButton) {
    viewProfileButton.addEventListener("click", displayLearnerProfile);
}

// ===============================
// ACHIEVEMENTS AND CERTIFICATES
// ===============================

function loadAchievementLearners() {
    const learners = getLearners();
    const dropdown = document.getElementById("achievementLearner");

    if (!dropdown) return;

    const previousValue = dropdown.value;

    dropdown.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Choose a learner";
    dropdown.appendChild(defaultOption);

    learners.forEach(function (learner, index) {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = learner.name;
        dropdown.appendChild(option);
    });

    dropdown.value = previousValue;
}


function getLearnerAchievements(learnerIndex) {
    const records = getProgressRecords();

    // Keep the latest progress record for each subject.
    const latestRecords = {};

    records.forEach(function (record) {
        if (Number(record.learnerIndex) !== Number(learnerIndex)) {
            return;
        }

        latestRecords[record.subject] = record;
    });

    const progress = Object.values(latestRecords);

    const average = progress.length
        ? progress.reduce(function (sum, record) {
            return sum + Number(record.percentage || 0);
        }, 0) / progress.length
        : 0;

    const achievements = [];

    if (progress.length > 0 && average >= 10) {
        achievements.push({
            icon: "🌱",
            title: "First Step",
            description: "Started making progress in learning!"
        });
    }

    if (progress.length > 0 && average >= 50) {
        achievements.push({
            icon: "📚",
            title: "Active Learner",
            description: "Reached 50% average learning progress!"
        });
    }

    if (progress.length > 0 && average >= 80) {
        achievements.push({
            icon: "⭐",
            title: "Learning Champion",
            description: "Reached 80% average learning progress!"
        });
    }

    if (progress.length > 0 && average >= 100) {
        achievements.push({
            icon: "🎯",
            title: "Master Learner",
            description: "Achieved 100% average learning progress!"
        });
    }

    return {
        average: Math.round(average),
        achievements: achievements
    };
}


function displayAchievements() {
    const dropdown = document.getElementById("achievementLearner");
    const results = document.getElementById("achievementResults");
    const certificateArea = document.getElementById("certificateArea");

    if (!dropdown || !results || !certificateArea) return;

    const selectedValue = dropdown.value;

    if (selectedValue === "") {
        results.textContent = "Please select a learner first.";
        certificateArea.classList.add("hidden");
        return;
    }

    const learners = getLearners();
    const learner = learners[Number(selectedValue)];

    if (!learner) {
        results.textContent = "Learner not found.";
        certificateArea.classList.add("hidden");
        return;
    }

    const result = getLearnerAchievements(Number(selectedValue));

    if (result.achievements.length === 0) {
        results.textContent =
            "No achievements unlocked yet. Keep learning and improving!";
        certificateArea.classList.add("hidden");
        return;
    }

    results.replaceChildren();

    result.achievements.forEach(function (achievement) {
        const card = document.createElement("div");
        card.className = "achievement-card";

        const title = document.createElement("h3");
        title.textContent =
            achievement.icon + " " + achievement.title;

        const description = document.createElement("p");
        description.textContent = achievement.description;

        card.append(title, description);
        results.appendChild(card);
    });

    document.getElementById("certificateContent").innerHTML = `
        <h1>CERTIFICATE OF ACHIEVEMENT</h1>
        <p>This certificate is proudly presented to</p>
        <h2>${escapeProfileText(learner.name)}</h2>
        <p>For dedication and progress in the Adult Literacy Program.</p>
        <h3>Average Learning Progress: ${result.average}%</h3>
        <p>Achievement: ${result.achievements
            .map(function (item) {
                return escapeProfileText(item.title);
            }).join(", ")}</p>
        <p>Date: ${new Date().toLocaleDateString("en-IN")}</p>
        <p>Adult Literacy Program</p>
    `;

    certificateArea.classList.remove("hidden");
}


// Connect achievement buttons.
const checkAchievementsButton =
    document.getElementById("checkAchievements");

if (checkAchievementsButton) {
    checkAchievementsButton.addEventListener(
        "click",
        displayAchievements
    );
}

const printCertificateButton =
    document.getElementById("printCertificate");

if (printCertificateButton) {
    printCertificateButton.addEventListener("click", function () {
        window.print();
    });
}


// Load learners when the page is opened.
loadAchievementLearners();


// LITRIVA HOMEPAGE BUTTON

const homepageLoginButton = document.getElementById("homepageLoginButton");
const homePage = document.getElementById("homePage");

if (homepageLoginButton && homePage && loginPage) {
    homepageLoginButton.addEventListener("click", function () {
        homePage.classList.add("hidden");
        loginPage.classList.remove("hidden");
    });
}
// HOMEPAGE SIGNUP BUTTON

const homepageSignupButton = document.getElementById("homepageSignupButton");

if (homepageSignupButton && homePage && signupPage) {
    homepageSignupButton.addEventListener("click", function () {
        homePage.classList.add("hidden");
        signupPage.classList.remove("hidden");
    });
}
// LEARNER LOGOUT
document.getElementById("learnerLogoutButton").addEventListener("click", function () {

    localStorage.removeItem("currentLearner");

    document.getElementById("learnerPortal").classList.add("hidden");
    document.getElementById("dashboardPage").classList.add("hidden");
    document.getElementById("signupPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");

    document.getElementById("loginForm").reset();
    document.getElementById("loginMessage").textContent = "";

});
// LEARNER SELF-ASSESSMENT

// Randomized Progressive Assessment Question Bank
const learnerQuestions = {

    Reading: {

        // LEVEL 1 - EASY
        1: [
            {
                question: "Which word means the opposite of 'hot'?",
                options: ["Cold", "Warm", "Heat", "Fire"],
                answer: "Cold"
            },
            {
                question: "Which word is a fruit?",
                options: ["Chair", "Apple", "Book", "Table"],
                answer: "Apple"
            },
            {
                question: "Complete the sentence: The sun ___ brightly.",
                options: ["sleep", "shines", "eat", "walk"],
                answer: "shines"
            },
            {
                question: "Which word is spelled correctly?",
                options: ["Frend", "Freind", "Friend", "Friedn"],
                answer: "Friend"
            },
            {
                question: "What do we use to read a story?",
                options: ["Book", "Spoon", "Shoes", "Cup"],
                answer: "Book"
            }
        ],

        // LEVEL 2 - MEDIUM
        2: [
            {
                question: "What is the main purpose of a newspaper?",
                options: [
                    "To provide news and information",
                    "To cook food",
                    "To wash clothes",
                    "To repair vehicles"
                ],
                answer: "To provide news and information"
            },
            {
                question: "Choose the correct meaning of 'honest'.",
                options: [
                    "Someone who tells the truth",
                    "Someone who sleeps",
                    "Someone who runs",
                    "Someone who shouts"
                ],
                answer: "Someone who tells the truth"
            },
            {
                question: "Complete the sentence: She ___ to work every day.",
                options: ["go", "going", "goes", "gone"],
                answer: "goes"
            },
            {
                question: "Which word means 'very tired'?",
                options: ["Energetic", "Exhausted", "Happy", "Excited"],
                answer: "Exhausted"
            },
            {
                question: "What is the main idea of a paragraph?",
                options: [
                    "The central message",
                    "The longest word",
                    "The last letter",
                    "The punctuation"
                ],
                answer: "The central message"
            }
        ],

        // LEVEL 3 - HARD
        3: [
            {
                question: "What does the phrase 'a piece of cake' mean?",
                options: [
                    "Something very easy",
                    "Something very expensive",
                    "Something very difficult",
                    "Something very sweet"
                ],
                answer: "Something very easy"
            },
            {
                question: "Choose the grammatically correct sentence.",
                options: [
                    "She have completed her work.",
                    "She has completed her work.",
                    "She completing her work.",
                    "She complete her work yesterday."
                ],
                answer: "She has completed her work."
            },
            {
                question: "Why is a conclusion written at the end of a passage?",
                options: [
                    "To summarize the main points",
                    "To introduce a new title",
                    "To list random words",
                    "To repeat every sentence"
                ],
                answer: "To summarize the main points"
            },
            {
                question: "Choose the synonym of 'rapid'.",
                options: ["Slow", "Fast", "Weak", "Quiet"],
                answer: "Fast"
            },
            {
                question: "What can we infer when a person carries an umbrella and wears a raincoat?",
                options: [
                    "It may be raining",
                    "It is very sunny",
                    "The person is cooking",
                    "The person is sleeping"
                ],
                answer: "It may be raining"
            }
        ]
    },

    Writing: {

        // LEVEL 1 - EASY
        1: [
            {
                question: "Which sentence is correct?",
                options: [
                    "i am happy.",
                    "I am happy.",
                    "i Am happy.",
                    "I am happy"
                ],
                answer: "I am happy."
            },
            {
                question: "Which punctuation mark ends a question?",
                options: [".", ",", "?", "!"],
                answer: "?"
            },
            {
                question: "Which word is spelled correctly?",
                options: ["School", "Skool", "Scool", "Shcool"],
                answer: "School"
            },
            {
                question: "Choose the correct spelling.",
                options: ["Market", "Markit", "Marcket", "Maket"],
                answer: "Market"
            },
            {
                question: "Which is a complete sentence?",
                options: [
                    "Playing outside",
                    "The boy runs.",
                    "On the table",
                    "Very beautiful"
                ],
                answer: "The boy runs."
            }
        ],

        // LEVEL 2 - MEDIUM
        2: [
            {
                question: "Choose the correctly punctuated sentence.",
                options: [
                    "Where are you going.",
                    "Where are you going?",
                    "where are you going!",
                    "Where are you going,"
                ],
                answer: "Where are you going?"
            },
            {
                question: "Fill in the blank: I ___ my homework yesterday.",
                options: ["complete", "completed", "completing", "completes"],
                answer: "completed"
            },
            {
                question: "Which word connects two ideas?",
                options: ["And", "Table", "Quickly", "Chair"],
                answer: "And"
            },
            {
                question: "Which sentence is written correctly?",
                options: [
                    "My brother live in Puttur.",
                    "My brother lives in Puttur.",
                    "My brother living Puttur.",
                    "My brother lives Puttur yesterday."
                ],
                answer: "My brother lives in Puttur."
            },
            {
                question: "Which is the correct beginning of a formal letter?",
                options: [
                    "Dear Sir or Madam,",
                    "Hey buddy!",
                    "What's up?",
                    "Hi dude!"
                ],
                answer: "Dear Sir or Madam,"
            }
        ],

        // LEVEL 3 - HARD
        3: [
            {
                question: "Which sentence is best suited for a formal application?",
                options: [
                    "I wanna take leave.",
                    "Please grant me leave for two days.",
                    "Give me two days off.",
                    "Hey, I won't come."
                ],
                answer: "Please grant me leave for two days."
            },
            {
                question: "Choose the correctly written sentence.",
                options: [
                    "Although it was raining, we went outside.",
                    "Although it was raining we went outside",
                    "Although, it was raining we went outside.",
                    "although it was raining, we went outside."
                ],
                answer: "Although it was raining, we went outside."
            },
            {
                question: "Which word is a synonym of 'improve'?",
                options: ["Worsen", "Enhance", "Destroy", "Ignore"],
                answer: "Enhance"
            },
            {
                question: "Which sentence uses the apostrophe correctly?",
                options: [
                    "The students books are here.",
                    "The student's book is here.",
                    "The students's book is here.",
                    "The student book's is here."
                ],
                answer: "The student's book is here."
            },
            {
                question: "Which is the best way to organize a paragraph?",
                options: [
                    "Main idea, supporting details, conclusion",
                    "Random sentences",
                    "Only a title",
                    "Repeated words"
                ],
                answer: "Main idea, supporting details, conclusion"
            }
        ]
    },

    Mathematics: {

        // LEVEL 1 - EASY
        1: [
            {
                question: "What is 5 + 3?",
                options: ["6", "7", "8", "9"],
                answer: "8"
            },
            {
                question: "What is 10 - 4?",
                options: ["5", "6", "7", "8"],
                answer: "6"
            },
            {
                question: "What is 3 × 4?",
                options: ["7", "12", "10", "14"],
                answer: "12"
            },
            {
                question: "What is 20 ÷ 5?",
                options: ["2", "3", "4", "5"],
                answer: "4"
            },
            {
                question: "Which number is the largest?",
                options: ["15", "25", "10", "20"],
                answer: "25"
            }
        ],

        // LEVEL 2 - MEDIUM
        2: [
            {
                question: "What is 125 + 75?",
                options: ["150", "200", "175", "250"],
                answer: "200"
            },
            {
                question: "What is 15 × 6?",
                options: ["80", "90", "75", "85"],
                answer: "90"
            },
            {
                question: "A shirt costs ₹500. You get ₹100 off. What is the final price?",
                options: ["₹400", "₹450", "₹300", "₹600"],
                answer: "₹400"
            },
            {
                question: "What is 144 ÷ 12?",
                options: ["10", "11", "12", "14"],
                answer: "12"
            },
            {
                question: "What is half of 250?",
                options: ["100", "125", "150", "200"],
                answer: "125"
            }
        ],

        // LEVEL 3 - HARD
        3: [
            {
                question: "What is 25% of 800?",
                options: ["100", "200", "250", "400"],
                answer: "200"
            },
            {
                question: "A person buys 3 items for ₹150 each. What is the total cost?",
                options: ["₹300", "₹350", "₹450", "₹500"],
                answer: "₹450"
            },
            {
                question: "If 5 notebooks cost ₹100, how much do 8 notebooks cost?",
                options: ["₹120", "₹160", "₹180", "₹200"],
                answer: "₹160"
            },
            {
                question: "What is 3/4 of 200?",
                options: ["100", "125", "150", "175"],
                answer: "150"
            },
            {
                question: "A bus travels 120 km in 3 hours. What is its average speed?",
                options: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"],
                answer: "40 km/h"
            }
        ]
    }
};


// Open progressive randomized assessment
document.getElementById("startLearnerAssessment")
    ?.addEventListener("click", function () {

        const assessmentArea = document.getElementById("learnerAssessmentArea");
        const quizContainer = document.getElementById("learnerQuizContainer");

        if (!assessmentArea || !quizContainer) return;

        assessmentArea.classList.remove("hidden");

        quizContainer.innerHTML = `
            <label for="learnerSubject">Choose a learning skill</label>

            <select id="learnerSubject">
                <option value="">Select a subject</option>
                <option value="Reading">Reading</option>
                <option value="Writing">Writing</option>
                <option value="Mathematics">Basic Mathematics</option>
            </select>

            <div id="learnerQuestionsArea"></div>
        `;

        assessmentArea.scrollIntoView({ behavior: "smooth" });

        document.getElementById("learnerSubject")
            .addEventListener("change", function () {

                const subject = this.value;
                const questionsArea =
                    document.getElementById("learnerQuestionsArea");

                if (!subject) {
                    questionsArea.innerHTML = "";
                    return;
                }

                const currentLearner = JSON.parse(
                    localStorage.getItem("currentLearner") || "null"
                );

                if (!currentLearner) {
                    questionsArea.innerHTML =
                        "<p>Please log in again.</p>";
                    return;
                }

                // Load saved learner levels
                let savedLevels = {};

                try {
                    savedLevels = JSON.parse(
                        localStorage.getItem("literacyAssessmentLevels")
                    ) || {};
                } catch {
                    savedLevels = {};
                }

                const username = currentLearner.username;

                if (!savedLevels[username]) {
                    savedLevels[username] = {};
                }

                const level = savedLevels[username][subject] || 1;

                // Get questions for the current level
                const questionBank = learnerQuestions[subject][level];

                // Shuffle questions
                const shuffledQuestions = [...questionBank]
                    .sort(() => Math.random() - 0.5);

                // Shuffle answer options
                shuffledQuestions.forEach(function (q) {
                    q.options = [...q.options]
                        .sort(() => Math.random() - 0.5);
                });

                let html = `
                    <div class="panel" style="margin-top:20px;">
                        <h3>Level ${level} - ${
                            level === 1 ? "Easy" :
                            level === 2 ? "Medium" : "Hard"
                        }</h3>

                        <p>Pass this level to unlock the next level.</p>

                        <form id="learnerAssessmentForm">
                `;

                shuffledQuestions.forEach(function (q, index) {

                    html += `
                        <div class="panel" style="margin-top:15px;">
                            <h3>Question ${index + 1}</h3>
                            <p>${escapeProfileText(q.question)}</p>
                    `;

                    q.options.forEach(function (option) {

                        html += `
                            <label style="display:block; margin:10px 0;">
                                <input type="radio"
                                    name="question${index}"
                                    value="${escapeProfileText(option)}"
                                    required>
                                ${escapeProfileText(option)}
                            </label>
                        `;
                    });

                    html += `</div>`;
                });

                html += `
                        <button type="submit" class="primary-btn">
                            Submit Assessment
                        </button>
                    </form>

                    <p id="learnerAssessmentMessage"></p>
                    </div>
                `;

                questionsArea.innerHTML = html;

                // Submit assessment
                document.getElementById("learnerAssessmentForm")
                    .addEventListener("submit", function (event) {

                        event.preventDefault();

                        let score = 0;

                        shuffledQuestions.forEach(function (q, index) {

                            const selected = document.querySelector(
                                `input[name="question${index}"]:checked`
                            );

                            if (selected &&
                                selected.value === q.answer) {
                                score++;
                            }
                        });

                        const percentage = Math.round(
                            (score / shuffledQuestions.length) * 100
                        );

                        // Pass mark: 60%
                        const passed = percentage >= 60;

                        // Unlock next level after passing
                        if (passed && level < 3) {
                            savedLevels[username][subject] = level + 1;
                        } else {
                            savedLevels[username][subject] = level;
                        }

                        localStorage.setItem(
                            "literacyAssessmentLevels",
                            JSON.stringify(savedLevels)
                        );

                        // Save result
                        const result = {
                            name: currentLearner.name,
                            username: username,
                            subject: subject,
                            level: level,
                            score: score,
                            totalQuestions: shuffledQuestions.length,
                            percentage: percentage,
                            date: new Date().toLocaleDateString("en-CA"),
                            time: new Date().toLocaleTimeString()
                        };

                        let savedResults = [];

                        try {
                            savedResults = JSON.parse(
                                localStorage.getItem(
                                    "literacyLearnerAssessments"
                                )
                            ) || [];
                        } catch {
                            savedResults = [];
                        }

                        if (!Array.isArray(savedResults)) {
                            savedResults = [];
                        }

                        savedResults.push(result);

                        localStorage.setItem(
                            "literacyLearnerAssessments",
                            JSON.stringify(savedResults)
                        );

                        // Show result
                        let message = `
                            <div class="panel" style="margin-top:20px;">
                                <h3>Assessment Completed!</h3>
                                <p>Level: ${level}</p>
                                <p>Score: ${score} / ${shuffledQuestions.length}</p>
                                <p>Percentage: ${percentage}%</p>
                        `;

                        if (passed && level < 3) {
                            message += `
                                <h3>🎉 Congratulations!</h3>
                                <p>You passed Level ${level}!</p>
                                <p>Level ${level + 1} is now unlocked.</p>
                            `;
                        } else if (passed && level === 3) {
                            message += `
                                <h3>🏆 Excellent!</h3>
                                <p>You completed all 3 levels!</p>
                            `;
                        } else {
                            message += `
                                <p>You need at least 60% to pass.</p>
                                <p>Try again to improve your score!</p>
                            `;
                        }

                        message += `</div>`;

                        document.getElementById(
                            "learnerAssessmentMessage"
                        ).innerHTML = message;

                        if (typeof renderLearnerOwnResults === "function") {
                            renderLearnerOwnResults();
                        }

                        this.querySelector(
                            "button[type='submit']"
                        ).disabled = true;

                    });
            });
    });


// Display only the currently logged-in learner's results
function renderLearnerOwnResults() {

    const currentLearner = JSON.parse(
        localStorage.getItem("currentLearner")
    );

    if (!currentLearner) {
        return;
    }

    let savedResults = [];

    try {
        savedResults = JSON.parse(
            localStorage.getItem("literacyLearnerAssessments")
        ) || [];
    } catch {
        savedResults = [];
    }

    const myResults = savedResults.filter(function (result) {
        return result.username === currentLearner.username;
    });

    const resultContainer = document.getElementById("learnerOwnResults");

    if (myResults.length === 0) {
        resultContainer.innerHTML =
            "<p>You have not completed any assessments yet.</p>";
        return;
    }

    resultContainer.innerHTML = myResults.map(function (result) {

        return `
            <div class="panel">
                <h3>${result.subject}</h3>
                <p>Score: ${result.score} / ${result.totalQuestions}</p>
                <p>Percentage: ${result.percentage}%</p>
                <p>Date: ${result.date}</p>
            </div>
        `;

    }).join("");

}
// SHARED DASHBOARD ROLE CONTROL
function setDashboardRole(role) {

    const isLearner = role === "learner";

    // Switch Overview content
    document.getElementById("adminHero")
        .classList.toggle("hidden", isLearner);

    document.getElementById("adminStats")
        .classList.toggle("hidden", isLearner);

    document.getElementById("adminOverviewContent")
        .classList.toggle("hidden", isLearner);

    document.getElementById("learnerHero")
        .classList.toggle("hidden", !isLearner);

    document.getElementById("learnerOverviewContent")
        .classList.toggle("hidden", !isLearner);

    document.getElementById("overviewQuote")
        .classList.toggle("hidden", isLearner);

    // Update heading and profile
    if (isLearner) {

        let learner = {};

        try {
            learner = JSON.parse(
                localStorage.getItem("currentLearner")
            ) || {};
        } catch {
            learner = {};
        }

        document.getElementById("overviewHeading").textContent =
            "Welcome, " + (learner.name || "Learner") + "!";

        document.getElementById("overviewEyebrow").textContent =
            "YOUR LEARNING DASHBOARD";

        document.getElementById("overviewSubtitle").textContent =
            "Keep learning and growing every day.";

        document.getElementById("overviewProfileName").textContent =
            learner.name || "Learner";

        document.getElementById("overviewProfileRole").textContent =
            "Learner";

        document.getElementById("overviewAvatar").textContent =
            (learner.name || "L").charAt(0).toUpperCase();

        // Show learner's personal attendance
        const attendance = JSON.parse(
            localStorage.getItem("literacyAttendance") || "[]"
        );

        const today = new Date().toLocaleDateString("en-CA");

        const todayRecord = Array.isArray(attendance)
            ? attendance.find(function (record) {
                return record.username === learner.username
                    && record.date === today;
            })
            : null;

        document.getElementById("learnerOverviewAttendance")
            .textContent = todayRecord
            ? "You are marked Present today. Attendance was recorded automatically."
            : "No attendance record found for today.";

    } else {

        document.getElementById("overviewHeading").textContent =
            "Your learning community.";

        document.getElementById("overviewEyebrow").textContent =
            "ADULT EDUCATION MANAGEMENT";

        document.getElementById("overviewSubtitle").textContent =
            "A little progress each day adds up to big results.";

        document.getElementById("overviewProfileName").textContent =
            "Administrator";

        document.getElementById("overviewProfileRole").textContent =
            "Program Coordinator";

        document.getElementById("overviewAvatar").textContent = "A";
    }

    // Hide Admin-only sections for learners
    const adminSections = [
        "registration",
        "learners",
        "attendanceManagement"
    ];

    adminSections.forEach(function (id) {
        const section = document.getElementById(id);

        if (section) {
            section.classList.toggle("hidden", isLearner);
        }
    });

    // Hide Admin-only navigation
    const adminNavigation = [
        "registerNav",
        "learnersNav",
        "attendanceNav"
    ];

    adminNavigation.forEach(function (id) {
        const nav = document.getElementById(id);

        if (nav) {
            nav.classList.toggle("hidden", isLearner);
        }
    });

    // Hide the Attendance navigation for learners
    const attendanceNav = document.getElementById("attendanceNav");

    if (attendanceNav) {
        attendanceNav.classList.toggle("hidden", isLearner);
    }
}

    // ======================================
// PERSONAL DATA FILTER FOR LEARNER MODE
// ======================================

const adminSmartAssistantFunction = analyzeLearningProgress;
const adminProfileFunction = displayLearnerProfile;
const adminAchievementsFunction = displayAchievements;


// Get logged-in learner
function getLoggedInLearner() {
    try {
        return JSON.parse(localStorage.getItem("currentLearner"));
    } catch {
        return null;
    }
}


// Get self-assessment records belonging to one learner
function getMyAssessmentRecords() {
    const learner = getLoggedInLearner();

    if (!learner) return [];

    try {
        const records = JSON.parse(
            localStorage.getItem("literacyLearnerAssessments")
        ) || [];

        return Array.isArray(records)
            ? records.filter(function (record) {
                return record.username === learner.username;
            })
            : [];
    } catch {
        return [];
    }
}


// SMART ASSISTANT
analyzeLearningProgress = function () {

    const learner = getLoggedInLearner();

    // Admin continues using the original function
    if (!learner) {
        adminSmartAssistantFunction();
        return;
    }

    const records = getMyAssessmentRecords();
    const container = document.getElementById("smartLearnerResults");

    if (!container) return;

    container.replaceChildren();

    document.getElementById("smartTotal").textContent =
        records.length ? "1" : "0";

    const average = records.length
        ? Math.round(
            records.reduce(function (sum, record) {
                return sum + Number(record.percentage || 0);
            }, 0) / records.length
        )
        : 0;

    document.getElementById("smartSupport").textContent =
        records.length && average < 40 ? "1" : "0";

    document.getElementById("smartGoodProgress").textContent =
        records.length && average >= 70 ? "1" : "0";

    if (records.length === 0) {
        const message = document.createElement("p");

        message.textContent =
            "Complete your assessments to receive your personal learning suggestions.";

        container.appendChild(message);
        return;
    }

    records.forEach(function (record) {

        const card = document.createElement("div");
        card.className = "smart-learner-card";

        const heading = document.createElement("h4");
        heading.textContent = record.subject;

        const score = document.createElement("p");
        score.textContent =
            "Your progress: " + record.percentage + "%";

        const suggestion = document.createElement("p");

        if (record.percentage < 40) {
            suggestion.textContent =
                "Suggestion: Practise this subject regularly and take your time.";
        } else if (record.percentage < 70) {
            suggestion.textContent =
                "Suggestion: Keep practising to improve your skills.";
        } else {
            suggestion.textContent =
                "Suggestion: Great work! Continue learning new skills.";
        }

        card.append(heading, score, suggestion);
        container.appendChild(card);
    });
};


// LEARNER PROFILE
displayLearnerProfile = function () {

    const learner = getLoggedInLearner();

    // Admin uses the original profile display
    if (!learner) {
        adminProfileFunction();
        return;
    }

    const container = document.getElementById("learnerProfileDetails");

    if (!container) return;

    // Hide learner selection controls
    const select = document.getElementById("profileLearnerSelect");
    const button = document.getElementById("viewProfileBtn");

    if (select) select.style.display = "none";
    if (button) button.style.display = "none";

    const records = getMyAssessmentRecords();

    let attendance = [];

    try {
        const saved = JSON.parse(
            localStorage.getItem("literacyAttendance")
        );

        if (Array.isArray(saved)) {
            attendance = saved.filter(function (record) {
                return record.username === learner.username;
            });
        }
    } catch {
        attendance = [];
    }

    const present = attendance.filter(function (record) {
        return record.status === "Present";
    }).length;

    const percentage = attendance.length
        ? Math.round((present / attendance.length) * 100)
        : 0;

    let progressHTML = "";

    if (records.length) {
        progressHTML = records.map(function (record) {
            return `
                <div class="profile-progress-item">
                    <strong>${escapeProfileText(record.subject)}</strong>
                    <span>${record.percentage}%</span>
                    <p>Score: ${record.score}/${record.totalQuestions}</p>
                    <p>Date: ${escapeProfileText(record.date)}</p>
                </div>
            `;
        }).join("");
    } else {
        progressHTML = "<p>You have not completed any assessments yet.</p>";
    }

    container.innerHTML = `
        <div class="profile-card">
            <h3>👤 My Personal Information</h3>

            <p><strong>Name:</strong> ${escapeProfileText(learner.name || "")}</p>
            <p><strong>Username:</strong> ${escapeProfileText(learner.username || "")}</p>
            <p><strong>Email:</strong> ${escapeProfileText(learner.email || "")}</p>
            <p><strong>Role:</strong> Learner</p>
        </div>

        <div class="profile-card">
            <h3>📅 My Attendance</h3>
            <p>Recorded attendance: ${attendance.length}</p>
            <p>Present: ${present}</p>
            <p>Attendance percentage: ${percentage}%</p>
        </div>

        <div class="profile-card">
            <h3>📚 My Learning Progress</h3>
            ${progressHTML}
        </div>
    `;
};


// ACHIEVEMENTS
displayAchievements = function () {

    const learner = getLoggedInLearner();

    // Admin uses original achievement function
    if (!learner) {
        adminAchievementsFunction();
        return;
    }

    const dropdown = document.getElementById("achievementLearner");
    const button = document.getElementById("checkAchievements");
    const results = document.getElementById("achievementResults");
    const certificateArea = document.getElementById("certificateArea");

    if (!results || !certificateArea) return;

    // Hide Admin learner selector
    if (dropdown) dropdown.style.display = "none";
    if (button) button.style.display = "none";

    results.replaceChildren();
    certificateArea.classList.add("hidden");

    const records = getMyAssessmentRecords();

    if (records.length === 0) {
        results.textContent =
            "Complete your assessments to unlock your achievements.";
        return;
    }

    const average = Math.round(
        records.reduce(function (sum, record) {
            return sum + Number(record.percentage || 0);
        }, 0) / records.length
    );

    const achievements = [];

    if (records.length >= 1) {
        achievements.push("🌱 First Assessment Completed");
    }

    if (average >= 50) {
        achievements.push("📚 Active Learner");
    }

    if (average >= 80) {
        achievements.push("⭐ Learning Champion");
    }

    if (average === 100) {
        achievements.push("🏆 Perfect Score");
    }

    achievements.forEach(function (achievement) {
        const card = document.createElement("div");
        card.className = "achievement-card";

        const heading = document.createElement("h3");
        heading.textContent = achievement;

        card.appendChild(heading);
        results.appendChild(card);
    });

    document.getElementById("certificateContent").innerHTML = `
        <h1>LEARNING ACHIEVEMENT</h1>
        <p>This achievement belongs to</p>
        <h2>${escapeProfileText(learner.name)}</h2>
        <p>Adult Literacy Program</p>
        <h3>Average Assessment Score: ${average}%</h3>
        <p>${achievements.map(escapeProfileText).join(", ")}</p>
        <p>${new Date().toLocaleDateString("en-IN")}</p>
    `;
};
// Learner Overview Register Button
document.getElementById("learnerOverviewRegisterButton")
    ?.addEventListener("click", function () {
        showSection("registration");
    });
  


// Personal Learning Progress for Learners
const previousShowSectionForProgress = showSection;

showSection = function(sectionId) {

    previousShowSectionForProgress(sectionId);

    const learner = getLoggedInLearner();

    if (sectionId !== "learningProgress") return;

    const progressSection = document.getElementById("learningProgress");
    const progressForm = document.getElementById("progressForm");
    const progressTable = document.getElementById("progressTable");

    if (!progressSection) return;

    // Admin view
    if (!learner) {
        if (progressForm) progressForm.style.display = "";
        if (progressTable) progressTable.closest(".table-wrapper").style.display = "";
        return;
    }

    // Hide Admin controls for learners
    if (progressForm) progressForm.style.display = "none";

    if (progressTable) {
        progressTable.closest(".table-wrapper").style.display = "none";
    }

    let personalResults = document.getElementById("personalProgressResults");

    if (!personalResults) {
        personalResults = document.createElement("div");
        personalResults.id = "personalProgressResults";
        progressSection.appendChild(personalResults);
    }

    let assessments = [];

    try {
        assessments = JSON.parse(
            localStorage.getItem("literacyLearnerAssessments")
        ) || [];
    } catch {
        assessments = [];
    }

    const myResults = assessments.filter(function(record) {
        return record.username === learner.username;
    });

    personalResults.innerHTML = `
        <h2>My Learning Results</h2>
        <p>These are your personal assessment results.</p>

        ${
            myResults.length === 0
            ? "<p>No assessments completed yet.</p>"
            : myResults.map(function(record) {
                return `
                    <div class="panel" style="margin-top:15px;">
                        <h3>${escapeProfileText(record.subject || "Assessment")}</h3>
                        <p>Score: ${escapeProfileText(String(record.score ?? 0))} / ${escapeProfileText(String(record.totalQuestions ?? 0))}</p>
                        <p>Percentage: ${escapeProfileText(String(record.percentage ?? 0))}%</p>
                        <p>Date: ${escapeProfileText(record.date || "-")}</p>
                    </div>
                `;
            }).join("")
        }
    `;
};
// Learner Personal Profile
const adminLoadProfileFunction = loadProfileLearners;

loadProfileLearners = function() {

    const learner = getLoggedInLearner();

    // Admin keeps the original profile loader
    if (!learner) {
        adminLoadProfileFunction();
        return;
    }

    const select = document.getElementById("profileLearnerSelect");
    const button = document.getElementById("viewProfileBtn");
    const details = document.getElementById("learnerProfileDetails");

    if (select) select.style.display = "none";
    if (button) button.style.display = "none";

    if (!details) return;

    let attendance = [];
    let assessments = [];

    try {
        attendance = JSON.parse(localStorage.getItem("literacyAttendance")) || [];
    } catch {
        attendance = [];
    }

    try {
        assessments = JSON.parse(localStorage.getItem("literacyLearnerAssessments")) || [];
    } catch {
        assessments = [];
    }

    if (!Array.isArray(attendance)) attendance = [];
    if (!Array.isArray(assessments)) assessments = [];

    const myAttendance = attendance.filter(record =>
        record.username === learner.username
    );

    const myAssessments = assessments.filter(record =>
        record.username === learner.username
    );

    details.innerHTML = `
        <div class="panel">
            <h3>My Personal Information</h3>
            <p><strong>Name:</strong> ${escapeProfileText(learner.name || "-")}</p>
            <p><strong>Username:</strong> ${escapeProfileText(learner.username || "-")}</p>
            <p><strong>Email:</strong> ${escapeProfileText(learner.email || "-")}</p>
        </div>

        <div class="panel" style="margin-top:20px;">
            <h3>My Attendance</h3>
            <p>Total attendance records: ${myAttendance.length}</p>

            ${
                myAttendance.length === 0
                ? "<p>No attendance records found.</p>"
                : myAttendance.map(record => `
                    <p>
                        ${escapeProfileText(record.date || "-")} —
                        ${escapeProfileText(record.status || "-")}
                    </p>
                `).join("")
            }
        </div>

        <div class="panel" style="margin-top:20px;">
            <h3>My Learning Progress</h3>

            ${
                myAssessments.length === 0
                ? "<p>No assessments completed yet.</p>"
                : myAssessments.map(record => `
                    <p>
                        <strong>${escapeProfileText(record.subject || "-")}</strong>:
                        ${escapeProfileText(String(record.percentage ?? 0))}%
                    </p>
                `).join("")
            }
        </div>
    `;
};
// Learner Personal Achievements
const adminLoadAchievementsFunction = loadAchievementLearners;

loadAchievementLearners = function() {

    const learner = getLoggedInLearner();

    // Admin keeps the original function
    if (!learner) {
        adminLoadAchievementsFunction();
        return;
    }

    const dropdown = document.getElementById("achievementLearner");
    const button = document.getElementById("checkAchievements");
    const results = document.getElementById("achievementResults");

    if (dropdown) dropdown.style.display = "none";
    if (button) button.style.display = "none";

    if (results) {
        displayAchievements();
    }
};
// Personal Smart Assistant View for Learners
const adminLoadProgressLearnersFunction = loadProgressLearners;

loadProgressLearners = function() {

    const learner = getLoggedInLearner();

    // Admin keeps the original loader
    if (!learner) {
        adminLoadProgressLearnersFunction();
        return;
    }

    const dropdown = document.getElementById("progressLearner");
    const progressForm = document.getElementById("progressForm");
    const progressTable = document.getElementById("progressTable");

    if (dropdown) dropdown.style.display = "none";
    if (progressForm) progressForm.style.display = "none";

    if (progressTable) {
        const tableWrapper = progressTable.closest(".table-wrapper");
        if (tableWrapper) tableWrapper.style.display = "none";
    }

    analyzeLearningProgress();
};
// Fix Start Assessment button on Learner Overview
document.getElementById("overviewAssessmentButton")
    ?.addEventListener("click", function () {

        const dashboard = document.getElementById("dashboardPage");
        const learnerPortal = document.getElementById("learnerPortal");
        const startButton = document.getElementById("startLearnerAssessment");

        dashboard.classList.add("hidden");
        learnerPortal.classList.remove("hidden");

        if (startButton) {
            startButton.click();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });