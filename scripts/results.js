import { calculateXP } from "./utils/XP.js";
import { quizTopic } from './home.js';
export function generateResults(scoreData) {
    const { correct, wrong, totalAnswered, totalQuestions, accuracy } = scoreData;
    (document.querySelector('.js-correct-num')).textContent = correct; //changing score on page
    (document.querySelector('.js-wrong-num')).textContent = wrong; // changing wrong score on page

    //finding previous accuracy from local storage
    const prevData = loadFromStorage(1); // get previous score data (index 1 since current score is at index 0)
    const prevAccuracy = prevData ? prevData.accuracy : 'last run';
    (document.querySelector('.hero-info')).innerHTML += `<div class="hero-sub">${quizTopic} · ${correct}/${totalQuestions} correct · +${accuracy}% vs ${prevAccuracy}% <br>${correct} threats neutralized. ${wrong} weaknesses flagged for recon.</div>`;


    const xp = calculateXP(scoreData);
    (document.querySelector('.js-xp')).textContent = `+${xp}`; // display calculated XP on page


    // for the conic-gradient dial
    document.querySelector('.js-score-dial').style.background =
        `conic-gradient(var(--cyan) 0% ${accuracy}%, var(--dim) ${accuracy}% 100%)`;

    document.querySelector('.js-score-dial-val').textContent = `${accuracy}%`;

}

export function saveToStorage(scoreData) {
    let data = loadFromStorage();
    data.splice(0, 0, scoreData); //adding score data to the 0th indext , without deletig any previous data 
    console.log(data.length);
    localStorage.setItem('quizScore', JSON.stringify(data));
    generateResults(scoreData);
}
export function loadFromStorage(index) {
    let data = JSON.parse(localStorage.getItem('quizScore')) ||
        [
            {
                correct: 8 ,
                wrong: 2,
                totalAnswered: 10,
                totalQuestions: 10,
                accuracy:80
            }
        ];
    if (index) data = data[index]; // if index provided, return only that score data instead of all data
    return data;
}

