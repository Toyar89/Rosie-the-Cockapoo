const startScreen = document.getElementById("startScreen");
const incomingScreen = document.getElementById("incomingScreen");
const videoScreen = document.getElementById("videoScreen");
const endedScreen = document.getElementById("endedScreen");

const startBtn = document.getElementById("startBtn");
const testRingBtn = document.getElementById("testRingBtn");
const answerBtn = document.getElementById("answerBtn");
const declineBtn = document.getElementById("declineBtn");
const endBtn = document.getElementById("endBtn");
const replayBtn = document.getElementById("replayBtn");
const resetBtn = document.getElementById("resetBtn");

const video = document.getElementById("rosieVideo");
const ringtone = document.getElementById("ringtone");
const timer = document.getElementById("timer");
const recipientLine = document.getElementById("recipientLine");
const ringStatus = document.getElementById("ringStatus");

let interval = null;
let seconds = 0;
const ringtoneFile = "ringtone-ios.mp3";

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

async function checkRingtoneFile() {
  try {
    const response = await fetch(ringtoneFile, { cache: "no-store" });
    if (!response.ok) {
      ringStatus.textContent = `Ringtone not found: ${ringtoneFile}`;
      return false;
    }
    ringStatus.textContent = `Ringtone found: ${ringtoneFile}`;
    return true;
  } catch (error) {
    ringStatus.textContent = `Could not check ringtone file.`;
    return false;
  }
}

async function playRingtone() {
  if (!ringtone) return false;

  const exists = await checkRingtoneFile();
  if (!exists) return false;

  try {
    ringtone.pause();
    ringtone.src = ringtoneFile + "?v=" + Date.now();
    ringtone.loop = true;
    ringtone.muted = false;
    ringtone.volume = 1;
    ringtone.currentTime = 0;
    await ringtone.play();
    ringStatus.textContent = "Ringtone playing.";
    return true;
  } catch (error) {
    ringStatus.textContent = "Ringtone blocked or unsupported. Try tapping Test Ringtone again.";
    return false;
  }
}

function stopRingtone() {
  if (!ringtone) return;

  ringtone.pause();
  ringtone.currentTime = 0;
  ringtone.muted = true;
}

async function testRingtone(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  await playRingtone();

  setTimeout(() => {
    stopRingtone();
    ringStatus.textContent = "Ringtone test stopped.";
  }, 2500);
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

testRingBtn.addEventListener("pointerdown", testRingtone);
startBtn.addEventListener("pointerdown", startIncoming);
answerBtn.addEventListener("pointerdown", answerCall);
declineBtn.addEventListener("pointerdown", declineCall);
endBtn.addEventListener("pointerdown", endCall);
replayBtn.addEventListener("pointerdown", answerCall);
resetBtn.addEventListener("pointerdown", backToIncoming);

video.addEventListener("ended", endCall);
checkRingtoneFile();
