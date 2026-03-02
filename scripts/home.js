export let quizTopic,timePerQue,difficulty,rounds; // getting updated by event listener in quiz.js


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