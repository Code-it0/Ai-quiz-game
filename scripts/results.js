

export function generateResults(scoreData) {
    console.log('inside results');
}

export function saveToStorage (scoreData) {
    localStorage.setItem('quizScore', JSON.stringify(scoreData));
    generateResults(scoreData);
}