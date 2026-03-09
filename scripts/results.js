import { loadFromStorageById,loadQuizInfoById,LoadQuestionLogById } from './data/storage.js';
import { generateTopicsHtml } from './data/aiScan.js';
import { go, toggleChips } from '../script.js';
export function generateResults() {
    const scoreData = loadFromStorageById('recent'); // load current score data (index 0 since it's the most recent)
    console.log(scoreData);
    const quizInfo = loadQuizInfoById('recent'); //load recent quiz info  
    const { correct, wrong, totalAnswered, totalQuestions, accuracy, averageTime, xp } = scoreData;
    (document.querySelector('.js-correct-num')).textContent = correct; //changing score on page
    (document.querySelector('.js-wrong-num')).textContent = wrong; // changing wrong score on page
    (document.querySelector('.js-avg-time')).textContent = averageTime + " SEC"; // changing average time on page

    //finding previous accuracy from local storage
    const prevData = loadFromStorageById('secondLast'); // get previous score data (quizId 1 since current score is at quizId 0)
    const prevAccuracy = prevData ? prevData.accuracy : 'last run';

    let quizTopic = quizInfo.quizTopic;
    (document.querySelector('.js-hero-sub')).innerHTML = `${quizTopic} · ${correct}/${totalQuestions} correct · +${accuracy}% vs ${prevAccuracy}% <br>${correct} threats neutralized. ${wrong} weaknesses flagged for recon.`;

    (document.querySelector('.js-xp')).textContent = `+${xp}`; // display  XP on page


    // for the conic-gradient dial
    document.querySelector('.js-score-dial').style.background =
        `conic-gradient(var(--cyan) 0% ${accuracy}%, var(--dim) ${accuracy}% 100%)`;

    document.querySelector('.js-score-dial-val').textContent = `${accuracy}%`;

    //Generating radar results 
    generateRadar(scoreData,prevData);
    
    //generating battlelog results
    let currentQuizInfo = loadQuizInfoById(scoreData.quizId);
    let timePerQue = currentQuizInfo ? currentQuizInfo.timePerQue : 5; // fallback to 5
    // Pass the correctly fetched time limit instead of scoreData.timePerQue
    generateBattleLog(LoadQuestionLogById(scoreData.quizId), timePerQue);

}

//deleted from here

function generateRadarData(scoreData) {
    // calculate 5 axes (all 0-100)
    let Data = loadQuizInfoById(scoreData.quizId);
    const timePerQue = Data.timePerQue; // match your timer.js value
    let difficultyLevel = Data['difficulty']; // or difficultyData.difficulty
    // 1. Create a quick helper function to keep the object readable

    const snapToTen = (value) => Math.round(value / 10) * 10; // value => nearest multiple of 10...

    // 2. Build the object
    let data = {
        // Snap the provided values as it how radar maps show data snap to nearest multiple of 10
        accuracy: snapToTen(scoreData.accuracy),
        speed: snapToTen((1 - scoreData.averageTime / timePerQue) * 100),
        streakScore: snapToTen(Math.pow(scoreData.maxStreak / scoreData.totalQuestions, 0.7) * 100),
        // Using 0.7 as the exponent (1 is linear, 0.5 is square root)
        consistency: scoreData.totalQuestions > 0 ? snapToTen((scoreData.maxStreak / scoreData.totalQuestions) * 100) : 0,
        difficulty: difficultyLevel,
        diffScore: difficultyLevel === 'HARD' ? 100 : difficultyLevel === 'MEDIUM' ? 60 : 30
    };
    return data;
}

let radarChart = null;
export function generateRadar(scoreData, prevData) {

    let data = generateRadarData(scoreData);
    const { accuracy, speed, streakScore, consistency, diffScore } = data;

    // prev run data (or zeros if first time)
    const prev = prevData ? generateRadarData(prevData) : {};

    // Unpack the 'prev' object, rename the keys, and set fallbacks to 0
    const {
        accuracy: prevAccuracy = 0,
        speed: prevSpeed = 0,
        streakScore: prevStreak = 0,
        consistency: prevConsistency = 0,
        diffScore: prevDiff = 0  // Assuming you want the numeric diffScore here
    } = prev;

    // update sidebar stat bars
    const stats = { accuracy, speed, streak: streakScore, consistency, difficulty: diffScore };
    Object.entries(stats).forEach(([key, val]) => {
        const valEl = document.querySelector(`.js-stat-${key}`);
        const barEl = document.querySelector(`.js-bar-${key}`);
        if (valEl) valEl.textContent = val + '%';
        if (barEl) barEl.style.width = val + '%';
    });

    // draw radar chart
    if(radarChart)radarChart.destroy(); //freeing the canvas by destroying the previous chart if it exists

    const ctx = document.getElementById('radarChart').getContext('2d');
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['ACCURACY', 'SPEED', 'STREAK', 'CONSISTENCY', 'DIFFICULTY'],
            datasets: [
                {
                    label: 'THIS RUN',
                    data: [accuracy, speed, streakScore, consistency, diffScore],
                    borderColor: '#00e5ff',
                    backgroundColor: '#00e5ff12',
                    pointBackgroundColor: '#00e5ff',
                    pointRadius: 4,
                    borderWidth: 2,
                },
                {
                    label: 'LAST RUN',
                    data: [prevAccuracy, prevSpeed, prevStreak, prevConsistency, prevDiff],
                    borderColor: '#ff6b0066',
                    backgroundColor: '#ff6b0008',
                    pointBackgroundColor: '#ff6b00',
                    pointRadius: 3,
                    borderWidth: 1,
                    borderDash: [4, 4],
                }
            ]
        },
        options: {
            responsive: true,
            animation: { duration: 1200, easing: 'easeOutQuart' },
            scales: {
                r: {
                    min: 0, max: 100,
                    ticks: { display: false },
                    grid: { color: '#00e5ff15' },
                    angleLines: { color: '#00e5ff20' },
                    pointLabels: { font: { family: 'Share Tech Mono', size: 9 }, color: '#3a4a5a' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0d1017',
                    borderColor: '#00e5ff18',
                    borderWidth: 1,
                    titleFont: { family: 'Share Tech Mono', size: 10 },
                    bodyFont: { family: 'Share Tech Mono', size: 10 },
                    titleColor: '#00e5ff',
                    bodyColor: '#c8d8e8',
                }
            }
        }
    });
}

export function generateBattleLog(questionLog, timePerQue) {
    const timeline = document.querySelector('.js-timeline');
    timeline.innerHTML = '';
    const MAX_H = 52;

    questionLog.forEach((entry, i) => {
        const col = document.createElement('div');
        col.className = 'tl-col';

        let barH, cls, tip;
        if (entry.skipped) {
            barH = 8; cls = 'skipped';
            tip = `Q${i + 1} · SKIPPED`;
        } else if (entry.correct) {
            const speed = Math.max(1, (timePerQue - entry.timeTaken) / timePerQue);
            barH = Math.max(14, Math.round(speed * MAX_H));
            cls = 'correct';
            tip = `Q${i + 1} · HIT · ${entry.timeTaken}s`;
        } else {
            barH = Math.max(10, Math.round((entry.timeTaken / timePerQue) * MAX_H * 0.6));
            cls = 'wrong';
            tip = `Q${i + 1} · FAILED · ${entry.timeTaken}s`;
        }

        const shortQ = entry.question.length > 25
            ? entry.question.slice(0, 25) + '…'
            : entry.question;

        col.innerHTML = `
      <div class="tl-bar ${cls}" style="height:${barH}px" data-tip="${tip} — ${shortQ}"></div>
      <div class="tl-label">Q${String(i + 1).padStart(2, '0')}</div>`;
        timeline.appendChild(col);
    });
}


generateResults(); //defaualt => recent quiz data

document.querySelector('.js-recon-topics').addEventListener('click', () => {
    generateTopicsHtml(true); //regenerating the html of topics fetched for recon when user clicks on recon weak zones button on results page
    toggleChips(true);
    go('home', 0); // navigate to home page to show the ai generated topics when user clicks on recon weak zones button on results page

});