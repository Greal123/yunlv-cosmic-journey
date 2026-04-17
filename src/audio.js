// ─── Grand Cosmic Music - Smooth, powerful, full of love ───
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let nodes = [];
let lfoNodes = [];

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0;

  // Master reverb via convolver (simulated)
  const convolver = audioCtx.createConvolver();
  const reverbLen = audioCtx.sampleRate * 3;
  const reverbBuf = audioCtx.createBuffer(2, reverbLen, audioCtx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = reverbBuf.getChannelData(ch);
    for (let i = 0; i < reverbLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 1.2)) * 0.4;
    }
  }
  convolver.buffer = reverbBuf;

  // Dry + wet mix
  const dryGain = audioCtx.createGain();
  dryGain.gain.value = 0.6;
  const wetGain = audioCtx.createGain();
  wetGain.gain.value = 0.4;

  masterGain.connect(dryGain);
  masterGain.connect(convolver);
  convolver.connect(wetGain);
  dryGain.connect(audioCtx.destination);
  wetGain.connect(audioCtx.destination);
}

function createSmoothPad(freq, gain, type = 'sine') {
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc1.type = type;
  osc1.frequency.value = freq;
  osc2.type = 'sine';
  osc2.frequency.value = freq * 1.001; // very slight chorus

  filter.type = 'lowpass';
  filter.frequency.value = freq * 3;
  filter.Q.value = 0.3;

  g.gain.value = gain;

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  osc1.start();
  osc2.start();

  nodes.push({ osc: osc1, gain: g, filter });
  nodes.push({ osc: osc2, gain: g, filter });
  return { osc1, osc2, gain: g, filter };
}

function createWarmBass(freq, gain) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.value = freq;

  filter.type = 'lowpass';
  filter.frequency.value = 200;
  filter.Q.value = 0.5;

  g.gain.value = gain;

  osc.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  osc.start();

  nodes.push({ osc, gain: g, filter });
}

function createBreathingLFO(target, minVal, maxVal, period) {
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();

  lfo.type = 'sine';
  lfo.frequency.value = 1 / period;

  const range = (maxVal - minVal) / 2;
  const center = minVal + range;
  lfoGain.gain.value = range;

  lfo.connect(lfoGain);
  lfoGain.connect(target);
  target.value = center;

  lfo.start();
  lfoNodes.push(lfo);
}

function createSoftShimmer() {
  const bufferSize = audioCtx.sampleRate * 6;
  const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < bufferSize; i++) {
      // Filtered noise - softer and more musical
      const t = i / audioCtx.sampleRate;
      data[i] = (Math.sin(t * 2000 + Math.sin(t * 3) * 500) * 0.002 +
                 Math.sin(t * 3500 + Math.sin(t * 2) * 300) * 0.001) *
                (0.8 + Math.sin(t * 0.5) * 0.2);
    }
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2500;
  filter.Q.value = 2;

  const g = audioCtx.createGain();
  g.gain.value = 0.06;

  source.connect(filter);
  filter.connect(g);
  g.connect(masterGain);
  source.start();

  nodes.push({ osc: source, gain: g, filter });

  // Breathing filter movement
  createBreathingLFO(filter.frequency, 1800, 3200, 12);
}

function createMelodicChime() {
  // Gentle repeating melodic pattern using scheduled oscillators
  const notes = [
    { freq: 523.25, time: 0 },      // C5
    { freq: 659.25, time: 4 },      // E5
    { freq: 783.99, time: 8 },      // G5
    { freq: 659.25, time: 12 },     // E5
    { freq: 587.33, time: 16 },     // D5
    { freq: 523.25, time: 20 },     // C5
    { freq: 392.00, time: 24 },     // G4
    { freq: 440.00, time: 28 },     // A4
  ];

  const totalCycle = 32;

  function playChime(startTime) {
    notes.forEach(n => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.value = n.freq;

      filter.type = 'lowpass';
      filter.frequency.value = n.freq * 2;
      filter.Q.value = 0.3;

      const noteStart = startTime + n.time;
      g.gain.setValueAtTime(0, noteStart);
      g.gain.linearRampToValueAtTime(0.012, noteStart + 0.5);
      g.gain.linearRampToValueAtTime(0.008, noteStart + 2);
      g.gain.linearRampToValueAtTime(0, noteStart + 3.8);

      osc.connect(filter);
      filter.connect(g);
      g.connect(masterGain);
      osc.start(noteStart);
      osc.stop(noteStart + 4);
    });
  }

  // Schedule multiple cycles
  const now = audioCtx.currentTime;
  for (let cycle = 0; cycle < 20; cycle++) {
    playChime(now + 3 + cycle * totalCycle);
  }
}

export function startAmbientMusic() {
  if (isPlaying || !audioCtx) return;
  isPlaying = true;

  if (audioCtx.state === 'suspended') audioCtx.resume();

  // Deep warm bass foundation
  createWarmBass(55, 0.06);        // A1
  createWarmBass(82.41, 0.04);     // E2

  // Flowing pad layers - major chords for warmth and love
  createSmoothPad(130.81, 0.025, 'sine');     // C3
  createSmoothPad(164.81, 0.020, 'sine');     // E3
  createSmoothPad(196.00, 0.020, 'sine');     // G3

  // Higher ethereal layer
  createSmoothPad(261.63, 0.012, 'triangle'); // C4
  createSmoothPad(329.63, 0.010, 'sine');     // E4
  createSmoothPad(392.00, 0.010, 'sine');     // G4

  // Very high sparkle
  createSmoothPad(523.25, 0.005, 'sine');     // C5
  createSmoothPad(659.25, 0.004, 'sine');     // E5

  // Soft shimmer texture
  createSoftShimmer();

  // Gentle melodic chimes
  createMelodicChime();

  // Grand slow fade in
  masterGain.gain.setTargetAtTime(0.35, audioCtx.currentTime, 4);

  // Slow breathing modulation for grandeur
  nodes.forEach((node, i) => {
    if (node.gain && node.gain.gain) {
      const baseVal = node.gain.gain.value;
      createBreathingLFO(node.gain.gain, baseVal * 0.7, baseVal * 1.0, 8 + i * 2);
    }
  });
}

export function stopAmbientMusic() {
  if (!isPlaying || !audioCtx) return;
  isPlaying = false;

  masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 3);

  setTimeout(() => {
    nodes.forEach(n => { try { n.osc.stop(); } catch(e) {} });
    lfoNodes.forEach(n => { try { n.stop(); } catch(e) {} });
    nodes = [];
    lfoNodes = [];
  }, 6000);
}
