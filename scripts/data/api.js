let isVisible = false;

export function toggleVisibility() {
    const input = document.getElementById('apiKeyInput');
    if (!input.value) return; // do nothing if input is empty
    const btn = document.getElementById('toggleBtn');
    isVisible = !isVisible;
    input.type = isVisible ? 'text' : 'password'; //changing from visible to invisible
    btn.textContent = isVisible ? 'HIDE' : 'SHOW'; // changing the button
}

export function displayApiPanel() {
    const groqApiKey = loadApiKey();
    if (!groqApiKey) {
        const apiOverlay = document.querySelector('.api-overlay');
        apiOverlay.style.display = 'flex';
    }
}

export function loadApiKey() {
    const groqApiKey = localStorage.getItem('groqApiKey');
    return groqApiKey;
}

function validateKey(val) { // val is inputbox.value
    const msg = document.getElementById('validationMsg');
    const confirm = document.getElementById('confirmBtn');
    const input = document.getElementById('apiKeyInput');

    input.classList.remove('valid', 'invalid'); //rremove previous classes
    msg.className = 'api-validation';

    if (!val) {
        msg.textContent = ''; //no red / green msg if input box empty
        confirm.disabled = true; //keep button disabled if input is empty
        return;
    }

    // Groq keys start with "gsk_" (format check)
    if (val.startsWith('gsk_') && val.length > 20) {
        msg.textContent = '✓ KEY FORMAT VALID';
        msg.classList.add('ok');
        input.classList.add('valid');
        confirm.disabled = false;
    } else {
        msg.textContent = '✗ INVALID GROQ KEY FORMAT ';
        msg.classList.add('err');
        input.classList.add('invalid');
        confirm.disabled = true;
    }
}

// 1. IMPORTANT: You MUST add the word 'async' before the function 
// so JavaScript knows you are going to use 'await' inside it.
async function confirmKey() {
    const val = document.getElementById('apiKeyInput').value;
    if (!val) return;

    //changing button to verifying
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.classList.add('verify');
    confirmBtn.textContent = '◈   VERIFYING...';

    let failiureMessage;
    try {
        // The Fetch Request: Ping the Groq API to check the key
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${val}`,
                'Content-Type': 'application/json'
            }
        });

        // Check if the API rejected the key
        if (!response.ok) {
            failiureMessage = '✗ &nbsp; INVALID KEY — CHECK AND TRY AGAIN';
            throw new Error('Invalid API Key'); // This jumps straight to the catch block
        }

        // If the code reaches here, the key is 100% valid!
        // Save to localStorage
        localStorage.setItem('groqApiKey', val);

        // Show success state
        confirmBtn.classList.remove('verify');
        confirmBtn.innerHTML = '◈ &nbsp; ACTIVATE AI CORE';
        document.getElementById('apiBody').style.display = 'none';
        document.getElementById('apiFooter').style.display = 'none';
        document.querySelector('.api-privacy').style.display = 'none';

        const success = document.getElementById('apiSuccess');
        success.style.display = 'flex';

        // Close after 2s
        setTimeout(() => {
            closeApiOverlay();
        }, 2000);

    } catch (error) {
        // If the key is invalid OR their Wi-Fi drops, the code lands here safely
        console.error("Verification failed:", error);

        // Show an error message to the user so they know to fix it
        const failedMsg = document.getElementById('api-failed');
        failedMsg.innerHTML = failiureMessage || '✗ &nbsp; CHECK YOUR CONNECTION AND TRY AGAIN';
        failedMsg.style.display = 'block';
        setTimeout(() => failedMsg.style.display = 'none', 3000); //disappear after 6 sec
        // Reset the button text if you changed it earlier
        confirmBtn.classList.remove('verify');
        confirmBtn.innerHTML = '◈ &nbsp; ACTIVATE AI CORE';
        document.getElementById('apiKeyInput').value = '';
        validateKey(''); // this will reset the validation message and disable the button again

    }
}

function skipSetup() {
    document.getElementById('apiOverlay').style.opacity = '0';
    document.getElementById('apiOverlay').style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
        document.getElementById('apiOverlay').style.display = 'none';
    }, 400);
}

function closeApiOverlay() {
    document.getElementById('apiOverlay').style.opacity = '0';
    document.getElementById('apiOverlay').style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
        document.getElementById('apiOverlay').style.display = 'none';
    }, 400);
}

window.validateKey = validateKey;
window.skipSetup = skipSetup;
window.toggleVisibility = toggleVisibility;
window.confirmKey = confirmKey;
