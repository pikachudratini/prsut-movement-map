const BUILD = "20260823-1412";
const BOOK = "https://www.prsutfitness.com/get-started";
const FIRST_DAY = "https://luckyduck.cc/prsut-first-day/";
const PHONE = "402-630-3608";

const LM = {
  nose: 0, lShoulder: 11, rShoulder: 12, lElbow: 13, rElbow: 14,
  lWrist: 15, rWrist: 16, lHip: 23, rHip: 24, lKnee: 25, rKnee: 26,
  lAnkle: 27, rAnkle: 28
};

const MOVES = [
  { id: "stand", title: "Stand tall", cue: "Face the camera. Whole body in the frame. Ankles visible." },
  { id: "squat", title: "Squat to a sit", cue: "Turn sideways. Sit to a chair height, then stand. Hold the bottom for a beat." },
  { id: "hinge", title: "Hip hinge", cue: "Still sideways. Soft knees. Push the hips back as if closing a car door." },
  { id: "overhead", title: "Arms overhead", cue: "Face the camera. Reach both arms up. Ribs stay quiet." },
  { id: "sitstand", title: "Sit to stand", cue: "Sit, then stand without using your hands if you can." }
];

const SAMPLE = {
  stand: sampleStand(),
  squat: sampleSquat(),
  hinge: sampleHinge(),
  overhead: sampleOverhead(),
  sitstand: sampleSit()
};

function sampleStand() {
  return fakePose({ hipY: 0.52, kneeY: 0.72, ankleY: 0.92, kneeXoff: 0, wristY: 0.48, elbowY: 0.42 });
}
function sampleSquat() {
  return fakePose({ hipY: 0.68, kneeY: 0.74, ankleY: 0.92, kneeXoff: 0.01, wristY: 0.55, elbowY: 0.5 });
}
function sampleHinge() {
  return fakePose({ hipY: 0.58, kneeY: 0.74, ankleY: 0.92, kneeXoff: 0, wristY: 0.62, elbowY: 0.5, shoulderY: 0.28 });
}
function sampleOverhead() {
  return fakePose({ hipY: 0.52, kneeY: 0.72, ankleY: 0.92, wristY: 0.08, elbowY: 0.18 });
}
function sampleSit() {
  return fakePose({ hipY: 0.70, kneeY: 0.74, ankleY: 0.92, kneeXoff: 0, wristY: 0.58, elbowY: 0.5 });
}

function fakePose(p) {
  const pts = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  const set = (i, x, y) => { pts[i] = { x, y, visibility: 0.96 }; };
  const sy = p.shoulderY ?? 0.22;
  set(LM.lShoulder, 0.44, sy); set(LM.rShoulder, 0.56, sy);
  set(LM.lElbow, 0.40, p.elbowY); set(LM.rElbow, 0.60, p.elbowY);
  set(LM.lWrist, 0.38, p.wristY); set(LM.rWrist, 0.62, p.wristY);
  set(LM.lHip, 0.46, p.hipY); set(LM.rHip, 0.54, p.hipY);
  set(LM.lKnee, 0.46 + p.kneeXoff, p.kneeY); set(LM.rKnee, 0.54 + p.kneeXoff, p.kneeY);
  set(LM.lAnkle, 0.46, p.ankleY); set(LM.rAnkle, 0.54, p.ankleY);
  set(LM.nose, 0.50, 0.12);
  return pts;
}

function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(a.visibility || 1, b.visibility || 1) }; }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function ang(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };
  const d = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (!d) return 180;
  const cos = Math.max(-1, Math.min(1, (v1.x * v2.x + v1.y * v2.y) / d));
  return Math.acos(cos) * 180 / Math.PI;
}
function vis(p) { return (p?.visibility ?? 1) > 0.45; }

function side(pts, keyL, keyR) {
  const L = pts[keyL], R = pts[keyR];
  return (L.visibility || 0) >= (R.visibility || 0) ? L : R;
}

export function analyze(captures) {
  const stand = captures.stand.landmarks;
  const squat = captures.squat.landmarks;
  const hinge = captures.hinge.landmarks;
  const oh = captures.overhead.landmarks;
  const sit = captures.sitstand.landmarks;

  const lShoulder = stand[LM.lShoulder], rShoulder = stand[LM.rShoulder];
  const lHip = stand[LM.lHip], rHip = stand[LM.rHip];
  const lKnee = stand[LM.lKnee], rKnee = stand[LM.rKnee];
  const lAnkle = stand[LM.lAnkle], rAnkle = stand[LM.rAnkle];
  const torso = dist(mid(lShoulder, rShoulder), mid(lHip, rHip));
  const femur = (dist(lHip, lKnee) + dist(rHip, rKnee)) / 2;
  const tibia = (dist(lKnee, lAnkle) + dist(rKnee, rAnkle)) / 2;
  const arm = (dist(stand[LM.lShoulder], stand[LM.lWrist]) + dist(stand[LM.rShoulder], stand[LM.rWrist])) / 2;
  const span = dist(lShoulder, rShoulder);

  const squatKnee = (ang(squat[LM.lHip], squat[LM.lKnee], squat[LM.lAnkle]) + ang(squat[LM.rHip], squat[LM.rKnee], squat[LM.rAnkle])) / 2;
  const squatHip = (ang(squat[LM.lShoulder], squat[LM.lHip], squat[LM.lKnee]) + ang(squat[LM.rShoulder], squat[LM.rHip], squat[LM.rKnee])) / 2;
  const squatDepth = mid(squat[LM.lHip], squat[LM.rHip]).y - mid(squat[LM.lKnee], squat[LM.rKnee]).y;
  const kneeTrack = Math.abs(squat[LM.lKnee].x - squat[LM.lAnkle].x) + Math.abs(squat[LM.rKnee].x - squat[LM.rAnkle].x);

  const hingeKnee = (ang(hinge[LM.lHip], hinge[LM.lKnee], hinge[LM.lAnkle]) + ang(hinge[LM.rHip], hinge[LM.rKnee], hinge[LM.rAnkle])) / 2;
  const hingeHip = (ang(hinge[LM.lShoulder], hinge[LM.lHip], hinge[LM.lKnee]) + ang(hinge[LM.rShoulder], hinge[LM.rHip], hinge[LM.rKnee])) / 2;

  const ohL = ang(oh[LM.lShoulder], oh[LM.lElbow], oh[LM.lWrist]);
  const ohR = ang(oh[LM.rShoulder], oh[LM.rElbow], oh[LM.rWrist]);
  const wristsHigh = (oh[LM.lWrist].y + oh[LM.rWrist].y) / 2 < (oh[LM.lShoulder].y + oh[LM.rShoulder].y) / 2 - 0.08;

  const sitHip = mid(sit[LM.lHip], sit[LM.rHip]).y;

  const longFemur = femur / Math.max(tibia, 0.001) > 1.12;
  const longTorso = torso / Math.max(femur, 0.001) > 0.92;

  const notes = [];
  const scales = [];

  if (longFemur) {
    notes.push("Your thighs are a bit long for your lower legs. A lot of people with that build fold forward when they squat.");
    scales.push("First squat is to a box, not to the floor.");
  } else {
    notes.push("Your legs are balanced enough that a regular squat stance should feel natural.");
    scales.push("We start with a comfortable squat to a target you can own.");
  }

  if (squatKnee < 100 && squatDepth > -0.02) {
    notes.push("You sat deep. We will still watch that the chest stays proud.");
  } else {
    notes.push("You did not chase depth. That is fine here.");
    scales.push("Depth is to the box. Depth is not the point.");
  }

  if (kneeTrack > 0.08) {
    notes.push("The knees drifted in a little at the bottom.");
    scales.push("Slightly wider stance. We cue the knees over the laces.");
  }

  if (hingeHip < hingeKnee - 8) {
    notes.push("The hinge looked like a hip move. That is the pattern we want for deadlifts.");
    scales.push("Dowel hip hinge for two minutes, then a light kettlebell.");
  } else {
    notes.push("The hinge wanted to become a squat. Common on day one.");
    scales.push("We teach the hip hinge with a dowel on the back before any bar.");
  }

  if (wristsHigh && ohL > 150 && ohR > 150) {
    notes.push("Overhead reached cleanly.");
    scales.push("Presses can start standing with a light dumbbell.");
  } else {
    notes.push("Overhead was limited or the ribs flared. We do not force a bar over the head on day one.");
    scales.push("Presses start landmine or seated. Shoulders stay happy.");
  }

  if (sitHip > 0.62) {
    notes.push("Sit to stand used the legs. Good for the 9 a.m. class and for anyone coming back.");
  }

  if (longTorso) {
    notes.push("A longer torso likes a slightly more upright squat and a patient hinge.");
  }

  const hour = longFemur || !wristsHigh ? "A 9 a.m. or Saturday intro is the calmest first hour." : "Any 4:30 or 5:30 after-work class is fair once you have had the intro.";

  return {
    ratios: {
      "Thigh to lower leg": (femur / Math.max(tibia, 0.001)).toFixed(2),
      "Torso to thigh": (torso / Math.max(femur, 0.001)).toFixed(2),
      "Arm to torso": (arm / Math.max(torso, 0.001)).toFixed(2),
      "Shoulder width (relative)": (span / Math.max(torso, 0.001)).toFixed(2)
    },
    numbers: { squatKnee, squatHip, hingeKnee, hingeHip, ohL, ohR },
    notes,
    scales,
    hour,
    disclaimer: "This is a coaching snapshot from a phone camera. It is not a medical exam and it does not diagnose injury."
  };
}

export { BUILD, BOOK, FIRST_DAY, PHONE, MOVES, SAMPLE, LM, vis, mid };
