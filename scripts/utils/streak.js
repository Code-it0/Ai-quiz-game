export function updateStreak(streak) {
    // --- 1. GET ALL ELEMENTS ---
    const comboDiv = document.querySelector('.js-combo-display');
    console.log('streak:',streak);
    // Elements for Section 2
    const streakBadege = document.querySelector('.streak-badge');
    const fireEl = document.querySelector('.streak-fire');
    const txtEl = document.querySelector('.js-streak-txt');
    const msgEl = document.querySelector('.js-streak-msg');

    // --- 2. RESET STATE ---
    comboDiv.classList.remove('low-streak', 'med-streak', 'high-streak', 'god-streak');

    if (streak === 0) {
        comboDiv.style.display = 'none';
        streakBadege.style.display = 'none';
        if(fireEl) fireEl.textContent = ''; 
        if(txtEl) txtEl.textContent = ''; 
        if(msgEl) msgEl.textContent = '';
        return;
    }

    // --- 3. DEFINE DATA BASED ON STREAK ---
    let emoji = '';
    let mainText = '';
    let subText = '';
    let cssClass = '';

    if (streak <= 2) {
        cssClass = 'low-streak';
        emoji = '👍';
        mainText = `x${streak} COMBO`;
        subText = 'GOOD START';
    } else if (streak <= 5) {
        cssClass = 'med-streak';
        emoji = '🔥';
        mainText = `x${streak} COMBO`;
        subText = 'KEEP GOING';
    } else if (streak <= 10) {
        cssClass = 'high-streak';
        emoji = '⚡️';
        mainText = `x${streak} SUPER`;
        subText = 'UNSTOPPABLE!';
    } else {
        cssClass = 'god-streak';
        emoji = '🚀';
        mainText = `x${streak} GODLIKE`;
        subText = 'LEGENDARY!';
    }

    // --- 4. UPDATE SECTION 1 (FIXED: Using innerHTML to keep styling) ---
    comboDiv.style.display = 'block'; // Ensure it's visible (e.g. flex/block)
    streakBadege.style.display = 'block';
    comboDiv.classList.add(cssClass);
    
    // Calculate the bonus string separately for cleanliness
    const bonusText = streak >= 10 ? '2x' : (streak <= 1 ? '+0' : (streak * 10) + '%'); //20% only min

    // We inject HTML tags (span, strong) so your CSS works again
    comboDiv.innerHTML = `🔥 COMBO x ${streak} · ${bonusText} BONUS XP`;

    // --- 5. UPDATE SECTION 2 (Separate Elements) ---
    if (fireEl) fireEl.textContent = emoji;
    if (txtEl)  txtEl.textContent = mainText;
    if (msgEl)  msgEl.textContent = subText;
}