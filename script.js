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
                attendance = JSON.parse(
                    localStorage.getItem("literacyAttendance")
                ) || [];
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
                dashboardPage.classList.add("hidden");

                const learnerPortal =
                    document.getElementById("learnerPortal");

                learnerPortal.classList.remove("hidden");

                document.getElementById("learnerPortalName").textContent =
                    account.name;
                    
                    renderLearnerOwnResults();

                document.getElementById("learnerAttendanceStatus").textContent =
                    alreadyMarked
                    ? "Your attendance has already been recorded today."
                    : "Your attendance has been automatically recorded as Present today.";

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

    // Hide all dashboard sections
    document.querySelectorAll("#dashboardPage .dashboard-section")
        .forEach(function (section) {
            section.classList.add("hidden");
        });

    // Show the selected section
    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.remove("hidden");

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
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

// Display saved progress
function displayProgress() {

    const learners = getLearners();
    const records = getProgressRecords();
    const table = document.getElementById("progressTable");

    table.replaceChildren();

    if (records.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No learning progress recorded yet.";

        row.appendChild(cell);
        table.appendChild(row);
        return;
    }

    records.forEach(function (record) {

        const row = document.createElement("tr");

        // Learner name
        const learnerCell = document.createElement("td");
        learnerCell.textContent =
            learners[record.learnerIndex]?.name || "Learner unavailable";

        // Subject
        const subjectCell = document.createElement("td");
        subjectCell.textContent = record.subject;

        // Percentage
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

        // Remark
        const remarkCell = document.createElement("td");

        const remark = document.createElement("span");
        remark.className = "progress-remark";
        remark.textContent = record.remark;

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

const learnerQuestions = {
    Reading: [
        {
            question: "Which word means the opposite of 'big'?",
            options: ["Small", "Tall", "Wide", "Long"],
            answer: "Small"
        },
        {
            question: "Which word is a fruit?",
            options: ["Chair", "Apple", "Book", "Table"],
            answer: "Apple"
        },
        {
            question: "Complete the sentence: The sun ___ in the sky.",
            options: ["sleep", "run", "shines", "eat"],
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

    Writing: [
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
    ]
};


// Open assessment area
document.getElementById("startLearnerAssessment").addEventListener("click", function () {

    const assessmentArea = document.getElementById("learnerAssessmentArea");
    const quizContainer = document.getElementById("learnerQuizContainer");

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

    assessmentArea.scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("learnerSubject").addEventListener("change", function () {

        const subject = this.value;
        const questionsArea = document.getElementById("learnerQuestionsArea");

        if (!subject) {
            questionsArea.innerHTML = "";
            return;
        }

        const questions = learnerQuestions[subject];

        let html = `<form id="learnerAssessmentForm">`;

        questions.forEach(function (q, index) {

            html += `
                <div class="panel">
                    <h3>Question ${index + 1}</h3>
                    <p>${q.question}</p>
            `;

            q.options.forEach(function (option) {

                html += `
                    <label style="display:block; margin:10px 0;">
                        <input type="radio"
                            name="question${index}"
                            value="${option}"
                            required>
                        ${option}
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
        `;

        questionsArea.innerHTML = html;


        // Submit assessment
        document.getElementById("learnerAssessmentForm").addEventListener("submit", function (event) {

            event.preventDefault();

            const currentLearner = JSON.parse(
                localStorage.getItem("currentLearner")
            );

            if (!currentLearner) {
                alert("Please log in again.");
                return;
            }

            let score = 0;

            questions.forEach(function (q, index) {

                const selected = document.querySelector(
                    `input[name="question${index}"]:checked`
                );

                if (selected && selected.value === q.answer) {
                    score++;
                }

            });

            const percentage = Math.round(
                (score / questions.length) * 100
            );

            const result = {
                name: currentLearner.name,
                username: currentLearner.username,
                subject: subject,
                score: score,
                totalQuestions: questions.length,
                percentage: percentage,
                date: new Date().toLocaleDateString("en-CA"),
                time: new Date().toLocaleTimeString()
            };

            let savedResults = [];

            try {
                savedResults = JSON.parse(
                    localStorage.getItem("literacyLearnerAssessments")
                ) || [];
            } catch {
                savedResults = [];
            }

            savedResults.push(result);

            localStorage.setItem(
                "literacyLearnerAssessments",
                JSON.stringify(savedResults)
            );

            document.getElementById("learnerAssessmentMessage").innerHTML = `
                <h3>Assessment Completed!</h3>
                <p>Your Score: ${score} / ${questions.length}</p>
                <p>Your Percentage: ${percentage}%</p>
                <p>Subject: ${subject}</p>
            `;

            renderLearnerOwnResults();

            this.querySelector("button[type='submit']").disabled = true;

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