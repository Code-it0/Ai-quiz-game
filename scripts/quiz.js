import { startTimer } from './utils/timer.js';
import { questions } from './data/questions.js';

let currentIndex = 0; // tracks which question we're on

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
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
        generateQuestion(questions[currentIndex]);
    } else {
        // all questions done → go to results
        console.log('quiz over');
        go('results', 2);
    }
}

function selOpt(el, selected) {
    // prevent double clicking
    document.querySelectorAll('.opt').forEach(o => o.onclick = null);

    const correct = questions[currentIndex].correct_answer;

    if (selected === correct) {
        el.classList.add('correct');
    } else {
        el.classList.add('wrong'); // added class to highlight it after getting clicked , if wrong selected
        // also highlight the correct one
        document.querySelectorAll('.opt').forEach(o => {
            if (o.textContent.trim().includes(correct)) o.classList.add('correct'); //add class correct to the correct option to highlight it
        });
    }

    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

// start with first question
generateQuestion(questions[currentIndex]);
startTimer();

window.selOpt = selOpt;
/*```

**Two things I fixed from your code:**

`optsContainer.innerHTML = ''` — you were missing this so old options were stacking on top of new ones every question change.

`String(counter+95)` gives you numbers like `96, 97` not letters — use `String.fromCharCode(65 + i)` which gives you `A, B, C, D`.

**The core idea is simple:**
```
currentIndex = 0
click → selOpt → setTimeout → nextQuestion → currentIndex++ → generateQuestion*/