const startScreen = document.getElementById("startScreen");
const incomingScreen = document.getElementById("incomingScreen");
const videoScreen = document.getElementById("videoScreen");
const endedScreen = document.getElementById("endedScreen");

const startBtn = document.getElementById("startBtn");
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

const params = new URLSearchParams(window.location.search);
const name = params.get("name");

if (name) {
  recipientLine.textContent = `Special message for ${name}`;
  document.title = `Rosie is calling ${name}`;
}

function show(screen) {
  [startScreen, incomingScreen, videoScreen, endedScreen].forEach(item => item.classList.remove("active"));
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

async function playRingtone() {
  if (!ringtone) return;

  try {
    ringtone.pause();
    ringtone.src = "ringtone-ios.mp3?v=" + Date.now();
    ringtone.loop = true;
    ringtone.muted = false;
    ringtone.volume = 1;
    ringtone.currentTime = 0;
    await ringtone.play();
  } catch (error) {
    console.log("Ringtone could not play. Check ringtone-ios.mp3 is uploaded.");
  }
}

function stopRingtone() {
  if (!ringtone) return;

  ringtone.pause();
  ringtone.currentTime = 0;
  ringtone.muted = true;
}

async function startIncoming(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  show(incomingScreen);
  await playRingtone();
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

function declineCall(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  stopRingtone();
  show(endedScreen);
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

function backToIncoming(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  stopTimer();
  stopRingtone();
  video.pause();
  video.currentTime = 0;
  show(incomingScreen);
  playRingtone();
}

startBtn.addEventListener("pointerdown", startIncoming);
answerBtn.addEventListener("pointerdown", answerCall);
declineBtn.addEventListener("pointerdown", declineCall);
endBtn.addEventListener("pointerdown", endCall);
replayBtn.addEventListener("pointerdown", answerCall);
resetBtn.addEventListener("pointerdown", backToIncoming);

video.addEventListener("ended", endCall);
