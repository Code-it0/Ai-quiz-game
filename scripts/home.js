import { checkDailyStreak } from "./utils/streak.js";
import { totalXP } from "./utils/XP.js";
import { generateLevel } from "./utils/level.js";

export let quizTopic, timePerQue, difficulty, rounds; // getting updated by event listener in quiz.js
//assigning default values to the variables 
quizTopic ='Javascript basics';
timePerQue = '5';
difficulty = 'Auto-Adapt';
rounds ='10';

//updating the hero section
checkDailyStreak(); //updating the streak badge in hero section

const xpElement = document.querySelector('.js-total-xp');
if (xpElement) xpElement.textContent = totalXP(); // updating the totalXP badge in hero section

const levelElement = document.querySelector('.js-level');
if (levelElement) levelElement.textContent = generateLevel(); // updating the level badge in hero section

document.querySelector('.js-launch-btn').addEventListener('click', () => {
    quizTopic = document.querySelector('.js-topic-input').value.trim() || 'Javascript-basics';// get the quiz topic from the input field, default to 'Javascript-basics' if empty

    timePerQue = document.querySelector('.js-time-input').value.trim('SEC') || '5'; // get time per question from input, default to 5 seconds
    timePerQue = parseInt(timePerQue); //looks for a number from left to righ , stops as soon as gets a non numneric character .... 30 SEC -> 30

    difficulty = document.querySelector('.js-diff-input').value.trim() || 'Auto-Adapt';

    rounds = document.querySelector('.js-rounds-input').value.trim() || '10';

    console.log('Selected topic:', quizTopic);
    console.log('Selected time per question:', timePerQue);
    console.log('Selected difficulty:', difficulty);
    console.log('Selected rounds:', rounds);
});