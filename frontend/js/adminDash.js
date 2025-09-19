document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login"; // redirect if not logged in
            return;
        }

        const res = await fetch("http://localhost:5000/dashboard/stats", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            document.getElementById("total-team-members").textContent = data.totalEmployees;
            document.getElementById("employees-on-leave").textContent = data.employeesOnLeave;
            document.getElementById("manager-pending-requests").textContent = data.pendingRequests;
        } else {
            console.error("Error fetching dashboard stats:", data.error);
        }
    } catch (err) {
        console.error("Error:", err);
    }
});

async function loadLeaveUsage() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/login"; // redirect if not logged in
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/report/leave-usage",{
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }); 
        const data = await res.json();
        // console.log("Leave usage data:", data); // check response

        if (data.success && Array.isArray(data.usage)) {
            const container = document.getElementById("leave-usage-container");
            container.innerHTML = "";

            data.usage.forEach(type => {
                const color = type.name === "Annual" ? "bg-indigo-600"
                            : type.name === "Sick" ? "bg-green-500"
                            : type.name === "Maternity" ? "bg-amber-500"
                            : "bg-blue-500";

                container.innerHTML += `
                    <div class="flex-1">
                        <div class="progress-bar bg-gray-200 h-2 rounded">
                            <div class="${color} h-2 rounded" style="width: ${type.percentage}%"></div>
                        </div>
                        <div class="flex justify-between mt-1">
                            <span class="text-xs text-gray-500">${type.name}</span>
                            <span class="text-xs font-medium text-gray-700">${type.percentage}%</span>
                        </div>
                    </div>
                `;
            });
        } else {
            console.error("Unexpected response format:", data);
        }
    } catch (err) {
        console.error("Error loading leave usage:", err);
    }
}

loadLeaveUsage();

async function loadDashboardStats() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:5000/report/dashboard-stats", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (!data.success) {
            console.error("Failed:", data.message);
            return;
        }

        // Low balance employees
        const lowBalanceDiv = document.getElementById("low-balance");
        lowBalanceDiv.innerHTML = `
            <h3 class="text-sm font-medium text-gray-700 mb-2">Employees with Low Balances</h3>
            <ul class="text-sm text-gray-600 space-y-1">
                ${data.lowBalanceEmployees.map(emp => `
                    <li class="flex justify-between">
                        <span>${emp.name}</span>
                        <span class="text-red-500 font-medium">${emp.remainingDays} days left</span>
                    </li>
                `).join("")}
            </ul>
        `;

        // Upcoming leaves
        const upcomingDiv = document.getElementById("upcoming-leaves");
        upcomingDiv.innerHTML = `
            <h3 class="text-sm font-medium text-gray-700 mb-2">Upcoming Approved Leaves (Next 7 Days)</h3>
            <ul class="text-sm text-gray-600 space-y-1">
                ${data.upcomingLeaves.map(l => `
                    <li class="flex justify-between">
                        <span>${l.name}</span>
                        <span>${new Date(l.startDate).toLocaleDateString()} - ${new Date(l.endDate).toLocaleDateString()}</span>
                    </li>
                `).join("")}
            </ul>
        `;
    } catch (err) {
        console.error("Error loading dashboard stats:", err);
    }
}

loadDashboardStats();

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return window.location.href = "/login";

  const latestTbody = document.querySelector("#latest-leaves-tbody");
  // const availabilityTbody = document.querySelector("#availability-tbody");

  // Fetch Latest 5
  try {
    const res = await fetch("http://localhost:5000/admin/leaves/latest", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { leaves } = await res.json();

    latestTbody.innerHTML = "";
    leaves.forEach(leave => {
      const emp = leave.employeeId;
      const name = `${emp?.e_fname} ${emp?.e_lname}`;
      const initials = (emp?.e_fname?.[0] || "") + (emp?.e_lname?.[0] || "");
      const type = leave.leaveTypeId?.name || "N/A";
      const status = leave.status || "N/A";
      const range = `${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}`;
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000*60*60*24)) + 1;

      let statusClass = "text-yellow-600"; 
      if (leave.status === "Approved") statusClass = "text-green-600";
      if (leave.status === "Rejected") statusClass = "text-red-600";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-6 py-4 flex items-center">
          <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span class="text-indigo-800 font-medium text-sm">${initials}</span>
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${name}</div>
          </div>
        </td>
        <td class="px-6 py-4 text-sm">${type}</td>
        <td class="px-6 py-4 text-sm">${range}</td>
        <td class="px-6 py-4 text-sm">${days}</td>
        <td class="px-6 py-4 text-sm">${leave.reason || "-"}</td>
        <td class="px-6 py-4 text-sm" ${statusClass}>${status}</td>
      `;
      latestTbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching latest leaves", err);
  }

  // Fetch Team Availability (this week)
  // try {
  //   const start = new Date();
  //   const end = new Date();
  //   end.setDate(start.getDate() + 4);

  //   const res = await fetch(`http://localhost:5000/admin/leaves/availability?start=${start}&end=${end}`, {
  //     headers: { Authorization: `Bearer ${token}` }
  //   });
  //   const { leaves } = await res.json();

  //   // Build a map { employeeId: { mon: true, tue: false... } }
  //   const employees = {};
  //   leaves.forEach(leave => {
  //     const emp = leave.employeeId;
  //     if (!employees[emp._id]) {
  //       employees[emp._id] = { name: `${emp.e_fname} ${emp.e_lname}`, days: {} };
  //     }
  //     let d = new Date(leave.startDate);
  //     const endDate = new Date(leave.endDate);
  //     while (d <= endDate) {
  //       const weekday = d.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  //       employees[emp._id].days[weekday] = "leave";
  //       d.setDate(d.getDate() + 1);
  //     }
  //   });

  //   availabilityTbody.innerHTML = "";
  //   Object.values(employees).forEach(emp => {
  //     const initials = emp.name.split(" ").map(n => n[0]).join("");
  //     const tr = document.createElement("tr");
  //     tr.innerHTML = `
  //       <td class="px-6 py-4 flex items-center">
  //         <div class="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
  //           <span class="text-indigo-800 font-medium text-sm">${initials}</span>
  //         </div>
  //         <div class="ml-4">
  //           <div class="text-sm font-medium text-gray-900">${emp.name}</div>
  //         </div>
  //       </td>
  //       ${["mon","tue","wed","thu","fri"].map(day => `
  //         <td class="px-6 py-4">
  //           <div class="h-6 w-6 rounded-full ${emp.days[day]==="leave" ? "bg-red-100" : "bg-green-100"} mx-auto"></div>
  //         </td>
  //       `).join("")}
  //     `;
  //     availabilityTbody.appendChild(tr);
  //   });
  // } catch (err) {
  //   console.error("Error fetching availability", err);
  // }
});
