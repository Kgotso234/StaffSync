document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token"); // assume employee logged in
  // --- Populate Employee Number ---
  try {
    // Decode JWT payload (without verifying signature)
    const payloadBase64 = token.split('.')[1];
    const decoded = JSON.parse(atob(payloadBase64));
    
    if (decoded.e_number) {
      document.getElementById("employeeNumber").value = decoded.e_number;
    } else {
      console.warn("e_number not found in token payload.");
    }
  } catch (err) {
    console.error("Failed to decode token for employee number:", err);
  }
  // --- Fetch and populate leave types ---
  try {
    
     

    const res = await fetch("http://localhost:5000/leave-type", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    // const data = await res.json();
    const text = await res.text();
    //console.log("Raw Response: ", text);
    
    let data;
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error("Response was not JSON:", text);
        throw err;
    }
    if (!res.ok) {
      return Swal.fire("Error", data.error || "Could not load leave types", "error");
    }

    const dropdown = document.getElementById("leaveType");
    data.forEach(type => {
      const option = document.createElement("option");
      option.value = type._id;   // _id from DB
      option.textContent = type.name; // e.g. Annual, Sick, etc.
      dropdown.appendChild(option);
    });

  } catch (err) {
    console.error("Fetch leave-types error:", err);
    Swal.fire("Error", `Could not fetch leave types: ${err.message}`, "error");
  }
});
document.getElementById("leaveApplicationForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const leaveType = document.getElementById("leaveType");
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    
    
    let valid = true;

   
    // Reset errors
    [leaveType, startDate, endDate].forEach(field => field.classList.remove("error"));
    document.querySelectorAll(".error-message").forEach(el => el.textContent = "");

    // Validate fields
    if (!leaveType.value) {
        leaveType.classList.add("error");
        document.getElementById("leaveTypeError").textContent = "Leave type is required.";
        valid = false;
    }
    if (!startDate.value) {
        startDate.classList.add("error");
        document.getElementById("startDateError").textContent = "Start date is required.";
        valid = false;
    }
    if (!endDate.value) {
        endDate.classList.add("error");
        document.getElementById("endDateError").textContent = "End date is required.";
        valid = false;
    }

    if (!valid) return; //// Stop if missing fields

    const reason = document.getElementById("reason").value;
    const token = localStorage.getItem("token");

    if(!token) {
        window.location.href = "../login";
        return;
    }
    
    try {
        const response = await fetch("http://localhost:5000/leave/apply", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ 
                leaveTypeId: leaveType.value, 
                startDate:new Date(startDate.value), 
                endDate: new Date(endDate.value), 
                reason 
             }),
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (jsonError) {
            console.warn("Not JSON: ", text);
            return Swal.fire("Error", `Invalid server response: ${text}`, "error");
        }
        if (!response.ok) {
            return Swal.fire("Error", data.error || data.message || "Something went wrong");
        } 
        Swal.fire("Success", "Your leave request has been submitted successfully.");
        document.getElementById("leaveApplicationForm").reset();
    } catch (error) {
        console.error("submit leave error:", error);
        Swal.fire("Error", `Could not submit leave application: ${error.message}`, "error");
    }
});

