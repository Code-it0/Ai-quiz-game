// quiz countdown — ticks down every second and shrinks the timer bar
let t = 30; // time for each question
const bar = document.getElementById('timerBar');

export function startTimer() {
    resetTimer();
    const intervalId = setInterval(() => {
        if (t > 0) t--;

        // update the timer text display
        const el = document.getElementById('timer');
        if (el) el.textContent = `0:${t.toString().padStart(2, '0')}`;

        // if bar exists (null check), update its width and turn red when under 10s
        if (bar) {
            let pct = (t / 30) * 100;          // 30s = 100% full bar
            pct = Math.max(0, Math.min(100, pct)); //pct can be only between 0 and 100
            bar.style.width = pct + '%';
            if (t < 10) bar.style.background = 'linear-gradient(90deg,var(--red),var(--orange))';
        }
    }, 1000);
    if (t === 0) clearInterval(intervalId); //stop interval after timer is over
}

function resetTimer(){
    t = 30; // reset time for each question
    bar.style.width = '100% ';
    bar.style.background = 'linear-gradient(90deg, var(--cyan), var(--green))';
}