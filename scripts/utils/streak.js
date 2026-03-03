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


export function checkDailyStreak() {
    const streakElement = document.querySelector('.js-daily-streak');
    
    // 1. Get Today's Date (Format: "YYYY-MM-DD") to avoid timezone issues
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Retrieve data from Local Storage
    const lastPlayed = localStorage.getItem('lastPlayedDate');
    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

    // 3. The Logic
    if (!lastPlayed) {
        // SCENARIO 1: First time playing ever
        streakCount = 1;
        localStorage.setItem('lastPlayedDate', today);
        localStorage.setItem('streakCount', streakCount);
        
    } else if (lastPlayed === today) {
        // SCENARIO 2: Already played today
        // Do nothing to the count, just show it.
        
    } else {
        // Calculate difference in days
        const date1 = new Date(lastPlayed);
        const date2 = new Date(today);
        const diffTime = Math.abs(date2 - date1); //only positive values return mod type of maths
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); //return next whole number of days (e.g. 1.2 days = 2 days) to avoid timezone issues 

        if (diffDays === 1) {
            // SCENARIO 3: Played Yesterday (Perfect Streak)
            streakCount++;
        } else {
            // SCENARIO 4: Missed a day (Reset)
            streakCount = 1; // Reset to 1 (since they played today)
        }
        
        // Save the new state
        localStorage.setItem('lastPlayedDate', today);
        localStorage.setItem('streakCount', streakCount);
    }

    // 4. Update the UI
    updateStreakUI(streakElement, streakCount);
}

function updateStreakUI(element, count) {
    if (element) {
        element.textContent = `🔥${count.toString().padStart(2, '0')}`; // Display with leading zero if needed
    }
}