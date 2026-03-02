import { startTimer, intervalId } from './utils/timer.js';
import { questions } from './data/questions.js';
import { saveToStorage } from './results.js';

let currentIndex = 0; // tracks which question we're on

//socoring variables 

const scoreData = {
    correct: 0, //correct answers
    wrong: 0, // worng answers
    totalAnswered: 0, //total questions answeres (including wrong)
    totalQuestions: questions.length //total questions
};
console.log(scoreData.totalQuestions);

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
    });

    startTimer(() => {
        showCorrectOpt();
        setTimeout(() => {
            nextQuestion();
        }, 1500);
    });
}

export function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
        generateQuestion(questions[currentIndex]);
    } else {
        // all questions done → go to results
        console.log('quiz over');
        scoreData['accuracy'] = Math.round((scoreData.correct / questions.length) * 100); // calculate accuracy percentage
        console.log(scoreData);
        saveToStorage(scoreData);
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
    clearInterval(intervalId);//stop the time when the user selects an option
    scoreData.totalAnswered++; //user attempted the question by selecting an option
    document.querySelectorAll('.opt').forEach(o => o.onclick = null);

    const correctAnswer = questions[currentIndex].correct_answer;

    if (selected === correctAnswer) {
        el.classList.add('correct');
        scoreData.correct++;
    } else {
        scoreData.wrong++;
        el.classList.add('wrong'); // added class to highlight it after getting clicked , if wrong selected
        // also highlight the correct one
        showCorrectOpt();
    }

    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

document.querySelector('.js-launch-btn').addEventListener('click', () => {
    // start with first question
    generateQuestion(questions[currentIndex]);
});

window.selOpt = selOpt;
/*```

**Two things I fixed from your code:**

`optsContainer.innerHTML = ''` — you were missing this so old options were stacking on top of new ones every question change.

`String(counter+95)` gives you numbers like `96, 97` not letters — use `String.fromCharCode(65 + i)` which gives you `A, B, C, D`.

**The core idea is simple:**
```
currentIndex = 0
click → selOpt → setTimeout → nextQuestion → currentIndex++ → generateQuestion*/