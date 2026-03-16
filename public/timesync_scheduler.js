const miniCalendarDays = document.getElementById("miniCalendarDays");
const miniCalendarTitle = document.getElementById("miniCalendarTitle");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const todayBtn = document.getElementById("todayBtn");
const weekTitle = document.getElementById("weekTitle");
const scheduleGrid = document.getElementById("scheduleGrid");

let currentDate = new Date(2026, 2, 13); // March 13, 2026

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeSlots = [
  "05:30am", "06:00am", "06:30am",
  "07:00am", "07:30am", "08:00am", "08:30am",
  "04:30pm", "05:00pm", "05:30pm",
  "08:00pm", "08:30pm", "09:00pm", "09:30pm", "10:00pm", "10:30pm", "11:00pm", "11:30pm", "12:00am"
];

const classes = [
  { day: 1, time: "07:00am", name: "차지정", color: "color-blue" },
  { day: 1, time: "07:30am", name: "차지정", color: "color-blue" },
  { day: 1, time: "08:00am", name: "차지정", color: "color-blue" },
  { day: 1, time: "04:30pm", name: "Joel", color: "color-green" },
  { day: 1, time: "05:00pm", name: "Joel", color: "color-green" },
  { day: 1, time: "08:00pm", name: "Woo", color: "color-yellow" },
  { day: 1, time: "08:30pm", name: "Woo", color: "color-yellow" },
  { day: 1, time: "09:30pm", name: "Senrena", color: "color-purple" },
  { day: 1, time: "10:00pm", name: "Senrena", color: "color-purple" }
];

function convertETtoKST(etTime) {
  const [time, meridiem] = [etTime.slice(0, -2), etTime.slice(-2)];
  let [hour, minute] = time.split(":").map(Number);

  if (meridiem === "pm" && hour !== 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;

  const kstHour24 = (hour + 13) % 24;
  const kstMeridiem = kstHour24 >= 12 ? "pm" : "am";
  let displayHour = kstHour24 % 12;
  if (displayHour === 0) displayHour = 12;

  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}${kstMeridiem} KST`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekTitle(weekStart) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startMonth = monthNames[weekStart.getMonth()];
  const endMonth = monthNames[weekEnd.getMonth()];

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }

  return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
}

function renderMiniCalendar(year, month, selectedDate) {
  miniCalendarDays.innerHTML = "";
  miniCalendarTitle.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < firstDay; i++) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "mini-day empty";
    miniCalendarDays.appendChild(emptyBox);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayBox = document.createElement("div");
    dayBox.className = "mini-day";
    dayBox.textContent = day;

    if (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    ) {
      dayBox.classList.add("today");
    }

    if (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    ) {
      dayBox.classList.add("selected");
    }

    dayBox.addEventListener("click", () => {
      currentDate = new Date(year, month, day);
      renderAll();
    });

    miniCalendarDays.appendChild(dayBox);
  }
}

function renderWeekHeaders(weekStart) {
  const today = new Date();
  const dayHeaders = document.querySelectorAll(".day-header");

  dayHeaders.forEach((header, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    header.querySelector(".header-day").textContent = dayNames[date.getDay()];
    header.querySelector(".header-date").textContent = `(${date.getDate()})`;

    header.classList.remove("today-col");

    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      header.classList.add("today-col");
    }
  });

  weekTitle.textContent = formatWeekTitle(weekStart);
}

function buildScheduleGrid() {
  while (scheduleGrid.children.length > 8) {
    scheduleGrid.removeChild(scheduleGrid.lastChild);
  }

  timeSlots.forEach((time) => {
    const timeCell = document.createElement("div");
    timeCell.className = "grid-cell time-label";
    timeCell.innerHTML = `
      <div>${time}</div>
      <div class="kst-time">${convertETtoKST(time)}</div>
    `;
    scheduleGrid.appendChild(timeCell);

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const match = classes.find(c => c.day === dayIndex && c.time === time);
      const cell = document.createElement("div");

      if (match) {
        cell.className = `grid-cell task-cell ${match.color}`;
        cell.textContent = match.name;
      } else {
        cell.className = "grid-cell";
      }

      scheduleGrid.appendChild(cell);
    }
  });
}

function renderAll() {
  const weekStart = getWeekStart(currentDate);
  renderMiniCalendar(currentDate.getFullYear(), currentDate.getMonth(), currentDate);
  renderWeekHeaders(weekStart);
  buildScheduleGrid();
}

prevMonthBtn.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  renderAll();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  renderAll();
});

prevWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() - 7);
  renderAll();
});

nextWeekBtn.addEventListener("click", () => {
  currentDate.setDate(currentDate.getDate() + 7);
  renderAll();
});

todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  renderAll();
});

renderAll();