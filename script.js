const incomingScreen = document.getElementById("incomingScreen");
const videoScreen = document.getElementById("videoScreen");
const endedScreen = document.getElementById("endedScreen");

const answerBtn = document.getElementById("answerBtn");
const declineBtn = document.getElementById("declineBtn");
const endBtn = document.getElementById("endBtn");
const replayBtn = document.getElementById("replayBtn");
const resetBtn = document.getElementById("resetBtn");

const video = document.getElementById("rosieVideo");
const timer = document.getElementById("timer");
const recipientLine = document.getElementById("recipientLine");

let interval = null;
let seconds = 0;

const params = new URLSearchParams(window.location.search);
const name = params.get("name");

if (name) {
  recipientLine.textContent = `Special message for ${name}`;
  document.title = `Rosie is calling ${name}`;
}

function show(screen) {
  [incomingScreen, videoScreen, endedScreen].forEach(item => item.classList.remove("active"));
  screen.classList.add("active");
}

function formatTime(value) {
  const mins = String(Math.floor(value / 60)).padStart(2, "0");
  const secs = String(value % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function startTimer() {
  stopTimer();
  seconds = 0;
  timer.textContent = "00:00";

  interval = setInterval(() => {
    seconds += 1;
    timer.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

async function answerCall() {
  show(videoScreen);
  startTimer();

  try {
    video.currentTime = 0;
    video.muted = false;
    await video.play();
  } catch (error) {
    video.setAttribute("controls", "controls");
  }
}

function endCall() {
  stopTimer();
  video.pause();
  show(endedScreen);
}

answerBtn.addEventListener("click", answerCall);

declineBtn.addEventListener("click", () => {
  show(endedScreen);
});

endBtn.addEventListener("click", endCall);

replayBtn.addEventListener("click", answerCall);

resetBtn.addEventListener("click", () => {
  stopTimer();
  video.pause();
  video.currentTime = 0;
  show(incomingScreen);
});

video.addEventListener("ended", endCall);
