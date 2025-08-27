function includeHTML(id, file) {
    return fetch(file)
        .then(res => {
            if (!res.ok) throw new Error("File not found: " + file);
            return res.text();
        })
        .then(data => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = data;
            } else {
                console.warn(`Element with id="${id}" not found in DOM.`);
            }
        })
        .catch(e => console.error(e));
}


includeHTML("top", "../layout/top.html").then(() => {

    const profileDropdown = document.querySelector('.user-profile');
    const dropdown = document.querySelector('.user-profile .dropdown');

    if (profileDropdown && dropdown) {
        profileDropdown.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent closing immediately
            dropdown.style.display =
                dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown if you click anywhere else
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
        });
    }

    attachLogoutListener();
        
});
includeHTML("topbar2", "../layout/topbar2.html").then(()=>{

    const emp = JSON.parse(localStorage.getItem("employee"));
    if (emp) {
        $("#greeting").text(`Welcome to ${emp.e_fname}`);
    } else {
        $("#greeting").text("Welcome");
    }

    // Set current date
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    $('#current-date').text(currentDate.toLocaleDateString('en-US', options));

});