function doLogout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
}

async function handleLogoutClick(e) {
    // stop <a href="#"> from navigating
    if (e) e.preventDefault();

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

function attachLogoutListener() {
    const btn = document.getElementById("btn-logout");
    if (btn) {
        btn.addEventListener("click", handleLogoutClick);
    }

    const btnTop = document.getElementById("btn-logout-top");
    if (btnTop) {
        btnTop.addEventListener("click", handleLogoutClick);
    }
}

document.addEventListener("DOMContentLoaded", attachLogoutListener);
