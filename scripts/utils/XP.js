import { timeleft } from './timer.js';
import { quizInfo } from '../home.js';
import { loadFromStorage } from '../data/storage.js';


let streakXP = 10; // Tracks accumulated streak XP

export function calculateXP(scoreData, streak) {
    const { correct: score, accuracy } = scoreData;

    const baseXP = score * 70; // 70 XP per correct answer
    
    // Cap time ratio to 1 max, giving up to 30 XP bonus per question
    const timeRatio = Math.min(1, Math.max(0, timeleft / (quizInfo.timePerQue * 4)));
    const timeBonus = score * timeRatio * 30; 

    // Scaled accuracy thresholds
    const accuracyBonus = accuracy >= 80 ? 100 : accuracy >= 60 ? 50 : 0; 

    // Base + Time (we keep accuracy out so it doesn't inflate the streak)
    const baseTotalXP = baseXP + timeBonus; 

    if (streak > 1) { // Streak bonus starts at 2
        // Max 1.0 (100% bonus) at streak 10
        let streakMultiplier = 0.1 * Math.min(streak, 10);  
        streakXP += Math.round(baseTotalXP * streakMultiplier); // Add to running total
    }

    // Final total
    return Math.floor(baseTotalXP + accuracyBonus + streakXP);
}

export function totalXP() {
    const data = loadFromStorage(); // load current score data (index 0 since it's the most recent)
    if (data.length === 1) return 0; // if only the default data is present, reset to empty array before saving new data
    let totalxp = 0;
    data.forEach((entry) => {
        totalxp += entry.xp;
    });
    return totalxp;
}

export function resetStreakXP() {
    streakXP = 10; // Or 0, depending on what your baseline should be!
}