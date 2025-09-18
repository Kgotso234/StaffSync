// Populate user info
document.addEventListener("DOMContentLoaded", () => {


    const emp = localStorage.getItem("employee");
    const nameElement  = document.querySelector('.data_text .name');
    const emailElement = document.querySelector('.data_text .email');

    if (!nameElement || !emailElement) {
        console.warn("Sidebar name/email elements not found.");
        return;
    }

    try {
        if (emp) {
        const employee = JSON.parse(emp);
        console.log("Loaded employee:", employee);

        nameElement.textContent = employee.e_fname + " " + employee.e_lname;
        emailElement.textContent = employee.e_email;
        } else {
        // Fallback if no employee in localStorage
        nameElement.textContent = "Guest";
        emailElement.textContent = "";
        }
    } catch (error) {
        console.error("Error parsing employee data:", error);
        nameElement.textContent = "Guest";
        emailElement.textContent = "";
    }
});