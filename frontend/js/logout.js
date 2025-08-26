function doLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}

async function handleLogoutClick() {
    if (window.Swal) {
        const res = await Swal.fire({
            title: 'Log out?',
            text: 'You will need to log in again to continue.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, log out',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            allowEscapeKey: true,
        });
        if (res.isConfirmed) doLogout();
    } else {
        if (confirm('Log out?')) doLogout();
    }
}

// New function to attach listener after sidebar loads
function attachLogoutListener() {
    const btn = document.getElementById("btn-logout");
    if (btn) {
        btn.addEventListener("click", handleLogoutClick);
    }

    // Optional: for a topbar logout button
    const btnTop = document.getElementById("btn-logout-top");
    if (btnTop) {
        btnTop.addEventListener("click", handleLogoutClick);
    }
}
