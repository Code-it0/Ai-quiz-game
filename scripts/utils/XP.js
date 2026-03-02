import{ timeleft} from './timer.js';
export function calculateXP(scoreData) {
    const {correct:score,accuracy} = scoreData;
    const baseXP = score * 100;           // 100 per correct answer
    const timeBonus = score * timeleft;    // faster = more XP (only for correct answers)
    const accuracyBonus = accuracy >= 80 ? 200 : accuracy >= 60 ? 100 : 0; // threshold rewards
    const totalXP = baseXP + accuracyBonus + timeBonus; // add time bonus to total XP
    return totalXP;
}