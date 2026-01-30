/* -------------------------
   PAGE NAVIGATION
--------------------------*/
const navButtons = document.querySelectorAll(".nav button");
const pages = document.querySelectorAll(".page");

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const target = btn.dataset.page;
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

/* -------------------------
   MORNING CLASSROOM
--------------------------*/
const sceneLayers = {
  sunrise: document.getElementById("sceneSunrise"),
  forest: document.getElementById("sceneForest"),
  flowers: document.getElementById("sceneFlowers"),
  calm: document.getElementById("sceneCalm")
};

const sceneChips = document.querySelectorAll(".scene-chip");

function setScene(scene) {
  Object.values(sceneLayers).forEach(l => l.classList.remove("active"));
  sceneLayers[scene].classList.add("active");

  sceneChips.forEach(c => c.classList.remove("active"));
  document.querySelector(`.scene-chip[data-scene="${scene}"]`).classList.add("active");
}

sceneChips.forEach(chip => {
  chip.addEventListener("click", () => setScene(chip.dataset.scene));
});

// Fullscreen for scene only
const morningScene = document.getElementById("morningScene");
const morningFullscreenBtn = document.getElementById("morningFullscreenBtn");

morningFullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    morningScene.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/* -------------------------
   LOCAL STORAGE
--------------------------*/
const STORAGE_KEY = "classroom_app_v3";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState() {
  const state = {
    students,
    rewardTarget,
    extraRewardTarget,
    morningFocus: morningFocus.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setupStatus.textContent = "Saved!";
  setTimeout(() => (setupStatus.textContent = ""), 1500);
}

/* -------------------------
   SETUP PAGE
--------------------------*/
let students = [];
let rewardTarget = 50;
let extraRewardTarget = 100;

const setupStudentNameInput = document.getElementById("setupStudentNameInput");
const setupAddStudentBtn = document.getElementById("setupAddStudentBtn");
const setupStudentList = document.getElementById("setupStudentList");
const rewardTargetInput = document.getElementById("rewardTargetInput");
const extraRewardTargetInput = document.getElementById("extraRewardTargetInput");
const saveSetupBtn = document.getElementById("saveSetupBtn");
const setupStatus = document.getElementById("setupStatus");
const morningFocus = document.getElementById("morningFocus");

function renderSetupStudents() {
  setupStudentList.innerHTML = "";
  students.forEach((s, index) => {
    const row = document.createElement("div");
    row.className = "setup-student-row";

    const name = document.createElement("div");
    name.textContent = s.name;

    const removeBtn = document.createElement("button");
    removeBtn.className = "secondary";
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      students.splice(index, 1);
      renderSetupStudents();
      renderStudents();
      saveState();
    };

    row.appendChild(name);
    row.appendChild(removeBtn);
    setupStudentList.appendChild(row);
  });
}

setupAddStudentBtn.addEventListener("click", () => {
  const name = setupStudentNameInput.value.trim();
  if (!name) return;
  students.push({ name, points: 0, level: "FULL TIME" });
  setupStudentNameInput.value = "";
  renderSetupStudents();
  renderStudents();
  saveState();
});

setupStudentNameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") setupAddStudentBtn.click();
});

saveSetupBtn.addEventListener("click", () => {
  rewardTarget = parseInt(rewardTargetInput.value) || 50;
  extraRewardTarget = parseInt(extraRewardTargetInput.value) || 100;
  updateRewards();
  saveState();
});

/* -------------------------
   CLASSROOM — BEHAVIOUR
--------------------------*/
const studentListEl = document.getElementById("studentList");
const studentNameInput = document.getElementById("studentNameInput");
const addStudentBtn = document.getElementById("addStudentBtn");
const clearStudentsBtn = document.getElementById("clearStudentsBtn");
const totalPointsEl = document.getElementById("totalPoints");

const behaviourLevels = ["FULL TIME", "20min", "15min", "10min", "5min", "NONE"];

function renderStudents() {
  studentListEl.innerHTML = "";
  let totalPoints = 0;

  students.forEach((s, index) => {
    totalPoints += s.points;

    const row = document.createElement("div");
    row.className = "student";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="student-name">${s.name}</div>
      <span class="badge ${s.points >= 0 ? "good" : "warning"}">
        ${s.points >= 0 ? "On track" : "Reminder"}
      </span>
      <span class="badge points">${s.points} pts</span>
    `;

    const levelSelect = document.createElement("select");
    behaviourLevels.forEach(l => {
      const opt = document.createElement("option");
      opt.value = l;
      opt.textContent = l;
      if (s.level === l) opt.selected = true;
      levelSelect.appendChild(opt);
    });
    levelSelect.onchange = () => {
      students[index].level = levelSelect.value;
      saveState();
    };
    left.appendChild(levelSelect);

    const right = document.createElement("div");
    right.className = "student-actions";

    const minusBtn = document.createElement("button");
    minusBtn.className = "secondary";
    minusBtn.textContent = "-1";
    minusBtn.onclick = () => {
      students[index].points--;
      renderStudents();
      updateRewards();
      saveState();
    };

    const plusBtn = document.createElement("button");
    plusBtn.className = "success";
    plusBtn.textContent = "+1";
    plusBtn.onclick = () => {
      students[index].points++;
      renderStudents();
      updateRewards();
      saveState();
    };

    const resetBtn = document.createElement("button");
    resetBtn.className = "secondary";
    resetBtn.textContent = "0";
    resetBtn.onclick = () => {
      students[index].points = 0;
      renderStudents();
      updateRewards();
      saveState();
    };

    right.appendChild(minusBtn);
    right.appendChild(plusBtn);
    right.appendChild(resetBtn);

    row.appendChild(left);
    row.appendChild(right);
    studentListEl.appendChild(row);
  });

  totalPointsEl.textContent = totalPoints;
  updateRewards();
}

addStudentBtn.addEventListener("click", () => {
  const name = studentNameInput.value.trim();
  if (!name) return;
  students.push({ name, points: 0, level: "FULL TIME" });
  studentNameInput.value = "";
  renderSetupStudents();
  renderStudents();
  saveState();
});

studentNameInput.addEventListener("keydown", e => {
  if (e.key === "Enter") addStudentBtn.click();
});

clearStudentsBtn.addEventListener("click", () => {
  if (!confirm("Clear all students?")) return;
  students = [];
  renderSetupStudents();
  renderStudents();
  saveState();
});

/* -------------------------
   TIMERS
--------------------------*/
const timers = {
  focus: { remaining: 600, default: 600, interval: null },
  transition: { remaining: 120, default: 120, interval: null }
};

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function updateTimerDisplay(id) {
  document.getElementById(`timer-${id}`).textContent = formatTime(timers[id].remaining);
}

function startTimer(id) {
  if (timers[id].interval) return;
  timers[id].interval = setInterval(() => {
    timers[id].remaining--;
    if (timers[id].remaining <= 0) {
      timers[id].remaining = 0;
      clearInterval(timers[id].interval);
      timers[id].interval = null;
      alert(`${id} timer finished!`);
    }
    updateTimerDisplay(id);
  }, 1000);
}

function pauseTimer(id) {
  clearInterval(timers[id].interval);
  timers[id].interval = null;
}

function resetTimer(id) {
  pauseTimer(id);
  timers[id].remaining = timers[id].default;
  updateTimerDisplay(id);
}

document.querySelectorAll(".timer-buttons button").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const target = btn.dataset.target;
    if (action === "start") startTimer(target);
    if (action === "pause") pauseTimer(target);
    if (action === "reset") resetTimer(target);
  });
});

Object.keys(timers).forEach(updateTimerDisplay);

/* -------------------------
   READING & REWARDS
--------------------------*/
let readingEntries = [];

const readingStudentInput = document.getElementById("readingStudentInput");
const readingMinutesInput = document.getElementById("readingMinutesInput");
const addReadingBtn = document.getElementById("addReadingBtn");
const readingLogEl = document.getElementById("readingLog");
const totalMinutesEl = document.getElementById("totalMinutes");
const rewardFillEl = document.getElementById("rewardFill");
const extraRewardFillEl = document.getElementById("extraRewardFill");
const rewardTargetLabelEl = document.getElementById("rewardTargetLabel");
const extraRewardTargetLabelEl = document.getElementById("extraRewardTargetLabel");

function renderReadingLog() {
  readingLogEl.innerHTML = "";
  let totalMinutes = 0;

  readingEntries.forEach(entry => {
    totalMinutes += entry.minutes;

    const row = document.createElement("div");
    row.className = "reading-entry";
    row.textContent = `${entry.student || "Class"} • ${entry.minutes} min`;

    readingLogEl.appendChild(row);
  });

  totalMinutesEl.textContent = totalMinutes;
}

function updateRewards() {
  const totalPoints = students.reduce((sum, s) => sum + s.points, 0);

  rewardTargetLabelEl.textContent = rewardTarget;
  extraRewardTargetLabelEl.textContent = extraRewardTarget;

  rewardFillEl.style.width = `${Math.min(100, (totalPoints / rewardTarget) * 100)}%`;
  extraRewardFillEl.style.width = `${Math.min(100, (totalPoints / extraRewardTarget) * 100)}%`;
}

addReadingBtn.addEventListener("click", () => {
  const minutes = parseInt(readingMinutesInput.value);
  if (!minutes) return;

  readingEntries.unshift({
    student: readingStudentInput.value.trim(),
    minutes
  });

  readingStudentInput.value = "";
  readingMinutesInput.value = "";

  renderReadingLog();
});

/* -------------------------
   WHITEBOARD
--------------------------*/
const wbCanvas = document.getElementById("whiteboardCanvas");
const wbCtx = wbCanvas.getContext("2d");
const wbColor = document.getElementById("wbColor");
const wbSize = document.getElementById("wbSize");
const wbClearBtn = document.getElementById("wbClearBtn");
const wbFullscreenBtn = document.getElementById("wbFullscreenBtn");
const wbEraserBtn = document.getElementById("wbEraserBtn");

let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
  const rect = wbCanvas.getBoundingClientRect();
  wbCanvas.width = rect.width * window.devicePixelRatio;
  wbCanvas.height = rect.height * window.devicePixelRatio;
  wbCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  wbCtx.lineCap = "round";
  wbCtx.lineJoin = "round";
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function getPos(e) {
  const rect = wbCanvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDraw(e) {
  drawing = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(e) {
  if (!drawing) return;
  const pos = getPos(e);

  wbCtx.strokeStyle = erasing ? "#ffffff" : wbColor.value;
  wbCtx.lineWidth = wbSize.value;

  wbCtx.beginPath();
  wbCtx.moveTo(lastX, lastY);
  wbCtx.lineTo(pos.x, pos.y);
  wbCtx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

function endDraw() {
  drawing = false;
}

wbCanvas.addEventListener("mousedown", startDraw);
wbCanvas.addEventListener("mousemove", draw);
wbCanvas.addEventListener("mouseup", endDraw);
wbCanvas.addEventListener("mouseleave", endDraw);

wbCanvas.addEventListener("touchstart", startDraw, { passive: false });
wbCanvas.addEventListener("touchmove", draw, { passive: false });
wbCanvas.addEventListener("touchend", endDraw);

wbClearBtn.addEventListener("click", () => {
  wbCtx.clearRect(0, 0, wbCanvas.width, wbCanvas.height);
});

wbEraserBtn.addEventListener("click", () => {
  erasing = !erasing;
  wbEraserBtn.textContent = erasing ? "Pen" : "Eraser";
});

wbFullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    wbCanvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

/* -------------------------
   APPS PAGE
--------------------------*/
document.querySelectorAll(".app-tile").forEach(tile => {
  tile.addEventListener("click", () => {
    window.open(tile.dataset.url, "_blank");
  });
});

/* -------------------------
   LOAD SAVED STATE
--------------------------*/
const saved = loadState();
if (saved) {
  students = saved.students || [];
  rewardTarget = saved.rewardTarget || 50;
  extraRewardTarget = saved.extraRewardTarget || 100;
  morningFocus.value = saved.morningFocus || "";
}

renderSetupStudents();
renderStudents();
renderReadingLog();
updateRewards();

// Default scene
setScene("sunrise");
