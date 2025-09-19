(() => {
  // Get token from localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found. Please log in first.");
  }

  const notifBtn = document.getElementById("notification-btn");
  const notifDropdown = document.getElementById("notification-dropdown");
  const notifList = document.getElementById("notification-list");
  const notifCount = document.getElementById("notification-count");
  const clearAllBtn = document.getElementById("clear-all");
  const filterUnreadBtn = document.getElementById("filter-unread");
  const filterAllBtn = document.getElementById("filter-all");

  if (!notifBtn || !notifDropdown || !notifList || !notifCount) {
    console.error("Notification elements not found in DOM.");
    return; 
  }

  let notifications = [];
  const employee = JSON.parse(localStorage.getItem("employee"));

  // --- Socket.io Setup ---
  const socket = io("http://localhost:5000", { auth: { token }, transports: ["websocket"] });
  
  socket.on("connect", () => {
    // console.log("Connected to socket server:", socket.id);
    if (employee?._id) {
      socket.emit("JoinCompanyRoom", employee._id);
      // console.log("Joined company room:", company._id);
    }
  });

  socket.on("newNotification", (notif) => {
    // console.log("Received new notification:", notif);
    notifications.unshift(notif);
    renderNotifications(notifications);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  // --- Functions ---
  function renderNotifications(list) {
    try {
      notifList.innerHTML = "";

      if (list.length === 0) {
        notifList.innerHTML = `<li class="p-4 text-gray-500 text-sm">No notifications</li>`;
      } else {
        list.forEach((n) => {
          const li = document.createElement("li");
          li.className = `px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
            n.isRead ? "text-gray-500" : "font-semibold"
          }`;
          li.textContent = n.message;

          // Mark as read on click
          li.addEventListener("click", async () => {
            try {
              const res = await fetch(`http://localhost:5000/notifications/${n._id}/read`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` },
              });
              if (!res.ok) throw new Error("Failed to mark as read");
              n.isRead = true;
              renderNotifications(notifications);
            } catch (err) {
              console.error("Error marking notification as read:", err);
            }
          });

          notifList.appendChild(li);
        });
      }

      // Update badge
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      if (unreadCount > 0) {
        notifCount.textContent = unreadCount;
        notifCount.classList.remove("hidden");
      } else {
        notifCount.classList.add("hidden");
      }
    } catch (err) {
      console.error("Error rendering notifications:", err);
    }
  }

  async function loadNotifications() {
    try {
      const res = await fetch(`http://localhost:5000/notifications/get-notifications`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.statusText}`);
      notifications = await res.json();
      renderNotifications(notifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  }

  async function clearAllNotifications() {
    try {
      const res = await fetch(`http://localhost:5000/notifications/clear`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to clear notifications");
      notifications = [];
      renderNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  }

  // --- Event Listeners ---
  notifBtn.addEventListener("click", () => notifDropdown.classList.toggle("hidden"));
  clearAllBtn.addEventListener("click", clearAllNotifications);
  filterUnreadBtn.addEventListener("click", () => renderNotifications(notifications.filter(n => !n.isRead)));
  filterAllBtn.addEventListener("click", () => renderNotifications(notifications));

  // --- Init ---
  loadNotifications();
})();
