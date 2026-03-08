import { timeleft } from './timer.js';
import { loadFromStorage } from '../data/storage.js';


let streakXP = 10;
export function calculateXP(scoreData, streak) {
    const { correct: score, accuracy } = scoreData;
    const baseXP = score * 100;           // 100 per correct answer
    const timeBonus = score * timeleft;    // faster = more XP (only for correct answers)
    const accuracyBonus = accuracy >= 80 ? 200 : accuracy >= 60 ? 100 : 0; // threshold rewards
    const totalXP = baseXP + accuracyBonus + timeBonus; // add time bonus to total XP
    if (streak > 1) { //start bouns from 2 in a row
        let streakMultiplier = 0.1 * Math.min(streak, 10);  //if streak is 10(max) then score doubled
        streakXP += Math.round(totalXP * streakMultiplier); //only stores points of streak
    }
    return totalXP + streakXP;
}

export function totalXP(){
    const data = loadFromStorage(); // load current score data (index 0 since it's the most recent)
    let totalxp=0;
    data.forEach((entry) => {
        totalxp += entry.xp;
    });
    return totalxp;
}

export function resetStreakXP() {
    streakXP = 10; // Or 0, depending on what your baseline should be!
}