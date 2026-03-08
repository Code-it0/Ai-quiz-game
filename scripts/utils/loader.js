const messages = [
    'INITIALIZING AI CORE...',
    'CONNECTING TO NEURAL NET...',
    'GENERATING QUESTIONS...',
    'CALIBRATING DIFFICULTY...',
    'PREPARING BATTLEFIELD...',
];
const overlayEl = document.querySelector('.loading-overlay');
const statusEl = document.getElementById('statusMsg');
const pctEl = document.getElementById('pct');
const barFill = document.getElementById('barFill');
let pctInterval, msgInterval;

export function startLoadingPage() {
    changeBarAndPct(0); //resetting the bar and percentage for the next time loading page is called
    overlayEl.style.display = 'flex';
    let msgIndex = 0;

    msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        statusEl.style.animation = 'none';
        statusEl.offsetHeight;
        statusEl.style.animation = 'fadeMsg 0.4s ease';
        statusEl.textContent = messages[msgIndex];
    }, 700);

    let pct = 0;
    pctInterval = setInterval(() => {
        if (pct < 95) {
            pct += Math.random() * 3;
            const val = Math.min(95, Math.round(pct));
            changeBarAndPct(val);
        } else {
            clearInterval(pctInterval);
            clearInterval(msgInterval);
        }
    }, 120);
}

function changeBarAndPct(val) {
    pctEl.textContent = val + '%';
    barFill.style.width = val + '%';
}

export async function stopLoadingPage(toastFun) {
    clearInterval(pctInterval);
    clearInterval(msgInterval);
    changeBarAndPct(100);
    await toastFun(); //waitng for the bar animation promise to get resolved
    return new Promise(resolve =>
        setTimeout(() => {
            overlayEl.style.display = 'none';
            resolve();
        }, 900)); //this promise ensures the loading page gets hidden
}


let toastTimer = null;

function showToast(msg, type = 'error', icon = '⚠', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    // clear any existing timer
    if (toastTimer) clearTimeout(toastTimer);

    // reset
    toast.className = 'toast';
    toast.offsetHeight; // reflow to restart animation

    // set content + type
    toastMsg.textContent = msg;
    toastIcon.textContent = icon;
    toast.classList.add(type, 'show');

    // auto hide and return promise
    return new Promise(resolve => {
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                toast.className = 'toast';
            }, 400);
            resolve();
        }, duration);
    });// this function return a promise which ensures that the bar animations is completed
}

export function errorToast() {
    return showToast('AI OFFLINE — LOADING BACKUP QUESTIONS', 'error', '⚠');
}
export function loadedToast() {
    return showToast('QUESTIONS LOADED SUCCESSFULLY', 'success', '✓');
}

// auto trigger on load so you see it immediately
