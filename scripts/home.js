import { checkDailyStreak } from "./utils/streak.js";
import { totalXP } from "./utils/XP.js";
import { generateLevel } from "./utils/level.js";

export let quizInfo = {
    quizId : null, // will be assigned when saving quiz info to local storage
    quizTopic: 'Javascript basics',
    timePerQue: '5',
    difficulty: 'Auto-Adapt',
    rounds: '10'
}; // getting updated by event listener in quiz.js
//assigning default values to the variables 


//updating the hero section
checkDailyStreak(); //updating the streak badge in hero section

const xpElement = document.querySelector('.js-total-xp');
if (xpElement) xpElement.textContent = totalXP(); // updating the totalXP badge in hero section

const levelElement = document.querySelector('.js-level');
if (levelElement) levelElement.textContent = generateLevel(); // updating the level badge in hero section

document.querySelector('.js-launch-btn').addEventListener('click', () => {
    quizInfo.quizTopic = document.querySelector('.js-topic-input').value.trim() || 'Javascript-basics';// get the quiz topic from the input field, default to 'Javascript-basics' if empty

    let timeInput = document.querySelector('.js-time-input').value.replace('SEC', '').trim() || '5';
    // get time per question from input, default to 5 seconds



    quizInfo.timePerQue = 5;  //parseInt(quizInfo.timePerQue);  //looks for a number from left to righ , stops as soon as gets a non numneric character .... 30 SEC -> 30



    quizInfo.difficulty = document.querySelector('.js-diff-input').value.trim() || 'Auto-Adapt';

    quizInfo.rounds = document.querySelector('.js-rounds-input').value.trim() || '10';

    console.log('Selected topic:', quizInfo.quizTopic);
    console.log('Selected time per question:', quizInfo.timePerQue);
    console.log('Selected difficulty:', quizInfo.difficulty);
    console.log('Selected rounds:', quizInfo.rounds);
});