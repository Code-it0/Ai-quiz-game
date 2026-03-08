// quiz countdown — ticks down every second and shrinks the timer bar
const timePerQue = 5; //default for fast coding
let t = timePerQue * 10; // time for each question
const bar = document.getElementById('timerBar');
export let intervalId;
export function startTimer(onTimeUP) {
    //stop interval after timer is over\
    if (intervalId) clearInterval(intervalId);
    t = timePerQue * 10; // reset time for each question //calculating in terms of 100ms for smoother bar animation (e.g. 30s = 300 ticks of 100ms)
    bar.style.width = '100% ';
    bar.style.background = 'linear-gradient(90deg, var(--cyan), var(--green))';
    intervalId = setInterval(() => {
        if (t > 0) t--;
        else {
            clearInterval(intervalId);
            onTimeUP();
        }
        // update the timer text display
        const el = document.getElementById('timer');
        if (el) el.textContent = `0:${Math.ceil(t / 10).toString().padStart(2, '0')}`;

        // if bar exists (null check), update its width and turn red when under 10s
        if (bar) {
            let pct = (t / timePerQue) * 10; //=== (t/10 /timeperque)*100         // 30s = 100% full bar t/ 10 cuz multiplied it by 10 earlier 
            pct = Math.max(0, Math.min(100, pct)); //pct can be only between 0 and 100
            bar.style.width = pct + '%';
            if (t < 10) bar.style.background = 'linear-gradient(90deg,var(--red),var(--orange))';
        }
    }, 100);
}

export function stopTimer() {
    clearInterval(intervalId);
}

export let totalTimeTaken = 0; //varible to calculate average time taken for each question inside quiz.js
export function timeTakenForQue() {
    totalTimeTaken += timePerQue - Math.ceil(t / 10); // totaltime-timeleft = time taken
    return Math.max(1, timePerQue - Math.ceil(t / 10)); //returning this value because to update question log when user clicks option , timer stops inside selOption()[quiz.js] , min time taken can be one sec ... not less than that like 0 is not possible
}

export let timeleft = 0; //variable to store time left for XP calculation (only for correct answers)
export function addTimeleft() {
    timeleft += Math.ceil(t / 10); // adding time left when user answers correctly, to calculate bonus XP based on time left
    console.log(timeleft);
}

export function resetTimerStats() {
    totalTimeTaken = 0;
    timeleft = 0;
}

/*
function totalTimerBar(){
    const totalBar = document.querySelector('.js-xp-bar');
    const t = (timeleft / (timePerQue * questions.length)) * 100;
    totalBar.style.width = t + '%';

    intervalId = setInterval(() => {
        if (t > 0) t--;
        else {
            clearInterval(intervalId);
        }
        // if bar exists (null check), update its width and turn red when under 10s
        if (bar) {
            let pct = (t / timePerQue) * 100;          // 30s = 100% full bar
            pct = Math.max(0, Math.min(100, pct)); //pct can be only between 0 and 100
            bar.style.width = pct + '%';
        }
    }, 1000);
}*/