
export function saveToStorage(scoreData) {
  let Sdata = loadFromStorage();
  scoreData.quizId = Sdata.length + 1; // assign quizId based on current length of stored data (1 for first quiz, 2 for second quiz etc.)
  Sdata.push(scoreData); //adding score data without deletig any previous data 
  localStorage.setItem('quizScore', JSON.stringify(Sdata));
}
export function loadFromStorage() {
  let data = JSON.parse(localStorage.getItem('quizScore')) ||
    [
      {
        quizId: 1,
        correct: 8,
        wrong: 2,
        totalAnswered: 10,
        totalQuestions: 10,
        accuracy: 80,
        averageTime: 2,
        xp: 1000,
        maxStreak: 5
      }
    ];
  return data;
}
export function loadFromStorageById(quizId) {
  let data = loadFromStorage();
  if (quizId === 'recent') data = data.slice(-1)[0]; // if 'recent' specified, return only the most recent score data
  else if (quizId === 'secondLast') data = data[data.length - 2]; // if 'secondLast' specified, return the second most recent score data
  else data = data[quizId - 1]; // if quizId provided, return only that score data instead of all data
  return data;
}



export function SaveQuizINfo(quizInfo) {
  let data = loadQuizInfo();
  quizInfo.quizId = data.length + 1; // assigning a quizId based on the current length of stored quiz info (ensures unique quizId for each quiz)
  data.push(quizInfo);
  localStorage.setItem('quizInfo', JSON.stringify(data));
}

export function loadQuizInfo() {
  let data = JSON.parse(localStorage.getItem('quizInfo')) ||
    [
      {
        quizId: 1,
        quizTopic: 'Javascript basics',
        timePerQue: '5',
        difficulty: 'Auto-Adapt',
        rounds: '10'
      }
    ];
  return data;
}

export function loadQuizInfoById(quizId) {
  let data = loadQuizInfo();
  if (quizId === 'recent') return data[data.length - 1];
  else data = data[quizId - 1]; // if index provided, return only that quiz data instead of all data 
  return data;
}



let QuestionLog = [];

export function questionLogPush(entry) {
  QuestionLog.push(entry);
}

export function SaveQuestionLog() {
  let questionLog = LoadQuestionLog();
  questionLog.push(QuestionLog); // addingk the question data at the end of the array
  localStorage.setItem('questionLog', JSON.stringify(questionLog));
  QuestionLog = []; //empting the global array once data saved
}
export function LoadQuestionLog() {
  let questionLog = JSON.parse(localStorage.getItem('questionLog')) || [
    [
      { question: "What does JSON stand for?", correct: true, timeTaken: 1, skipped: false },
      { question: "Which method adds to end of array?", correct: false, timeTaken: 4, skipped: false },
      { question: "What does typeof null return?", correct: false, timeTaken: 0, skipped: true },
      { question: "Which keyword declares block-scoped var?", correct: true, timeTaken: 2, skipped: false },
      { question: "Output of 0.1 + 0.2 === 0.3?", correct: false, timeTaken: 5, skipped: false },
    ]
  ];
  return questionLog;
}
export function LoadQuestionLogById(quizId) {
  let questionLog = LoadQuestionLog();
  questionLog = questionLog[quizId - 1];
  return questionLog;
}

export function getReportCard() {
  let reportCard = [];

  let scoreData = loadFromStorage();
  let quizInfo = loadQuizInfo();
  quizInfo = quizInfo.slice(-10).map(quiz => { return [quiz.quizTopic, quiz.difficulty]; }); //array of 10 or less objects
  scoreData = scoreData.slice(-10).map(data => data.accuracy); // array of 10 or less acccuracy
  quizInfo.map((quiz, index) => {
    reportCard.push({
      topic: quiz[0],
      difficulty: quiz[1],
      accuracy: scoreData[index]
    });
  });
  return reportCard;
}