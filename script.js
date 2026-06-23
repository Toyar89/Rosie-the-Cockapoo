const incomingScreen = document.getElementById("incomingScreen");
const videoScreen = document.getElementById("videoScreen");
const endedScreen = document.getElementById("endedScreen");

const answerBtn = document.getElementById("answerBtn");
const declineBtn = document.getElementById("declineBtn");
const endBtn = document.getElementById("endBtn");
const replayBtn = document.getElementById("replayBtn");
const resetBtn = document.getElementById("resetBtn");

const video = document.getElementById("rosieVideo");
const ringtone = document.getElementById("ringtone");
const timer = document.getElementById("timer");
const recipientLine = document.getElementById("recipientLine");

let interval = null;
let seconds = 0;
let ringtoneAllowed = true;

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

async function startRingtone() {
  if (!ringtoneAllowed || !incomingScreen.classList.contains("active")) return;
  if (!ringtone || !ringtone.paused) return;

  try {
    ringtone.currentTime = 0;
    ringtone.volume = 0.65;
    await ringtone.play();
  } catch (error) {
    // Some phones block sound until a tap. That's okay.
  }
}

function stopRingtone() {
  ringtoneAllowed = false;

  if (!ringtone) return;

  ringtone.pause();
  ringtone.currentTime = 0;
  ringtone.muted = true;

  setTimeout(() => {
    if (!incomingScreen.classList.contains("active")) {
      ringtone.pause();
      ringtone.currentTime = 0;
      ringtone.muted = true;
    }
  }, 250);
}

async function answerCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  stopRingtone();
  show(videoScreen);
  startTimer();

  try {
    video.removeAttribute("controls");
    video.currentTime = 0;
    video.muted = false;
    await video.play();
  } catch (error) {
    video.setAttribute("controls", "controls");
  }
}

function endCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  stopTimer();
  stopRingtone();
  video.pause();
  show(endedScreen);
}

answerBtn.addEventListener("click", answerCall);
answerBtn.addEventListener("touchend", answerCall, { passive: false });

declineBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  stopRingtone();
  show(endedScreen);
});

declineBtn.addEventListener("touchend", (event) => {
  event.preventDefault();
  event.stopPropagation();
  stopRingtone();
  show(endedScreen);
}, { passive: false });

endBtn.addEventListener("click", endCall);
endBtn.addEventListener("touchend", endCall, { passive: false });

replayBtn.addEventListener("click", answerCall);

resetBtn.addEventListener("click", () => {
  stopTimer();
  video.pause();
  video.currentTime = 0;

  if (ringtone) {
    ringtone.muted = false;
    ringtone.currentTime = 0;
  }

  ringtoneAllowed = true;
  show(incomingScreen);
  startRingtone();
});

incomingScreen.addEventListener("click", startRingtone);
incomingScreen.addEventListener("touchstart", startRingtone, { passive: true });

video.addEventListener("ended", endCall);
