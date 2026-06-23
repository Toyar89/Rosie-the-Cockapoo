const incomingScreen=document.getElementById('incomingScreen');
const videoScreen=document.getElementById('videoScreen');
const endedScreen=document.getElementById('endedScreen');

const answerBtn=document.getElementById('answerBtn');
const declineBtn=document.getElementById('declineBtn');
const endBtn=document.getElementById('endBtn');
const replayBtn=document.getElementById('replayBtn');
const resetBtn=document.getElementById('resetBtn');

const video=document.getElementById('rosieVideo');
const ringtone=document.getElementById('ringtone');
const timer=document.getElementById('timer');
const recipientLine=document.getElementById('recipientLine');

let interval;
let seconds=0;
let ringtoneEnabled=true;

const params=new URLSearchParams(window.location.search);
const name=params.get('name');
if(name){
  recipientLine.textContent=`Special message for ${name}`;
}

function show(screen){
  [incomingScreen,videoScreen,endedScreen].forEach(s=>s.classList.remove('active'));
  screen.classList.add('active');
}

function startTimer(){
  clearInterval(interval);
  seconds=0;
  timer.textContent='00:00';
  interval=setInterval(()=>{
    seconds++;
    const m=String(Math.floor(seconds/60)).padStart(2,'0');
    const s=String(seconds%60).padStart(2,'0');
    timer.textContent=`${m}:${s}`;
  },1000);
}

function stopRingtone(){
  ringtoneEnabled=false;
  ringtone.pause();
  ringtone.currentTime=0;
}

async function startRingtone(){
  if(!ringtoneEnabled) return;
  try{
    ringtone.volume=0.65;
    await ringtone.play();
  }catch(e){}
}

async function answerCall(e){
  if(e){e.preventDefault();e.stopPropagation();}
  stopRingtone();
  show(videoScreen);
  startTimer();
  try{
    video.currentTime=0;
    await video.play();
  }catch(e){}
}

function endCall(e){
  if(e){e.preventDefault();e.stopPropagation();}
  clearInterval(interval);
  stopRingtone();
  video.pause();
  show(endedScreen);
}

function declineCall(e){
  if(e){e.preventDefault();e.stopPropagation();}
  stopRingtone();
  show(endedScreen);
}

answerBtn.addEventListener('pointerdown',answerCall);
declineBtn.addEventListener('pointerdown',declineCall);
endBtn.addEventListener('pointerdown',endCall);
replayBtn.addEventListener('pointerdown',answerCall);

resetBtn.addEventListener('pointerdown',(e)=>{
  e.preventDefault();
  clearInterval(interval);
  video.pause();
  video.currentTime=0;
  ringtoneEnabled=true;
  ringtone.load();
  show(incomingScreen);
  startRingtone();
});

window.addEventListener('load',startRingtone);
video.addEventListener('ended',endCall);
