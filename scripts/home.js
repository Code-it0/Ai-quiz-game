import { checkDailyStreak } from "./utils/streak.js";
import { totalXP } from "./utils/XP.js";
import { generateLevel } from "./utils/level.js";
import { displayApiPanel } from "./data/api.js";
import { go } from '../script.js';
displayApiPanel();


export let quizInfo = {
    quizId: null, // will be assigned when saving quiz info to local storage
    quizTopic: 'Javascript basics',
    timePerQue: '30',
    difficulty: 'Auto-Adapt',
    rounds: '10'
}; // getting updated by event listener in quiz.js
//assigning default values to the variables 

export function generateHomeHtml() {
    const topicInput = document.querySelector('.js-topic-input');
    if (topicInput.value) topicInput.value = ''; //clearing the user's topic input after quiz

    //updating the  hero section
    checkDailyStreak(); //updating the streak badge in hero section

    const xpElement = document.querySelector('.js-total-xp');
    if (xpElement) xpElement.textContent = totalXP(); // updating the totalXP badge in hero section

    const levelElement = document.querySelector('.js-level');
    if (levelElement) levelElement.textContent = generateLevel(); // updating the level badge in hero section
};
generateHomeHtml(); // call the function to update the hero section when home page loads
document.querySelector('.js-launch-btn').addEventListener('click', () => {
    console.log('Selected topic:', quizInfo.quizTopic);
    console.log('Selected time per question:', quizInfo.timePerQue);
    console.log('Selected difficulty:', quizInfo.difficulty);
    console.log('Selected rounds:', quizInfo.rounds);
});

document.querySelector('.js-topic-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (e.target.value.trim() !== '') {
            const launchbtn = document.querySelector('.js-launch-btn');
            go('quiz'); // navigate to quiz page 
            launchbtn.click();
            console.log('click');
        }
    }
});

//setting event listners for api overlay :

document.querySelector('.api-input-field').addEventListener('input', e => {
    validateKey(e.target.value);
});
document.querySelector('.api-input-field').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.querySelector('.api-confirm').click();
});

document.querySelector('.api-toggle').addEventListener('click', () => {
    toggleVisibility();
});

document.querySelector('.api-skip').addEventListener('click', () => {
    skipSetup();
});

document.querySelector('.api-confirm').addEventListener('click', () => {
    confirmKey();
});

