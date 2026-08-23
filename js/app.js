import { PoseLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
import { BUILD, BOOK, FIRST_DAY, PHONE, MOVES, SAMPLE, LM, vis, analyze } from "./model.js";

const $ = (id) => document.getElementById(id);
const panels = ["welcome", "details", "camera", "report"];
let step = 0;
let moveIndex = 0;
let landmarker = null;
let stream = null;
let raf = 0;
let lastVideoTime = -1;
let hold = 0;
let usingDemo = false;
const captures = {};
const historyStack = [];

function hap(ms = 12) { try { navigator.vibrate?.(ms); } catch {} }
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._x);
  toast._x = setTimeout(() => { t.hidden = true; }, 2800);
}
function show(name) {
  panels.forEach((p) => {
    const el = $(p);
    const on = p === name;
    el.hidden = !on;
    el.classList.toggle("is-hidden", !on);
  });
  $("fabBack").hidden = name === "welcome";
  $("fabBack").classList.toggle("is-hidden", name === "welcome");
  paintDots(name);
}
function paintDots(name) {
  const map = { welcome: 0, details: 1, camera: 2, report: 3 };
  $("dots").querySelectorAll("span").forEach((s, i) => s.classList.toggle("on", i === map[name]));
}

function pushHist(name) {
  historyStack.push(name);
  history.pushState({ name }, "", `#${name}`);
}

window.addEventListener("popstate", () => {
  if (historyStack.length > 1) {
    historyStack.pop();
    const prev = historyStack[historyStack.length - 1];
    if (prev === "camera") stopLoop();
    show(prev);
  } else {
    show("welcome");
  }
});

$("goDetails").onclick = () => { hap(); pushHist("details"); show("details"); };
$("goCamera").onclick = async () => {
  if (!$("consent").checked) { toast("Check the camera box first."); return; }
  if (!$("phone").value.trim()) { toast("Phone helps us hold your intro."); return; }
  hap();
  pushHist("camera");
  show("camera");
  moveIndex = 0;
  await startCamera();
};
$("useDemo").onclick = () => {
  hap();
  usingDemo = true;
  MOVES.forEach((m) => {
    captures[m.id] = { landmarks: SAMPLE[m.id], shot: null };
  });
  finishReport();
};
$("captureBtn").onclick = () => manualCapture();
$("skipMove").onclick = () => skipWithSample();
$("printBtn").onclick = () => window.print();
$("bookBtn").onclick = () => { location.href = BOOK; };
$("mapBtn").onclick = () => { location.href = FIRST_DAY; };
$("fabBack").onclick = () => history.back();

$("name").addEventListener("input", syncName);
function syncName() { $("hello").textContent = $("name").value.trim() || "friend"; }

async function startCamera() {
  $("camStatus").textContent = "Starting camera…";
  setMoveCopy();
  try {
    if (!landmarker) {
      const files = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
      );
      landmarker = await PoseLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.45,
        minPosePresenceConfidence: 0.45,
        minTrackingConfidence: 0.45
      });
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
      audio: false
    });
    const video = $("cam");
    video.srcObject = stream;
    await video.play();
    $("camStatus").textContent = "Camera on. Nothing leaves this phone.";
    loop();
  } catch (err) {
    $("camStatus").textContent = "Camera blocked. Use the demo walkthrough, or allow the camera and try again.";
    toast("Camera not available.");
  }
}

function stopLoop() {
  cancelAnimationFrame(raf);
  if (stream) stream.getTracks().forEach((t) => t.stop());
  stream = null;
}

function loop() {
  const video = $("cam");
  const canvas = $("overlay");
  const ctx = canvas.getContext("2d");
  const tick = () => {
    if (video.readyState >= 2 && landmarker) {
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const res = landmarker.detectForVideo(video, performance.now());
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pose = res.landmarks?.[0];
        if (pose) {
          drawPose(ctx, pose, canvas.width, canvas.height);
          autoHold(pose);
        } else {
          $("liveCue").textContent = "Step back until I can see you head to ankle.";
          hold = 0;
          $("holdFill").style.width = "0%";
        }
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function drawPose(ctx, pose, w, h) {
  ctx.strokeStyle = "rgba(31,111,106,0.9)";
  ctx.fillStyle = "rgba(31,111,106,0.95)";
  ctx.lineWidth = 3;
  const line = (a, b) => {
    if (!vis(pose[a]) || !vis(pose[b])) return;
    ctx.beginPath();
    ctx.moveTo(pose[a].x * w, pose[a].y * h);
    ctx.lineTo(pose[b].x * w, pose[b].y * h);
    ctx.stroke();
  };
  [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]].forEach(([a,b]) => line(a,b));
  pose.forEach((p) => {
    if (!vis(p)) return;
    ctx.beginPath();
    ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function bodyInFrame(pose) {
  return vis(pose[LM.lAnkle]) && vis(pose[LM.rAnkle]) && vis(pose[LM.lShoulder]) && vis(pose[LM.rShoulder]);
}

function autoHold(pose) {
  const move = MOVES[moveIndex];
  if (!bodyInFrame(pose)) {
    $("liveCue").textContent = "I need ankles and shoulders. Take one step back.";
    hold = 0;
    $("holdFill").style.width = "0%";
    return;
  }
  $("liveCue").textContent = move.cue + " Hold still.";
  hold += 1 / 60;
  const need = 1.25;
  $("holdFill").style.width = Math.min(100, (hold / need) * 100) + "%";
  if (hold >= need) {
    hold = 0;
    snapshot(pose);
  }
}

function snapshot(pose) {
  hap(18);
  const video = $("cam");
  const shot = document.createElement("canvas");
  shot.width = video.videoWidth || 360;
  shot.height = video.videoHeight || 480;
  shot.getContext("2d").drawImage(video, 0, 0, shot.width, shot.height);
  captures[MOVES[moveIndex].id] = {
    landmarks: pose.map((p) => ({ x: p.x, y: p.y, visibility: p.visibility ?? 1 })),
    shot: shot.toDataURL("image/jpeg", 0.7)
  };
  nextMove();
}

function manualCapture() {
  if (usingDemo) return skipWithSample();
  // take last drawn pose if any via a quick detect
  const video = $("cam");
  if (!landmarker || video.readyState < 2) { toast("Camera not ready."); return; }
  const res = landmarker.detectForVideo(video, performance.now());
  const pose = res.landmarks?.[0];
  if (!pose) { toast("I cannot see a person yet."); return; }
  snapshot(pose);
}

function skipWithSample() {
  hap();
  const id = MOVES[moveIndex].id;
  captures[id] = { landmarks: SAMPLE[id], shot: null };
  nextMove();
}

function nextMove() {
  moveIndex += 1;
  hold = 0;
  $("holdFill").style.width = "0%";
  if (moveIndex >= MOVES.length) {
    stopLoop();
    finishReport();
    return;
  }
  setMoveCopy();
}

function setMoveCopy() {
  const m = MOVES[moveIndex];
  $("moveTitle").textContent = m.title;
  $("liveCue").textContent = m.cue;
  $("moveCount").textContent = "";
}

function finishReport() {
  pushHist("report");
  show("report");
  const report = analyze(captures);
  const name = $("name").value.trim() || "friend";
  $("reportTitle").textContent = name + ", here is how we will train you";
  $("hourLine").textContent = report.hour;
  $("notes").innerHTML = report.notes.map((n) => `<p>${n}</p>`).join("");
  $("scales").innerHTML = report.scales.map((n) => `<p>• ${n}</p>`).join("");
  $("ratios").innerHTML = Object.entries(report.ratios).map(([k,v]) => `<div class="ratio"><span>${k}</span><strong>${v}</strong></div>`).join("");
  $("disclaimer").textContent = report.disclaimer;
  $("coachSign").textContent = "PRSUT Fitness · 10215 S 168th Ave, suites 204-205 · " + PHONE;
  const thumbs = $("thumbs");
  thumbs.innerHTML = "";
  MOVES.forEach((m) => {
    const img = document.createElement("img");
    img.alt = m.title;
    img.src = captures[m.id]?.shot || placeholder(m.title);
    thumbs.appendChild(img);
  });
  toast("Your map is ready.");
  const blob = {
    build: BUILD,
    name,
    phone: $("phone").value.trim(),
    email: $("email").value.trim(),
    hour: $("prefHour").value,
    report,
    when: new Date().toISOString()
  };
  localStorage.setItem("prsut-movement-last", JSON.stringify(blob));
}

function placeholder(label) {
  const c = document.createElement("canvas");
  c.width = 120; c.height = 160;
  const x = c.getContext("2d");
  x.fillStyle = "#ece6dc"; x.fillRect(0,0,120,160);
  x.fillStyle = "#1f6f6a"; x.font = "12px Georgia"; x.fillText(label.slice(0,10), 8, 80);
  return c.toDataURL();
}

function installBar() {
  const key = "prsut-move-install-v1";
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (standalone) return;
  if (localStorage.getItem(key) === "installed" && !standalone) localStorage.removeItem(key);
  if (sessionStorage.getItem("prsut-move-notnow")) return;
  setTimeout(() => $("installBanner").classList.add("show"), 900);
  $("installHow").onclick = () => toast("On iPhone: Share, then Add to Home Screen.");
  $("installLater").onclick = () => {
    sessionStorage.setItem("prsut-move-notnow", "1");
    $("installBanner").classList.remove("show");
  };
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js?v=" + BUILD).catch(() => {});
}
document.querySelector("html").dataset.build = BUILD;
$("buildStamp").textContent = BUILD;
pushHist("welcome");
show("welcome");
installBar();
