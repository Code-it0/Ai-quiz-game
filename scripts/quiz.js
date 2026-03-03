import { startTimer, stopTimer, addTimeleft, totalTimeTaken } from './utils/timer.js';
import { questions,SaveQuizINfo } from './data/questions.js';
import { saveToStorage } from './results.js';
import { calculateXP } from './utils/XP.js';
import {updateStreak} from './utils/streak.js';
import {quizInfo} from './home.js';

let { quizTopic,difficulty,rounds} = quizInfo;

let currentIndex = 0; // tracks which question we're on


//socoring variables 

const scoreData = {
    quizId : null, // will be assigned when saving quiz info to local storage (same as quizInfo.quizId)
    correct: 0, //correct answers
    wrong: 0, // worng answers
    totalAnswered: 0, //total questions answeres (including wrong)
    totalQuestions: questions.length, //total questions
    accuracy: 0, //accuracy percentage
    xp :0
};

let xp = 0, accuracy = 0, streak = 0;  //variables for left panel and for updating scoreData

function generateQuizHtml(){
    document.querySelector('.js-quiz-topic').textContent= quizTopic.toUpperCase();
    document.querySelector('.js-round-lbl').textContent = `ROUND ${currentIndex}/${rounds}`;
    generateDiffLbl();
    generateProgGridPanel(questions, currentIndex + 1); // generate the progress grid panel at the start of the quiz
}
generateQuizHtml();

function generateDiffLbl(){
    const diffElement = document.querySelector('.js-diff-lbl');
    const diffOptions = ['EASY', 'MEDIUM', 'HARD'];
    if(difficulty === "AUTO-ADAPT") {
        diffElement.classList.add('easy');
        diffElement.textContent = '◈ ' + diffOptions[0].toUpperCase(); 
        return;}
    else if(difficulty === diffOptions[1]) diffElement.classList.add('med');
    else if(difficulty === diffOptions[2]) diffElement.classList.add('hard');
    else diffElement.classList.add('easy'); // default to easy if auto-adapt or any other value
    diffElement.textContent = '◈ ' + difficulty.toUpperCase();
}

function generateQuestion(question) {
    document.querySelector('.js-question-text').textContent = question.question;
    const optsContainer = document.querySelector('.js-opts');
    optsContainer.innerHTML = ''; // clear previous options!

    question.options.forEach((opt, i) => {
        optsContainer.innerHTML += `
        <div class="opt" onclick="selOpt(this, '${opt}')">
        <div class="opt-key">${String.fromCharCode(65 + i)}</div>
        ${opt}
        </div>`;

        generateProgGridPanel(questions, currentIndex + 1); // update progress grid panel for each question

        /*document.querySelector('.js-left-score').textContent = xp; // update XP in left panel
        document.querySelector('.js-left-accuracy').textContent = `${accuracy}%`; // update accuracy in left panel
        document.querySelector('.js-streak-txt').textContent = `x${streak} COMBO`; // update streak in left panel
        document.querySelector('.js-combo-display').textContent =`🔥 COMBO x${streak} · +80 BONUS XP`; //updating bottom streak panel whenn question generated*/
    });

    startTimer(() => {
        streak = 0; //reset streak if time runs out
        showCorrectOpt();
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    });
}

export function nextQuestion() {
    currentIndex++;
    console.log('next question');
    if (currentIndex < questions.length) {
        generateQuestion(questions[currentIndex]);
    } else {
        generateProgGridPanel(questions, currentIndex + 1); // update progress grid panel to remove 'now' class from last cell when quiz is over
        // all questions done → go to results
        scoreData['averageTime'] = Math.round(totalTimeTaken / questions.length); // calculate average time per question
        saveToStorage(scoreData);
        SaveQuizINfo(quizInfo); //only save when quiz is over
        go('results', 2);
    }
}
export function showCorrectOpt() {
    const correct = questions[currentIndex].correct_answer;
    document.querySelectorAll('.opt').forEach(o => {
        if (o.textContent.trim().includes(correct)) o.classList.add('correct'); //add class correct to the correct option to highlight it
    });
}
function selOpt(el, selected) {
    // prevent double clicking
    stopTimer();//stop the time when the user selects an option
    scoreData.totalAnswered++; //user attempted the question by selecting an option
    document.querySelectorAll('.opt').forEach(o => o.onclick = null);


    const correctAnswer = questions[currentIndex].correct_answer;
    
    if (selected === correctAnswer) {
        el.classList.add('correct');
        scoreData.correct++;
        streak++;
        updateProgGrid(currentIndex + 1,'correct'); // update progress grid panel for correct answer
        addTimeleft(); // add remaining time to timeleft array for XP calculation(XP only for correct Answers)
    } else {
        scoreData.wrong++;
        el.classList.add('wrong'); // added class to highlight it after getting clicked , if wrong selected
        streak = 0; //reset streak if wrong answer selected
        updateProgGrid(currentIndex + 1,'wrong'); // update progress grid panel for correct answer
        // also highlight the correct one
        showCorrectOpt();
    }
    
    updateLeftPanel(); //update left panel when user clicks on the option and scores are updated
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

document.querySelector('.js-launch-btn').addEventListener('click', () => {
    // start with first question
    generateQuizHtml();
    generateQuestion(questions[currentIndex]);
});


function updateLeftPanel() {
    accuracy = Math.round((scoreData.correct / (currentIndex + 1)) * 100); //updating accuracy as questions pass
    scoreData.accuracy = accuracy; // put global accracy value inside the object accuracy
    xp = calculateXP(scoreData,streak);//calculate Xp after accuracy is update to take accuracy bonus into account
    scoreData.xp = xp; // put global xp value inside the object xp 

    let xpPanel = document.querySelector('.js-left-score');
    xpPanel.textContent = xp;

    let accuracyPanel = document.querySelector('.js-left-accuracy');
    accuracyPanel.textContent = `${accuracy}%`;
    let accuracyBar = document.querySelector('.js-accuracy-bar');
    accuracyBar.style.width = `${Math.max(2, accuracy)}%`; //updating accuracy bar width according to accuracy percentage ( minimum width 2% for visibility when accuracy is very low)

    let streakPanel = document.querySelector('.js-streak-txt');
    streakPanel.textContent = `x${streak} COMBO`; //updating streak panel when an option is selected
    let comboPanel = document.querySelector('.js-combo-display');
    comboPanel.textContent = `🔥 COMBO x${streak} · +80 BONUS XP`; //updating streak panel when an option is selected
    updateStreak(streak); 

    console.log(xp, accuracy);
}

function generateProgGridPanel(questions, Qno) {
    let grid = document.querySelector('.js-prog-grid');
    let i = 1;
    if (grid.dataset.generated === '0') {
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
        if (i === Qno) {
            let prevCell = document.querySelector(`#psq-${i - 1}`);
            if (prevCell) prevCell.classList.remove('now'); // remove 'now' class from previous cell
            if(cell)cell.classList.add('now');
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
    let i =0;
    while (i <= questions.length) {
        let cell = document.querySelector(`#psq-${i}`);
        if (i === Qno) {
            if(status === 'correct'){cell.classList.add('correct');break;} // add class according to status (correct or wrong)
            else if(status === 'wrong'){cell.classList.add('wrong');break;}
        }
        i++;
    }
}


window.selOpt = selOpt;




/*```

**Two things I fixed from your code:**

`optsContainer.innerHTML = ''` — you were missing this so old options were stacking on top of new ones every question change.

`String(counter+95)` gives you numbers like `96, 97` not letters — use `String.fromCharCode(65 + i)` which gives you `A, B, C, D`.

**The core idea is simple:**
```
currentIndex = 0
click → selOpt → setTimeout → nextQuestion → currentIndex++ → generateQuestion*/