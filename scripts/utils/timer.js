// quiz countdown — ticks down every second and shrinks the timer bar
const timePerQue = 5; //default for fast coding
let t=timePerQue; // time for each question
const bar = document.getElementById('timerBar');
export let intervalId;
export function startTimer(onTimeUP) {
    //stop interval after timer is over\
    t = timePerQue; // reset time for each question
    bar.style.width = '100% ';
    bar.style.background = 'linear-gradient(90deg, var(--cyan), var(--green))';

    intervalId = setInterval(() => {
        console.log(t);
        if (t > 0) t--;
        else {
            clearInterval(intervalId);
            onTimeUP();
        }
        // update the timer text display
        const el = document.getElementById('timer');
        if (el) el.textContent = `0:${t.toString().padStart(2, '0')}`;

        // if bar exists (null check), update its width and turn red when under 10s
        if (bar) {
            let pct = (t / timePerQue) * 100;          // 30s = 100% full bar
            pct = Math.max(0, Math.min(100, pct)); //pct can be only between 0 and 100
            bar.style.width = pct + '%';
            if (t < 10) bar.style.background = 'linear-gradient(90deg,var(--red),var(--orange))';
        }
    }, 1000);
}

export let totalTimeTaken =0; //varible to calculate average time taken for each question inside quiz.js
export function stopTimer() {
    clearInterval(intervalId);
    totalTimeTaken+=timePerQue-t; // totaltime-timeleft = time taken
}

export let timeleft=0; //variable to store time left for XP calculation (only for correct answers)
export function addTimeleft(){
    timeleft+=t;
    console.log(timeleft);
}
