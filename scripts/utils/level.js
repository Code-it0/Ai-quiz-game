import { totalXP } from "./XP.js";
export function generateLevel(){
    const xp = totalXP(); // load current score data (index 0 since it's the most recent)
    // Implement level generation logic based on XP
    let level = 1;
    let basexp =500;
    let temp = Math.floor(basexp * level * level);
    while(xp/temp >=1 ){ //stops when not divisible
        level++;
        temp = Math.floor(basexp * level * level); // quadratic level up requirement (500 for level 2, 2000 for level 3, 4500 for level 4,8000 for level 5 etc.)
    }
    return level; //(level 1 for 0-499 XP, level 2 for 500-1999 XP etc.)
}
