
// Populate user info
document.addEventListener("DOMContentLoaded", () => {
    
// Selecting the sidebar and buttons
const sidebar = document.querySelector(".sidebar");
const sidebarOpenBtn = document.querySelector("#sidebar-open");
const sidebarCloseBtn = document.querySelector("#sidebar-close");
const sidebarLockBtn = document.querySelector("#lock-icon");
// Function to toggle the lock state of the sidebar
const toggleLock = () => {
sidebar.classList.toggle("locked");
// If the sidebar is not locked
if (!sidebar.classList.contains("locked")) {
    sidebar.classList.add("hoverable");
    sidebarLockBtn.classList.replace("bx-lock-alt", "bx-lock-open-alt");
} else {
    sidebar.classList.remove("hoverable");
    sidebarLockBtn.classList.replace("bx-lock-open-alt", "bx-lock-alt");
}
};
// Function to hide the sidebar when the mouse leaves
const hideSidebar = () => {
if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.add("close");
}
};
// Function to show the sidebar when the mouse enter
const showSidebar = () => {
    if (sidebar.classList.contains("hoverable")) {
    sidebar.classList.remove("close");
}
};
// Function to show and hide the sidebar
const toggleSidebar = () => {
    sidebar.classList.toggle("close");
};
// If the window width is less than 800px, close the sidebar and remove hoverability and lock
if (window.innerWidth < 800) {
    sidebar.classList.add("close");
    sidebar.classList.remove("locked");
    sidebar.classList.remove("hoverable");
}
// Adding event listeners to buttons and sidebar for the corresponding actions
sidebarLockBtn.addEventListener("click", toggleLock);
sidebar.addEventListener("mouseleave", hideSidebar);
sidebar.addEventListener("mouseenter", showSidebar);
sidebarOpenBtn.addEventListener("click", toggleSidebar);
sidebarCloseBtn.addEventListener("click", toggleSidebar);

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