
// departmemt
// //create department
document.getElementById("createDepartment").addEventListener("submit", async function (e) {
    e.preventDefault();

    const departmentName = document.getElementById("departmentName").value.trim();
    //get stored token after login
    const token = localStorage.getItem("token");

    if(!departmentName) {
        return Swal.fire("Error", "Department name is required", "error");
    }

    if(!token) {
        return Swal.fire("Unauthorized", "Please login first to continue", "warning");
    }

    try {
        const response = await fetch("http://localhost:5000/departments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ departmentName })
        });

        const text = await response.text(); // get raw response first
        let data;

        try {
            data = JSON.parse(text); // try parsing JSON
        } catch (jsonError) {
            console.warn("Not JSON:", text);
            return Swal.fire("Error", "Invalid server response", "error");
        }

        if (!response.ok) {
            return Swal.fire("Error", data.error || data.message || "Something went wrong");
        }

        Swal.fire("Success", "Department created successfully");
        document.getElementById("createDepartment").reset();

    } catch (error) {
        console.error("Fetch error:", error);
        Swal.fire("Error", "Server issue", "error");
    }
});

//get department
document.addEventListener("DOMContentLoaded", ()=> {
    const token = localStorage.getItem("token");

    if(!token) {
        window.location.href = "/login";
        return;
    }

    fetch("http://localhost:5000/departments", {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`},
    })
    .then(res => res.json()) 
    .then(data => {
        if(data.departments){
            renderDepartments(data.departments);
        } else {
            console.error("Error fetching department: No departments found");
        }
    })
    .catch(error => {
        console.error("Error fetching department: ", error);
    });


    function renderDepartments(departments) {
        const tbody = document.querySelector("tbody");
        tbody.innerHTML = ""; //clear placeholder row

        departments.forEach(dep => {
            const row = document.createElement("tr");

            row.innerHTML = `<td class="border-t py-2 px-4 text-gray-800">${dep.departmentName}</td>
                            <td class="border-t py-2 px-4 text-gray-800">
                                <button class="text-blue-500 hover:text-blue-700 text-sm font-semibold mr-2">Edit</button>
                                <button class="text-red-500 hover:text-red-700 text-sm font-semibold">Delete</button>
                            </td>`;
            tbody.appendChild(row);
        });
    }
});

