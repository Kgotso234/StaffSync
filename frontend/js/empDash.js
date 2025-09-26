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
  let workingDatesMap = new Map(); // key = date string, value = leave status class

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

      // Precompute working dates for all leaves
      workingDatesMap.clear();
      for (const leave of leaves) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const workingDates = await getWorkingDates(start, end); // your previous function
        workingDates.forEach(d => {
          const key = d.toDateString();
          const today = new Date();
          const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

          let statusClass = "";
          if (d.getTime() > todayOnly.getTime()) statusClass = "upcoming-leave";
          else if (d.getTime() === todayOnly.getTime()) statusClass = "ongoing-leave";
          else statusClass = "completed-leave";

          workingDatesMap.set(key, statusClass);
        });
      }

      renderCalendar();
    } catch (err) {
      console.error(err);
    }
  }

  async function getWorkingDates(startDate, endDate) {
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    let allHolidays = [];

    for (let year = startYear; year <= endYear; year++) {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ZA`);
      const holidays = await res.json();
      allHolidays.push(...holidays.map(h => new Date(h.date).toDateString()));
    }

    const workingDates = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      const dateStr = current.toDateString();
      if (day !== 0 && day !== 6 && !allHolidays.includes(dateStr)) {
        workingDates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return workingDates;
  }

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
          const cellDate = new Date(currentYear, currentMonth, date);
          const key = cellDate.toDateString();
          cell.textContent = date;

          if (workingDatesMap.has(key)) {
            const statusClass = workingDatesMap.get(key);
            cell.classList.add(statusClass);
            const dot = document.createElement("div");
            dot.classList.add("event-dot", statusClass + "-dot");
            cell.appendChild(dot);
          }

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
