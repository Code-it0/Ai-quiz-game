import { getReportCard } from "./storage.js";
import { startLoadingPage, stopLoadingPage, errorToast, loadedToast } from "../utils/loader.js";
import { loadApiKey } from './api.js';

export async function fetchQuestions(topic, difficulty, rounds) {
  startLoadingPage(); // Show loading screen while fetching questions
  try {
    const GROQ_API_KEY = loadApiKey();
    if (!GROQ_API_KEY) throw new Error("API key not registered"); // Load API key or throw an error to start the quiz with default questions  if not found

    let prompt;
    let autoAdaptFlag = 0;
    if (difficulty.toUpperCase() === "AUTO-ADAPT") {
      //get the report cart  = HistoryTopic: JavaScript, Difficulty: Medium, Accuracy: 40%. Topic: React, Difficulty: Easy, Accuracy: 100%
      const userHistory = getReportCard(); //array of objects where each object represent 1 quiz game
      prompt = generateAutoAdaptPrompt(topic, rounds, userHistory);
      autoAdaptFlag = 1;
    } else {
      // Use your normal, hardcoded prompt
      prompt = generateNormalPrompt(topic, difficulty, rounds);
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and great at JSON
        messages: [
          {
            role: 'system',
            content: 'You are a quiz generator. You must output ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        // This tells Groq to force the output into a JSON object
        response_format: { "type": "json_object" },
        temperature: 0.7
      })
    });

    const data = await response.json();
    // Groq/OpenAI structure: choices[0].message.content
    const text = data.choices[0].message.content;

    // If the model wraps the array in an object (e.g., {"questions": [...]})
    // you might need to adjust this, but usually, it returns the array directly.

    await stopLoadingPage(loadedToast); //wait foor loading screen display : none promise to be resolved before going on with returning question generating question , 
    if (autoAdaptFlag) {
      const { determined_difficulty, questions: aiQuestions } = JSON.parse(text);
      console.log("Groq decided this quiz should be:", determined_difficulty);
      autoAdaptDifficulty = determined_difficulty;
      return aiQuestions; //replace default questions with fetched questions
    }
    else {
      const { questions: aiQuestions } = JSON.parse(text);
      return aiQuestions; //replace default questions with fetched questions

    }
  } catch (error) {
    console.log('Error fetching questions:', error);
    await stopLoadingPage(errorToast); // stop the loading screen , let the default questions run
    return;
  }
}
export let autoAdaptDifficulty = 'MEDIUM'; //default set to Easy
export let defaultQuestions = [
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
  },
  {
    question: "Which operator is used to check both the value and the data type?",
    options: ["==", "=", "===", "!="],
    correct_answer: "===",
    difficulty_level: "easy"
  },
  {
    question: "What object represents the eventual completion or failure of an asynchronous operation?",
    options: ["Callback", "Closure", "Promise", "Async"],
    correct_answer: "Promise",
    difficulty_level: "medium"
  },
  {
    question: "A function bundled together with references to its surrounding state is called a...",
    options: ["Closure", "Lexical Environment", "Scope Chain", "Hoisting"],
    correct_answer: "Closure",
    difficulty_level: "hard"
  },
  {
    question: "Which method creates a new array populated with the results of calling a function on every element?",
    options: ["filter()", "forEach()", "reduce()", "map()"],
    correct_answer: "map()",
    difficulty_level: "medium"
  },
  {
    question: "Which document method allows you to select an HTML element by its specific ID?",
    options: ["querySelector()", "getElementById()", "getElementsByClass()", "selectId()"],
    correct_answer: "getElementById()",
    difficulty_level: "easy"
  },
  {
    question: "What is the correct syntax for referring to an external script called 'app.js'?",
    options: ["<script href='app.js'>", "<script name='app.js'>", "<script src='app.js'>", "<script file='app.js'>"],
    correct_answer: "<script src='app.js'>",
    difficulty_level: "easy"
  }
  , {
    question: "What will console.log(typeof NaN) output?",
    options: ["NaN", "number", "undefined", "string"],
    correct_answer: "number",
    difficulty_level: "hard"
  }
];

function generateNormalPrompt(topic, difficulty, rounds) {
  return `Generate ${rounds} ${difficulty} multiple-choice quiz questions about ${topic}.
        You must return a JSON object with a single root key named exactly "questions". 
        The value of "questions" must be an array of objects following this exact schema:
        {
        "questions": [
          {
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "correct_answer": "...",
            "difficulty_level": "${difficulty}"
          }
        ]
      }`;
}

function generateAutoAdaptPrompt(topic, rounds, reportCardArray) {

  // reportCardArray looks like: [{ topic: "JS", diff: "hard", acc: 40 }, ...]

  return `You are an adaptive quiz generator. The user wants a ${rounds}-question quiz on "${topic}".
  
  Here is their recent performance history provided as a JSON array: 
  ${JSON.stringify(reportCardArray)}
  
  Based on this exact history, determine if their next quiz should be "easy", "medium", or "hard". 
  - If they are consistently scoring >80% accuracy on similar topics, make it harder.
  - If they are scoring <50% accuracy on similar topics, make it easier.
  - If there is no relevant history for this topic, default to "medium".
  
  You MUST return a JSON object with EXACTLY two root keys:
  1. "determined_difficulty": The single word "easy", "medium", or "hard".
  2. "questions": An array of ${rounds} question objects matching that difficulty.
  
  Example format:
  {
    "determined_difficulty": "medium",
    "questions": [ { "question": "...", "options": ["...","...","...","..."], "correct_answer": "...", "difficulty_level": "medium" } ]
  }`;
}

