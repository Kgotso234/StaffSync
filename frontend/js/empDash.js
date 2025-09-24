async function loadLeaveBalance () {
    const token = localStorage.getItem('token');
    const employee = JSON.parse(localStorage.getItem('employee'));

    if (!token || !employee?._id) {
        window.location.href = '../login.html';
        console.error('Token or employee ID not found in localStorage');
        return;
    }

    const response = await fetch(`http://localhost:5000/leave-balance/${employee._id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch leave balance');
        return;
    }
    const results = await response.json();
    const balances = results.balance;
    // console.log('Leave balances:', balances);

    if (!balances || balances.length === 0) {
      console.warn('No leave balance data available');
      return;
    }
   

  // Fill in the cards
  balances.forEach(balance => {
    const card = document.querySelector(`.card[data-type="${balance.leaveTypeId.name}"]`);
    if (!card) return;

    // Update values
    card.querySelector(".card-value").textContent = `${balance.remainingDays} days`;
    card.querySelector(".card-footer").innerHTML = `
      <span>Total: ${balance.allocatedDays} days</span>
      <span>Used: ${balance.takenDays} days</span>
    `;

    // Progress bar
    const progress = card.querySelector(".progress");
    if (progress) {
      const percent = (balance.takenDays / balance.allocatedDays) * 100;
      progress.style.width = `${percent}%`;
    }

    // Warning
    const warning = card.querySelector(".warning");
    if (balance.remainingDays <= 2) {
      warning.style.display = "block";
      warning.querySelector(".warning-text").textContent = `You only have ${balance.remainingDays} days left`;
    } else {
      warning.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", loadLeaveBalance);
document.addEventListener("DOMContentLoaded", async function () {
  const monthElement = document.querySelector(".calendar-month");
  const arrows = document.querySelectorAll(".arrow");
  const tableBody = document.querySelector(".upcoming-leave tbody");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let leaves = [];

  // Fetch leave data
  async function fetchLeaves() {
    const token = localStorage.getItem("token");
    const employee = JSON.parse(localStorage.getItem("employee"));
    if (!token || !employee?._id) return;

    try {
      const res = await fetch(`http://localhost:5000/leave/employee/${employee._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch leaves");
      leaves = await res.json();
      // console.log("Leaves fetched:", leaves);
      renderCalendar();
    } catch (err) {
      console.error(err);
    }
  }

  // Render calendar for current month
  function renderCalendar() {
    monthElement.textContent = `${months[currentMonth]} ${currentYear}`;
    tableBody.innerHTML = "";

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    let date = 1;

    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");

        if ((i === 0 && j < firstDay) || date > daysInMonth) {
          cell.textContent = "";
        } else {
          cell.textContent = date;
          const cellDate = new Date(currentYear, currentMonth, date);

          // Highlight leave days
          leaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);

            if (cellDate >= start && cellDate <= end) {
              const today  = new Date();
              const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const cellOnly  = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());

              let statusClass = "";

              if (cellDate > todayOnly) {
                // Future leave - Upcoming leave
                statusClass = "upcoming-leave";

              }else if (cellDate.getTime() === todayOnly.getTime()) {
                // Today's leave - Ongoing leave
                statusClass = "ongoing-leave";
              } else if (cellDate < todayOnly) {
                // Past leave - Completed leave
                statusClass = "completed-leave";
              }

              if (statusClass) {
                cell.classList.add(statusClass);
                const dot = document.createElement("div");

                dot.classList.add("event-dot", statusClass + "-dot");
                cell.appendChild(dot);
                // console.log(`Marked ${statusClass} on ${cellDate.toDateString()}`);
              }
            }
          });

          // Highlight today
          const today = new Date();
          if (
            cellDate.getDate() === today.getDate() &&
            cellDate.getMonth() === today.getMonth() &&
            cellDate.getFullYear() === today.getFullYear()
          ) {
            cell.classList.add("today");
          }

          date++;
        }

        row.appendChild(cell);
      }

      tableBody.appendChild(row);
    }
  }

  // Month navigation
  arrows.forEach(arrow => {
    arrow.addEventListener("click", () => {
      if (arrow.querySelector(".fa-chevron-left")) {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      } else {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      }
      renderCalendar();
    });
  });

  await fetchLeaves();
});
