function go(id, idx) {
    ['home', 'quiz', 'results'].forEach(p => {
        const el = document.getElementById(p);
        el.classList.remove('active');
        el.style.display = 'none';
    });
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const el = document.getElementById(id);
    el.style.display = id === 'results' ? 'block' : 'flex';
    el.classList.add('active');
    document.querySelectorAll('.nav-tab')[idx].classList.add('active');
}

function toggleChips() {
    const c = document.getElementById('chips');
    c.style.display = c.style.display === 'none' ? 'flex' : 'none';
}

function pick(el) {
    document.getElementById('topicInput').value = el.textContent;
    document.getElementById('chips').style.display = 'none';
}

function selOpt(el) {
    document.querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
    el.classList.add('sel');
}

// clock
setInterval(() => {
    const now = new Date();
    document.getElementById('clock').textContent =
        [now.getHours(), now.getMinutes(), now.getSeconds()]
            .map(n => n.toString().padStart(2, '0')).join(':');
}, 1000);

// quiz timer
let t = 42;
const bar = document.getElementById('timerBar');
setInterval(() => {
    if (t > 0) t--;
    const el = document.getElementById('timer');
    if (el) el.textContent = `0:${t.toString().padStart(2, '0')}`;
    if (bar) {
        const pct = (t / 30) * 100;
        bar.style.width = Math.max(0, pct) + '%';
        if (t < 10) bar.style.background = 'linear-gradient(90deg,var(--red),var(--orange))';
    }
}, 1000);