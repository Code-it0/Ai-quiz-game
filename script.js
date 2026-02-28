
import './scripts/home.js';
import './scripts/quiz.js';
import './scripts/results.js';

// switches between pages (home/quiz/results) and highlights the correct nav tab
console.log('connected');
function go(id, idx) {
  // hide all pages
  ['home','quiz','results'].forEach(p => {
    const el = document.getElementById(p);
    el.classList.remove('active');
    el.style.display = 'none';
  });

  // deactivate all nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  // show the target page — results needs block, others need flex for side-by-side layout
  const el = document.getElementById(id);
  el.style.display = id === 'results' ? 'block' : 'flex';
  el.classList.add('active');

  // highlight the correct nav tab by index
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
}


// toggles the topic chip dropdown open/closed
function toggleChips() {
  const c = document.getElementById('chips');
  c.style.display = c.style.display === 'none' ? 'flex' : 'none';
}


// fills the topic input with the clicked chip's text, then closes the dropdown
function pick(el) {
  document.getElementById('topicInput').value = el.textContent;
  document.getElementById('chips').style.display = 'none';
}


// highlights the selected answer option, removes highlight from the rest
function selOpt(el) {
  document.querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
}


// live clock — updates the HUD clock every second
setInterval(() => {
  const now = new Date();
  document.getElementById('clock').textContent =
    [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(n => n.toString().padStart(2,'0')) // ensures 2 digits e.g. 9 → "09"
    .join(':');
}, 1000);


// Make functions globally available for inline onclick handlers
window.go = go;
window.toggleChips = toggleChips;
window.pick = pick;
window.selOpt = selOpt;
