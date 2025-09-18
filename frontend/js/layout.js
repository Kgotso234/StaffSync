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

includeHTML("sidebar", "../layout/employee/sidebar.html").then(() => {
    // Sidebar is loaded, now attach logout listener
    attachLogoutListener();


    //populate user info
    const emp = localStorage.getItem("employee");
    if (emp) {
        try {
            const employee = JSON.parse(emp);
            const nameElement  = document.querySelector('data_text .name');
            const emailElement = document.querySelector('.data_text .email');
           if (employee && nameElement && emailElement) {
                nameElement.textContent = employee.e_fname + " " + employee.e_lname;
                emailElement.textContent = employee.e_email;

                document.querySelector('.data_text').classList.remove('hide');
           }
        } catch (error) {
            console.error("Error parsing employee data from localStorage:", error);
        }
    }
});

includeHTML("topbar", "../layout/employee/topbar").then(()=>{

    // const emp = JSON.parse(localStorage.getItem("employee"));
    // if (emp) {
    //     $("#greeting").text(`Welcome to ${emp.e_fname}`);
    // } else {
    //     $("#greeting").text("Welcome");
    // }

    // Set current date
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    $('#current-date').text(currentDate.toLocaleDateString('en-US', options));

});