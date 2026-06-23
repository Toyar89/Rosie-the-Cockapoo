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
let callAnswered = false;

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
  if (!ringtone || callAnswered) return;
  if (!incomingScreen.classList.contains("active")) return;

  try {
    ringtone.muted = false;
    ringtone.volume = 0.65;
    ringtone.currentTime = 0;
    await ringtone.play();
  } catch (error) {
    // Many mobile browsers block audio before interaction.
    // This is normal and safer than letting it start during the video.
  }
}

function hardStopRingtone() {
  callAnswered = true;

  if (!ringtone) return;

  ringtone.pause();
  ringtone.muted = true;
  ringtone.volume = 0;

  try {
    ringtone.currentTime = 0;
  } catch (error) {}

  ringtone.removeAttribute("src");
  ringtone.load();
}

async function answerCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  hardStopRingtone();

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

function declineCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  hardStopRingtone();
  show(endedScreen);
}

function endCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  stopTimer();
  hardStopRingtone();
  video.pause();
  show(endedScreen);
}

answerBtn.addEventListener("pointerdown", answerCall);
declineBtn.addEventListener("pointerdown", declineCall);
endBtn.addEventListener("pointerdown", endCall);

replayBtn.addEventListener("pointerdown", answerCall);

resetBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();

  stopTimer();
  video.pause();
  video.currentTime = 0;

  // Rebuild the ringtone only when returning to the incoming screen.
  if (ringtone) {
    ringtone.src = "ringtone-ios.mp3";
    ringtone.loop = true;
    ringtone.muted = false;
    ringtone.volume = 0.65;
  }

  callAnswered = false;
  show(incomingScreen);
  startRingtone();
});

// Important:
// No click/touch listener on the incoming screen.
// That was causing the ringtone to start when tapping Answer.

window.addEventListener("load", startRingtone);

video.addEventListener("ended", endCall);
