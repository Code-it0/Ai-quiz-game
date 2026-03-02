export function calculateXP(scoreData) {
    const {correct:score,accuracy} = scoreData;
    const baseXP = score * 100;           // 100 per correct answer
    //const timeBonus = score * timeLeft;    // faster = more XP (you'll need to export timeLeft from timer.js)
    const accuracyBonus = accuracy >= 80 ? 200 : accuracy >= 60 ? 100 : 0; // threshold rewards
    const totalXP = baseXP + accuracyBonus;
    return totalXP;
}