export const questions = [
  {
    question: "What does JSON stand for?",
    options: [
      "Java Syntax Object Notation",
      "JavaScript Object Notation",
      "Java Standard Output Node",
      "JavaScript Oriented Network"
    ],
    correct_answer: "JavaScript Object Notation",
    difficulty_level: "easy"
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: ["push()", "pop()", "shift()", "splice()"],
    correct_answer: "push()",
    difficulty_level: "easy"
  },
  {
    question: "What does 'typeof null' return in JavaScript?",
    options: ["null", "undefined", "object", "string"],
    correct_answer: "object",
    difficulty_level: "medium"
  }
];

export function SaveQuizINfo(quizInfo) {
  let data = loadQuizInfo();
  quizInfo.quizId = data.length + 1; // assigning a quizId based on the current length of stored quiz info (ensures unique quizId for each quiz)
  //for example if there are already 2 quiz info stored, the next quiz info will get quizId 3
  console.log(quizInfo);
  data.splice(0, 0, quizInfo); //adding score data to the 0th indext , without deletig any previous data 
  console.log(data.length);
  localStorage.setItem('quizInfo', JSON.stringify(data));
}
export function loadQuizInfo(quizId) {
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
  if (quizId) data = data[data.length - quizId]; // if index provided, return only that score data instead of all data 
  // newest item at index 0 hence quizID 15 is at 0 due to data.splice(0,0,..);
  return data;
}

[
  { question: "What does JSON stand for?", correct: true, timeTaken: 1, skipped: false },
  { question: "Which method adds to array?", correct: true, timeTaken: 2, skipped: false },
  { question: "typeof null return?", correct: false, timeTaken: 4, skipped: false },
]

let QuestionLog = [];

export function questionLogPush(entry) {
  console.log(entry);
  QuestionLog.push(entry);
  console.log('pushing entry:', JSON.stringify(entry));
}

export function SaveQuestionLog() {
  let questionLog = LoadQuestionLog();
  console.log(questionLog);
  questionLog.splice(0, 0, QuestionLog); //adding global question log questions data to the 0th index , without deletig any previous data 
  console.log(questionLog.length);
  localStorage.setItem('questionLog', JSON.stringify(questionLog));
  QuestionLog = []; //empting the global array once data saved
}
export function LoadQuestionLog(quizId) {
  let questionLog = JSON.parse(localStorage.getItem('questionLog')) || [
    [
      { question: "What does JSON stand for?", correct: true, timeTaken: 1, skipped: false },
      { question: "Which method adds to end of array?", correct: false, timeTaken: 4, skipped: false },
      { question: "What does typeof null return?", correct: false, timeTaken: 0, skipped: true },
      { question: "Which keyword declares block-scoped var?", correct: true, timeTaken: 2, skipped: false },
      { question: "Output of 0.1 + 0.2 === 0.3?", correct: false, timeTaken: 5, skipped: false },
    ]
  ];
  console.log(questionLog.length);
  if (quizId) questionLog = questionLog[questionLog.length - quizId];
  return questionLog;
}
