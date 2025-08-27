// Function to toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const icon = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// Listen for changes on the radio buttons to update the form UI
document.querySelectorAll('input[name="user_type"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const title = document.getElementById('title');
        const emailLabel = document.getElementById('emailLabel');
        const emailInput = document.getElementById('emailInput');

        if (this.value === 'admin') {
            title.textContent = 'Administrator Login';
            emailLabel.textContent = 'Admin Email:';
            emailInput.placeholder = 'Enter admin email address';
        } else {
            title.textContent = 'Employee Login';
            emailLabel.textContent = 'Email:';
            emailInput.placeholder = 'Enter your email address';
        }
    });
});

/**
 * Handles the login submission for both Admins and Employees.
 */
async function handleLogin(e) {
    e.preventDefault(); // Prevent the form from reloading the page

    // 1. Get the selected user type and input values
    const userType = document.querySelector('input[name="user_type"]:checked').value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("password").value;

    // 2. Prepare dynamic variables based on user type
    let apiUrl = "";
    let requestBody = {};
    let redirectUrl = "";

    if (userType === 'admin') {
        // --- Settings for Admin Login ---
        apiUrl = "http://localhost:5000/login"; // Your admin login endpoint
        requestBody = { c_email: email, password: password };
        redirectUrl = "/admin/dashboard"; // Your admin dashboard page
    } else {
        // --- Settings for Employee Login ---
        apiUrl = "http://localhost:5000/employees/login"; // Your employee login endpoint
        requestBody = { e_email: email, password: password };
        redirectUrl = "/employee/apply"; // Your employee profile page
    }

    // 3. Perform the fetch request using the dynamic variables
    try {
        const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        console.log("Login Response:", data);

        if (!res.ok) {
            // Use the error message from the backend, or a default one
            Swal.fire({
                icon: "error",
                title: "Login Failed",
                text: data.error || "Invalid credentials. Please try again."
            });
            return;
        }

        // 4. On success, store the token and redirect
        localStorage.setItem("token", data.token);
        // 5. store company/ employee info
        if (userType === 'admin' && data.company) {
            localStorage.setItem("company", JSON.stringify(data.company));
        } else if (userType === 'employee' && data.employee) {
            localStorage.setItem("employee", JSON.stringify(data.employee));
        }
        Swal.fire({
            icon: "success",
            title: "Login Successful!",
            timer: 1500, // Shorter timer for better UX
            showConfirmButton: true,
        }).then(() => {
            window.location.href = redirectUrl; // Redirect to the correct page
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

// Attach the single login handler to the form's submit event
document.getElementById("loginForm").addEventListener("submit", handleLogin);