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
  if (quizId) data = data[data.length-quizId]; // if index provided, return only that score data instead of all data 
  // newest item at index 0 hence quizID 15 is at 0 due to data.splice(0,0,..);
  return data;
}