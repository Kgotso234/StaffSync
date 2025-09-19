// Handle password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            const eyeOffIcon = this.querySelector('.eye-off-icon');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    });

// Tab switching
document.addEventListener('DOMContentLoaded', function() {
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    const tabContents = document.querySelectorAll('.tab-content');

    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Reset all
            tabTriggers.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activate selected
            this.classList.add('active');
            document.getElementById(targetTab + '-tab').classList.add('active');
        });
    });

    // Attach login handlers
    document.getElementById("employeeLoginForm")
        .addEventListener("submit", handleLogin);
    document.getElementById("adminLoginForm")
        .addEventListener("submit", handleLogin);
});

// Login handler
async function handleLogin(e) {
    e.preventDefault();

    const formId = e.target.id;
    let userType, email, password, apiUrl, requestBody, redirectUrl;

    if (formId === "employeeLoginForm") {
        userType = "employee";
        email = document.getElementById("employee-email").value;
        password = document.getElementById("employee-password").value;
        apiUrl = "http://localhost:5000/employees/login";
        requestBody = { e_email: email, password: password };
        redirectUrl = "/employee/dashboard";
    } else {
        userType = "admin";
        email = document.getElementById("admin-email").value;
        password = document.getElementById("admin-password").value;
        apiUrl = "http://localhost:5000/login";
        requestBody = { c_email: email, password: password };
        redirectUrl = "/admin/dashboard";
    }

    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        console.log("Login Response:", data);

        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: data.error || "Invalid credentials. Please try again."
            });
            return;
        }

        // Store token and user info
        localStorage.setItem("token", data.token);
        if (userType === "admin" && data.company) {
            localStorage.setItem("company", JSON.stringify(data.company));
        } else if (userType === "employee" && data.employee) {
            localStorage.setItem("employee", JSON.stringify(data.employee));
        }

        Swal.fire({
            icon: "success",
            title: "Login Successful!",
            timer: 1500,
            showConfirmButton: false,
        }).then(() => {
            window.location.href = redirectUrl;
        });

    } catch (err) {
        console.error("Login Error:", err);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An unexpected error occurred. Please try again shortly."
        });
    }
}
