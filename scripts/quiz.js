import { startTimer, stopTimer, addTimeleft, totalTimeTaken,timeTakenForQue, resetTimerStats ,pauseTimer , resumeTimer } from './utils/timer.js';
import { defaultQuestions, fetchQuestions, autoAdaptDifficulty } from './data/questions.js';
import { saveToStorage, SaveQuizINfo, questionLogPush, SaveQuestionLog } from './data/storage.js';
import { calculateXP, resetStreakXP } from './utils/XP.js';
import { updateStreak } from './utils/streak.js';
import { quizInfo, generateHomeHtml } from './home.js';
import { fetchTopics,reconFetchTopics } from './data/aiScan.js';
import { generateResults } from './results.js';
import { go } from '../script.js';


export let quizFlag = false; //represents if quiz is ongoing 
let quizPaused = false; //represents if quiz is paused when user clicks on nav tabs during quiz

let questions = defaultQuestions; // Initialize with default questions, will be replaced by fetched questions when quiz starts
//isQuestionResolved is used to prevent concurrent triger like optionclick and timer or 2 optionclicks at the same time which can cause multiple triggers and break the flow of the quiz

let currentIndex = 0; // tracks which question we're on
let questionEntry = { question: '', correct: false, timeTaken: 1, skipped: false };
//socoring variables 
let scoreData = {
    quizId: null, // will be assigned when saving quiz info to local storage (same as quizInfo.quizId)
    correct: 0, //correct answers
    wrong: 0, // worng answers
    totalAnswered: 0, //total questions answeres (including wrong)
    totalQuestions: quizInfo.rounds, //total questions
    accuracy: 0, //accuracy percentage
    xp: 0,
    maxStreak: 0
};

let xp = 0, accuracy = 0, streak = 0;  //variables for left panel and for updating scoreData

function generateQuizHtml() {
    document.querySelector('.js-quiz-topic').textContent = quizInfo.quizTopic.toUpperCase();
    document.querySelector('.js-round-lbl').textContent = `ROUND ${currentIndex + 1}/${quizInfo.rounds}`;
    setQuizActiveState();
    generateDiffLbl();
    generateProgGridPanel(questions, currentIndex + 1, true); // generate the progress grid panel at the start of the quiz
}

function generateDiffLbl() {
    const diffElement = document.querySelector('.js-diff-lbl');
    diffElement.classList.remove('hard', 'easy', 'med'); // remove any existing difficulty classes
    const { difficulty } = quizInfo;
    const diffOptions = ['EASY', 'MEDIUM', 'HARD'];
    if ((difficulty).toUpperCase() === "AUTO-ADAPT") {
        diffElement.classList.add('easy');
        diffElement.textContent = '◈ ' + autoAdaptDifficulty.toUpperCase();  //set to the recieved response difficulty
        return;
    }
    else if (difficulty.toUpperCase() === diffOptions[1]) diffElement.classList.add('med');
    else if (difficulty.toUpperCase() === diffOptions[2]) diffElement.classList.add('hard');
    else diffElement.classList.add('easy'); // default to easy if auto-adapt or any other value
    diffElement.textContent = '◈ ' + difficulty.toUpperCase();
}

function generateQuestion(question) {
    document.querySelector('.js-question-text').textContent = question.question;
    document.querySelector('.js-round-lbl').textContent = `ROUND ${currentIndex + 1}/${quizInfo.rounds}`;
    const optsContainer = document.querySelector('.js-opts');
    optsContainer.innerHTML = ''; // clear previous options!

    question.options.forEach((opt, i) => {
        const optDiv = document.createElement('div');
        optDiv.className = `opt js-opt-${i}`;

        const optKey = document.createElement('div');
        optKey.className = 'opt-key';
        optKey.textContent = String.fromCharCode(65 + i); // creating key letters A,B,C,D 

        const optText = document.createElement('span');
        optText.className = `optionText-${i}`;
        // textContent automatically sanitizes HTML tags like <script>!
        optText.textContent = opt;

        optDiv.appendChild(optKey);
        optDiv.appendChild(optText);
        optsContainer.appendChild(optDiv);

        optDiv.addEventListener('click', (e) => {
            if (!isQuestionResolved) {

                selOpt(e.currentTarget, opt);
            }
        }, { once: true });
    });

    generateProgGridPanel(questions, currentIndex + 1); // update progress grid panel for each question
    questionEntry = { question: '', correct: false, timeTaken: 0, skipped: false }; //resetting values
    questionEntry.question = question.question;
    startTimer(onTimesUp);
}
document.querySelector('.js-nextQuestion-btn').addEventListener('click', () => {
    if (isQuestionResolved) return; // if question is reolved then return to avoid irregularities
    onTimesUp(); // directly call onTimesUp function to move to next question when user clicks next button without waiting for timer to run out ( mainly for mobile users who might find it hard to click the options before time runs out)
    stopTimer(); // stop the timer when user clicks next button to prevent it from running in background and causing unexpected triggers
});
function onTimesUp() {
    if (isQuestionResolved) return; // if user has already selected an option and timer runs out at the same time, don't move to next question twice
    isQuestionResolved = true; // mark question as resolved when timer runs out to prevent multiple triggers
    streak = 0; //reset streak if time runs out
    updateStreak(streak); //update left streak panel when the question is skipped

    questionEntry.skipped = true;
    showCorrectOpt();
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

export function nextQuestion() {
    console.log('Next question');
    if(quizPaused) return; // if quiz is paused then return to stop the flow of quiz
    currentIndex++;
    isQuestionResolved = false; // mark question as unresolved for the next question
    questionLogPush(questionEntry); //push after each question is answered.. hence inside nextQuestion()
    if (currentIndex < questions.length) {
        generateQuestion(questions[currentIndex]);
    } else {
        quizFlag = false;
        generateProgGridPanel(questions, currentIndex + 1); // update progress grid panel to remove 'now' class from last cell when quiz is over
        currentIndex = 0; //reset current index for next quiz attempt
        // all questions done → go to results
        scoreData['averageTime'] = Math.round(totalTimeTaken / scoreData.totalAnswered) || quizInfo.timePerQue; // calculate average time per question , if totalAnswered is 0 (can happen if user skips all questions) then set average time to timePerQue to avoid division by zero and to be fair to the user in XP calculation as well
        SaveQuestionLog(); //saving the question log when the game ends
        SaveQuizINfo(quizInfo); //only save when quiz is over
        saveToStorage(scoreData);
        generateResults(); //generate results before navigating to results page to ensure the data is ready for results page when it loads
        go('results');
        fetchTopics(); //getting Ai topics for the next quiz , storing in local storage
        reconFetchTopics();
        setQuizIdleState();
        generateHomeHtml(); // update the hero section in home page after quiz attempt to reflect any change in streak,xp or level
    }
}
export function showCorrectOpt() {
    const correct = questions[currentIndex].correct_answer;
    document.querySelectorAll('.opt').forEach(o => {
        if (o.textContent.trim().includes(correct)) o.classList.add('correct'); //add class correct to the correct option to highlight it
    });
}
let isQuestionResolved = false; // to prevent multiple triggers when user clicks option and timer runs out at the same time
function selOpt(el, selected) {
    if (isQuestionResolved) return; // prevent multiple triggers
    isQuestionResolved = true; // mark question as resolved when user selects an option
    stopTimer();//stop the time when the user selects an option
    let timeTaken = timeTakenForQue(); // calculate time taken for the question when user selects an option to update question log and for XP calculation
    questionEntry.timeTaken = timeTaken;

    scoreData.totalAnswered++; //user attempted the question by selecting an option


    const correctAnswer = questions[currentIndex].correct_answer;

    if (selected === correctAnswer) {
        el.classList.add('correct');
        scoreData.correct++;
        streak++;
        questionEntry.correct = true;
        if (streak > scoreData.maxStreak) scoreData.maxStreak = streak;
        updateProgGrid(currentIndex + 1, 'correct'); // update progress grid panel for correct answer
        addTimeleft(); // add remaining time to timeleft array for XP calculation(XP only for correct Answers)
    } else {
        scoreData.wrong++;
        el.classList.add('wrong'); // added class to highlight it after getting clicked , if wrong selected
        streak = 0; //reset streak if wrong answer selected
        updateProgGrid(currentIndex + 1, 'wrong'); // update progress grid panel for correct answer
        // also highlight the correct one
        showCorrectOpt();
    }

    updateLeftPanel(); //update left panel when user clicks on the option and scores are updated
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

document.querySelector('.js-launch-btn').addEventListener('click', async () => {
    // start with first question
    quizFlag = true;
    resetStreakXP();
    resetTimerStats();
    scoreData = { quizId: null, correct: 0, wrong: 0, totalAnswered: 0, totalQuestions: quizInfo.rounds, accuracy: 0, xp: 0, maxStreak: 0 }; //resetting scoreData
    quizInfo.quizTopic = document.querySelector('.js-topic-input').value.trim() || 'Javascript-basics';// get the quiz topic from the input field, default to 'Javascript-basics' if empty
    let timeInput = document.querySelector('.js-time-input').value.replace('SEC', '').trim() || '5';
    // get time per question from input, default to 5 seconds
    quizInfo.timePerQue = 5;
    quizInfo.difficulty = document.querySelector('.js-diff-input').value.trim() || 'Auto-Adapt';

    quizInfo.rounds = document.querySelector('.js-rounds-input').value.trim() || '10';
    questions = await fetchQuestions(quizInfo.quizTopic, quizInfo.difficulty, quizInfo.rounds) || defaultQuestions; // Fetch questions based on selected quiz settings before starting the quiz

    if (quizInfo.difficulty.toUpperCase() === "AUTO-ADAPT") quizInfo.difficulty = autoAdaptDifficulty;
    console.log('loaded');
    generateQuizHtml();
    go('quiz');
    generateQuestion(questions[currentIndex]);
});


function updateLeftPanel() {
    accuracy = Math.round((scoreData.correct / (currentIndex + 1)) * 100);//updating accuracy as questions pass
    scoreData.accuracy = accuracy; // put global accracy value inside the object accuracy
    xp = calculateXP(scoreData, streak);//calculate Xp after accuracy is update to take accuracy bonus into account
    scoreData.xp = xp; // put global xp value inside the object xp 

    let xpPanel = document.querySelector('.js-left-score');
    xpPanel.textContent = xp;

    let accuracyPanel = document.querySelector('.js-left-accuracy');
    accuracyPanel.textContent = `${accuracy}%`;
    let accuracyBar = document.querySelector('.js-accuracy-bar');

    accuracyBar.style.width = `${Math.max(2, accuracy)}%`; //updating accuracy bar width according to accuracy percentage ( minimum width 2% for visibility when accuracy is very low)

    updateStreak(streak);
}

function generateProgGridPanel(questions, Qno, reset = false) {
    let grid = document.querySelector('.js-prog-grid');
    let i = 1;
    if (grid.dataset.generated === '0' || reset === true) {
        grid.dataset.generated = '1'; // mark grid as generated
        grid.innerHTML = ''; //clear all the existing cells
        while (i <= questions.length) {
            let cell = document.createElement('div');
            cell.id = `psq-${i}`;
            cell.classList.add('psq');
            grid.appendChild(cell);
            i++;
        }
    }
    i = 1;
    while (i <= questions.length) {
        let cell = document.querySelector(`#psq-${i}`);
        let label = document.querySelector('.js-prog-lbl');
        if (i === Qno) {
            label.textContent = `PROGRESS · ${Qno}/${questions.length}`;
            let prevCell = document.querySelector(`#psq-${i - 1}`);
            if (prevCell) prevCell.classList.remove('now'); // remove 'now' class from previous cell
            if (cell) cell.classList.add('now');
            break;
        }
        else if (Qno > questions.length) { //Qno is CurrentIndex+1 hence can be > questions.length when quiz is over as when quiz is over  currentIndex gets incremented first in nextQuestion()
            let lastCell = document.querySelector(`#psq-${i}`); // when quiz is over , remove now class from last cell (i can be max = question.length at this point)
            if (lastCell) lastCell.classList.remove('now'); // remove 'now' class from last cell when quiz is over
        }
        i++;
    }
}

function updateProgGrid(Qno, status) {
    let i = 0;
    while (i <= questions.length) {
        let cell = document.querySelector(`#psq-${i}`);
        if (i === Qno) {
            if (status === 'correct') { cell.classList.add('correct'); break; } // add class according to status (correct or wrong)
            else if (status === 'wrong') { cell.classList.add('wrong'); break; }
        }
        i++;
    }
}


export function setQuizActiveState() {

    //changning variable coulours/css as its going for the quiz , not in  default/Zero state
    let quizTopicElement = document.querySelector('.js-quiz-topic');
    if (quizTopicElement) quizTopicElement.style.color = "var(--cyan)";

    let timeTextElement = document.querySelector('.js-time-text');
    if (timeTextElement) timeTextElement.style = "color:var(--cyan);text-shadow:0 0 15px var(--cyan)";

    let quizScoreElement = document.querySelector('.js-left-score');
    if (quizScoreElement) quizScoreElement.style = "color:var(--orange);text-shadow:0 0 15px var(--orange)";

    let quizAccuracyElement = document.querySelector('.js-left-accuracy');
    if (quizAccuracyElement) {
        quizAccuracyElement.style = "color:var(--yellow);text-shadow:0 0 10px var(--yellow);font-size:1.3rem"; quizAccuracyElement.textContent = "0%";
    }
    let quizAccuracyBarElement = document.querySelector('.js-accuracy-bar');
    if (quizAccuracyBarElement) quizAccuracyBarElement.style.display = "block";

    let abortBtn = document.querySelector('.sidebar-exit');
    abortBtn.style.display = 'block';
    document.querySelector('.quiz-idle').style.display = 'none';
}
export function setQuizIdleState() {

    // 1. Show the idle screen overlay
    let quizIdleScreen = document.querySelector('.quiz-idle');
    if (quizIdleScreen) quizIdleScreen.style.display = 'flex';

    // 2. Revert Quiz Topic
    let quizTopicElement = document.querySelector('.js-quiz-topic');
    if (quizTopicElement) {
        quizTopicElement.style.color = "var(--muted)";
        quizTopicElement.innerHTML = "— STANDBY —";
    }

    // 3. Revert Timer Text
    let timeTextElement = document.querySelector('.js-time-text');
    if (!timeTextElement) timeTextElement = document.getElementById('timer');

    if (timeTextElement) {
        timeTextElement.style = "color:var(--muted); text-shadow:none;";
        timeTextElement.textContent = "—:——";
    }

    // 4. Revert Score
    let quizScoreElement = document.querySelector('.js-left-score');
    if (quizScoreElement) {
        quizScoreElement.style = "color:var(--muted); text-shadow:none;";
        quizScoreElement.textContent = "+0";
    }

    // 5. Revert Accuracy Text
    let quizAccuracyElement = document.querySelector('.js-left-accuracy');
    if (quizAccuracyElement) {
        quizAccuracyElement.style = "color:var(--muted); text-shadow:none; font-size:1.3rem;";
        quizAccuracyElement.textContent = "—%";
    }

    // 6. Hide/Reset Accuracy Bar
    let quizAccuracyBarElement = document.querySelector('.js-accuracy-bar');
    if (quizAccuracyBarElement) {
        quizAccuracyBarElement.style.display = "none";
        quizAccuracyBarElement.style.width = "0%";
    }

    // 7.Hide Streak badge and combo display
    let comboDiv = document.querySelector('.js-combo-display');
    if (comboDiv) comboDiv.style.display = 'none';
    let streakBadege = document.querySelector('.streak-badge');
    if (streakBadege) streakBadege.style.display = 'none';

    let progLbl = document.querySelector('.js-prog-lbl');
    if (progLbl) progLbl.textContent = 'PROGRESS · 0/0';

    let grid = document.querySelector('.js-prog-grid');
    if (grid) {
        grid.innerHTML = '';
        grid.dataset.generated = '0';
    }

    const abortBtn = document.querySelector('.sidebar-exit');
    if(abortBtn) abortBtn.style.display='none';
}

document.querySelectorAll('.exit-btn').forEach(tab=>{
    tab.addEventListener('click',e =>{
        const page = e.currentTarget.getAttribute('data-tab');
        console.log(page);
        if(quizFlag && page !== 'quiz'){
            //this block represents quiz is ongoing
            quizPaused = true; 
            pauseTimer();
            showExitOverlay(page);
        }
        else{
           go(page);
        }

    })
});


function showExitOverlay(page){
    const overlay = document.querySelector('.exit-overlay');
    //updating the overlay data with actual quiz data before getting displayed
    const statScore = document.getElementById('statScore');
    statScore.textContent = `${scoreData.correct}/${scoreData.totalAnswered}`;
    
    const statXp = document.getElementById('statXP');
    statXp.textContent = `+${xp}`;
    const statStreak = document.getElementById('statStreak');
    statStreak.textContent = `🔥 ${scoreData.maxStreak}`;

    //all values updated , showing the overlay on scree
    overlay.classList.remove('hidden');
    let clicked = false; //to make sure user doesn't click both buttons
    document.querySelector('.btn-stay').addEventListener('click',()=>{
        if(clicked) return;
        clicked = true;
        //quiz resume
        overlay.classList.add('hidden'); //hide overlay after button clicked
        resumeTimer(onTimesUp);
        quizPaused = false;
        overlay.classList.add('hidden');
    },{once:true});
    document.querySelector('.btn-exit').addEventListener('click',()=>{
        if(clicked) return;
        clicked = true;
        stopTimer();//stop the timer when userr decides to exit
        //quiz exit
        go(page);
        setQuizIdleState();
        currentIndex = 0; //reset current index for next quiz attempt
        quizFlag = false; //reset for next quiz
        quizPaused = false; //as  quiz is over reset it 
        overlay.classList.add('hidden');
    },{once:true});



}

setQuizIdleState();
window.selOpt = selOpt;




/*```

**Two things I fixed from your code:**

`optsContainer.innerHTML = ''` — you were missing this so old options were stacking on top of new ones every question change.

`String(counter+95)` gives you numbers like `96, 97` not letters — use `String.fromCharCode(65 + i)` which gives you `A, B, C, D`.

**The core idea is simple:**
```
currentIndex = 0
click → selOpt → setTimeout → nextQuestion → currentIndex++ → generateQuestion*/