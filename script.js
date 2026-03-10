
import './scripts/home.js';
import './scripts/quiz.js';
import './scripts/results.js';
import { quizFlag } from './scripts/quiz.js';
import { generateTopicsHtml } from './scripts/data/aiScan.js';

// switches between pages (home/quiz/results) and highlights the correct nav tab
console.log('connected');
export function go(id) {
  // hide all pages
  const tabs = ['home', 'quiz', 'results'];
  tabs.forEach(p => {
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

  const idx = tabs.findIndex(t => t === id);
  // highlight the correct nav tab by index
  document.querySelectorAll('.nav-tab')[idx].classList.add('active');
}


// toggles the topic chip dropdown open/closed
export function toggleChips(visibility) {
  const c = document.getElementById('chips');
  const reconDiv = document.getElementById('weakChips');
  console.log(reconDiv.innerHTML);
  if (visibility === true) {
    reconDiv.style.display = 'block';
    c.style.display = 'flex';
  } //compulsary show chips
  else {
    const aiBtn = document.querySelector('.ai-btn')
    reconDiv.style.display = 'none';
    if (c.style.display === 'none') {
      c.style.display = 'flex';
      // when chips open
      aiBtn.textContent = 'AI SCAN ▼';
    }
    else {
      c.style.display = 'none';
      // normal mode
      aiBtn.textContent = 'AI SCAN ▶';
    }
  } //compulsary show chips
} //normal case: toggle


// fills the topic input with the clicked chip's text, then closes the dropdown
export function pick(el) {
  document.getElementById('topicInput').value = el.textContent;
  document.getElementById('chips').style.display = 'none';
}

// live clock — updates the HUD clock every second
setInterval(() => {
  const now = new Date();
  document.getElementById('clock').textContent =
    [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => n.toString().padStart(2, '0')) // ensures 2 digits e.g. 9 → "09"
      .join(':');
}, 1000);


//shortcut keys for switching between pages with left/right arrow keys
const tabs = ['home', 'quiz', 'results'];
let i = 0;
window.addEventListener('keydown', e => {
  if (quizFlag) return;
  if (e.key === 'ArrowRight') {
    if (tabs[i + 1]) i++;
    else i = 0;
  }
  else if (e.key === 'ArrowLeft') {
    if (tabs[i - 1]) i--;
    else i = tabs.length - 1;
  }
  go(tabs[i]);
});


// Make functions globally available for inline onclick handlers
window.go = go;
window.toggleChips = toggleChips;
window.pick = pick;
