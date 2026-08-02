/* ==========================================================================
   1. SHARED LOGIC & ROUTER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('clapBtn')) {
        initClap();
        initBugs();
        initSecret();
    }
    if (document.querySelector('.fitness-mode')) {
        initFitness();
    }
    if (document.querySelector('.music-player')) {
        initMusic();
    }
    if (document.querySelector('.contact-trigger')) {
        initContact();
    }
    if (document.querySelector('.bento-grid')) {
        initScrollReveal(); 
        initTilt();
    }
});

function initContact() {
    const triggers = document.querySelectorAll('.contact-trigger');
    const modal = document.querySelector('.modal-overlay');
    const closeBtn = document.querySelector('.close-modal');
    if (!modal) return;
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    });
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}

/* ==========================================================================
   2. INDEX PAGE LOGIC
   ========================================================================== */

function initClap() {
    const btn = document.getElementById('clapBtn');
    const feedback = document.getElementById('clapFeedback');
    const clapSound = new Audio('sounds/clap.wav'); 
    clapSound.volume = 0.6; 
    const messages = ["Thanks for the love! 👏🏽", "You rock! 🎸", "High five! 🖐🏽", "Appreciate the support!", "Coding fueled by claps. ☕", "Look at you go! 🚀"];
    btn.addEventListener('click', () => {
        clapSound.currentTime = 0;
        clapSound.play().catch(e => console.log("Audio autoplay blocked"));
        feedback.innerText = messages[Math.floor(Math.random() * messages.length)];
        feedback.style.opacity = '1';
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
            feedback.style.opacity = '0';
        }, 1500);
    });
}

function initSecret() {
    const input = document.getElementById('secretInput');
    if(!input) return;
    input.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase().trim();
        if (val === 'west') {
            const body = document.body;
            const subtitle = document.querySelector('.hero-subtitle');
            const bugContainer = document.getElementById('bug-container');
            if(bugContainer) bugContainer.innerHTML = '';
            body.classList.toggle('lakers-mode');
            if (body.classList.contains('lakers-mode')) {
                if(subtitle) subtitle.innerText = "17x World Champions";
            } else {
                if(subtitle) subtitle.innerText = "Developer • Builder • Lifter"; 
            }
            e.target.value = ""; 
            e.target.blur(); 
        }
    });
}

function initBugs() {
    const container = document.getElementById('bug-container');
    if(!container) return;
    const style = document.createElement('style');
    style.innerHTML = `@keyframes bugScuttle { 0% { transform: rotate(-10deg) translateY(0); } 50% { transform: rotate(10deg) translateY(-2px); } 100% { transform: rotate(-10deg) translateY(0); } }`;
    document.head.appendChild(style);
    function createBug() {
        const bug = document.createElement('div');
        bug.classList.add('crawler');
        const type = Math.random() > 0.5 ? '🕷️' : '🐜';
        bug.innerHTML = `<span style="display:block; animation: bugScuttle 0.2s infinite linear;">${type}</span>`;
        const side = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        const offset = 60; 
        if (side === 0) { startX = Math.random() * window.innerWidth; startY = -offset; endX = Math.random() * window.innerWidth; endY = window.innerHeight + offset; } 
        else if (side === 1) { startX = window.innerWidth + offset; startY = Math.random() * window.innerHeight; endX = -offset; endY = Math.random() * window.innerHeight; } 
        else if (side === 2) { startX = Math.random() * window.innerWidth; startY = window.innerHeight + offset; endX = Math.random() * window.innerWidth; endY = -offset; } 
        else { startX = -offset; startY = Math.random() * window.innerHeight; endX = window.innerWidth + offset; endY = Math.random() * window.innerHeight; }
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const rotation = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90;
        bug.style.left = startX + 'px';
        bug.style.top = startY + 'px';
        bug.style.transform = `rotate(${rotation}deg)`;
        const duration = Math.random() * 5 + 5;
        bug.style.transition = `all ${duration}s linear`;
        
        bug.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = bug.getBoundingClientRect();
            bug.style.transition = 'none';
            bug.style.left = rect.left + 'px';
            bug.style.top = rect.top + 'px';
            bug.style.transform = `${bug.style.transform} scaleY(0.2) scaleX(1.5)`;
            bug.style.filter = 'grayscale(1) brightness(0.5) drop-shadow(0 0 2px #00ff41)';
            bug.style.opacity = '0.7';
            bug.style.pointerEvents = 'none';
            setTimeout(() => {
                bug.style.transition = 'opacity 1s ease-out';
                bug.style.opacity = '0';
                setTimeout(() => bug.remove(), 1000);
            }, 500);
        });

        container.appendChild(bug);
        requestAnimationFrame(() => { bug.style.left = endX + 'px'; bug.style.top = endY + 'px'; });
        setTimeout(() => { if(bug.parentNode) bug.remove(); }, duration * 1000);
    }
    setInterval(createBug, 2000);
}

/* ==========================================================================
   3. ABOUT PAGE LOGIC
   ========================================================================== */

function initMusic() {
    const title = document.getElementById('title');
    const artist = document.getElementById('artist');
    const cover = document.getElementById('cover');
    const progress = document.getElementById('progress');
    const playerContainer = document.querySelector('.music-player'); 
    const API_KEY = '402943f37e8a453abcc29127065d7cf0'; 
    const USERNAME = 'wil_guzman'; 
    async function fetchTrack() {
        try {
            const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1`;
            const response = await fetch(url);
            const data = await response.json();
            if (!data.recenttracks || !data.recenttracks.track.length) throw new Error("No tracks found");
            const track = data.recenttracks.track[0];
            const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
            title.innerText = track.name;
            artist.innerText = track.artist['#text'];
            const imgUrl = track.image[3]['#text'];
            if (imgUrl) cover.src = imgUrl;
            if (isPlaying) {
                if(playerContainer) playerContainer.classList.add('play');
                title.style.color = "#00e676";
                if(progress) progress.classList.add('pulsing-bar');
            } else {
                if(playerContainer) playerContainer.classList.remove('play');
                title.style.color = "#fff"; 
                if(progress) { progress.style.width = "0%"; progress.classList.remove('pulsing-bar'); }
            }
        } catch (error) { console.error("Last.fm Error:", error); }
    }
    fetchTrack();
    setInterval(fetchTrack, 10000);
}

/* ==========================================================================
   4. FITNESS PAGE LOGIC (3-On / 1-Off Dynamic Split)
   ========================================================================== */

// 4-day repeating cycle setup
const CYCLE_START_DATE = new Date(2026, 7, 3); // August 3, 2026 (Diff = 0)
CYCLE_START_DATE.setHours(0, 0, 0, 0);

// Mapped exactly to the modulo result (0, 1, 2, 3)
const cycleRoutine = {
    0: ['d1-ex1', 'd1-ex2', 'd1-ex3', 'd1-ex4', 'd1-ex5', 'd-forearm'],                  // Diff 0: Chest / Tris + Forearms
    1: ['d2-ex1', 'd2-ex2', 'd2-ex3', 'd2-ex4', 'd2-ex5', 'd2-ex6'],                     // Diff 1: Back / Biceps
    2: ['d3-ex1', 'd3-ex2', 'd3-ex3', 'd3-ex4', 'd3-ex5', 'd3-ex6', 'd3-ex7', 'd-forearm'],// Diff 2: Legs / Shoulders + Forearms
    3: []                                                                                // Diff 3: Rest Day
};

const cycleHeaders = {
    0: "Chest & Triceps",
    1: "Back & Biceps",
    2: "Legs & Shoulders",
    3: "Rest Day"
};

const exerciseDB = {
    // Day 1: Chest & Triceps
    'd1-ex1': 'Dumbbell Bench Press', 
    'd1-ex2': 'Incline Dumbbell Press', 
    'd1-ex3': 'Dumbbell Chest Fly', 
    'd1-ex4': 'Skull Crushers', 
    'd1-ex5': 'Tricep Rope Pushdowns',

    // Day 2: Back & Biceps
    'd2-ex1': 'Lat Pulldowns', 
    'd2-ex2': 'Seated Cable Rows', 
    'd2-ex3': 'V-Bar Pulldown', 
    'd2-ex4': 'Preacher Curls', 
    'd2-ex5': 'Rope Hammer Curls', 
    'd2-ex6': 'Shoulder Shrugs',

    // Day 3: Legs & Shoulders
    'd3-ex1': 'Barbell Squat', 
    'd3-ex2': 'Dumbbell RDLs', 
    'd3-ex3': 'Leg Extension', 
    'd3-ex4': 'Dumbbell Shoulder Press', 
    'd3-ex5': 'Dumbbell Lateral Raises', 
    'd3-ex6': 'Face Pulls', 
    'd3-ex7': 'Standing Calf Raises',
    'd3-ex8': 'Seated Calf Raises', // Alternating option

    // Custom / Recurring
    'd-forearm': 'Forearm Circuit',
    'custom': 'Custom Exercise'
};

let currentDate = new Date();
let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);
let isEditMode = false;

let globalLog = JSON.parse(localStorage.getItem('workoutLog_v3')) || {}; 
let globalRoutine = JSON.parse(localStorage.getItem('customRoutine_v2')) || {};
let globalHeaders = JSON.parse(localStorage.getItem('customHeaders_v2')) || {};
let globalNames = JSON.parse(localStorage.getItem('customNames_v2')) || {}; 

// Helper function to map any date to cycle day 0, 1, 2, or 3
function getCycleDay(date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffInDays = Math.round((targetDate.getTime() - CYCLE_START_DATE.getTime()) / (1000 * 3600 * 24));
    return ((diffInDays % 4) + 4) % 4;
}

// Helper function to retrieve exercises and dynamically alternate calf raises
function getExercisesForDate(dateObj, dateKey, cycleNum) {
    // If user saved a custom edit for this specific day, load that instead of generating
    if (globalRoutine[dateKey]) {
        return [...globalRoutine[dateKey]];
    }

    let exercises = cycleRoutine[cycleNum] ? [...cycleRoutine[cycleNum]] : [];
    
    // On Legs & Shoulders (Cycle Day 2), calculate if we need Seated or Standing Calf Raises
    if (cycleNum === 2) {
        const diffInDays = Math.round((dateObj.getTime() - CYCLE_START_DATE.getTime()) / (1000 * 3600 * 24));
        const cycleNumber = Math.floor(diffInDays / 4);
        
        // If it's an odd cycle number (e.g., Cycle 1, 3, 5), swap to Seated. (Cycle 0 gets Standing).
        if (Math.abs(cycleNumber % 2) === 1) {
            const calfIndex = exercises.indexOf('d3-ex7');
            if (calfIndex !== -1) {
                exercises[calfIndex] = 'd3-ex8'; // Swap 'Standing' to 'Seated'
            }
        }
    }
    
    return exercises;
}

function initFitness() {
    renderCalendar();
    loadDay(selectedDate);
}

window.renderCalendar = function() {
    const grid = document.getElementById('main-calendar');
    if (!grid) return;
    grid.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const titleEl = document.getElementById('cal-month-title');
    if(titleEl) titleEl.innerText = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));
    
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell'; 
        cell.innerText = d;
        
        const dateObj = new Date(year, month, d);
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cycleNum = getCycleDay(dateObj);
        
        // Fetch dynamically alternated exercises
        const exercisesForDay = getExercisesForDate(dateObj, dateKey, cycleNum);
        const isRestDay = exercisesForDay.length === 0;

        if (globalLog[dateKey] && Object.keys(globalLog[dateKey]).length > 0) {
            cell.classList.add('has-log'); 
        } else if (isRestDay) {
            cell.classList.add('rest-day'); 
        } else {
            cell.classList.add('no-log');   
        }

        if (d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            cell.classList.add('active-day');
        }
        
        cell.onclick = () => { 
            selectedDate = new Date(year, month, d); 
            selectedDate.setHours(0,0,0,0);
            renderCalendar(); 
            loadDay(selectedDate); 
        };
        grid.appendChild(cell);
    }
}

window.changeMonth = function(dir) { currentDate.setMonth(currentDate.getMonth() + dir); renderCalendar(); }
window.goToToday = function() { const now = new Date(); now.setHours(0,0,0,0); currentDate = new Date(now); selectedDate = new Date(now); renderCalendar(); loadDay(selectedDate); }
window.changeSelectedDay = function(dir) { selectedDate.setDate(selectedDate.getDate() + dir); selectedDate.setHours(0,0,0,0); currentDate = new Date(selectedDate); renderCalendar(); loadDay(selectedDate); }

function loadDay(date) {
    const display = document.getElementById('selected-date-display');
    const dateKey = date.toISOString().split('T')[0];
    const cycleNum = getCycleDay(date);
    
    if (display) display.innerText = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    // Fetch dynamically alternated exercises
    const exercises = getExercisesForDate(date, dateKey, cycleNum);
    const headerTitle = globalHeaders[dateKey] || cycleHeaders[cycleNum] || "Rest Day";
    const headerBadge = document.getElementById('active-day-header');
    
    if(isEditMode && headerBadge) headerBadge.innerHTML = `<input type="text" class="editable-input" value="${headerTitle}" onchange="updateHeader('${dateKey}', this.value)">`;
    else if(headerBadge) headerBadge.innerText = headerTitle;
    
    const table = document.getElementById('active-table');
    const restMsg = document.getElementById('rest-message');
    const saveBtns = [document.getElementById('save-btn')];
    
    if (exercises.length === 0 && !isEditMode && !globalLog[dateKey]) {
        if(table) table.style.display = 'none'; 
        if(restMsg) restMsg.style.display = 'block';
        saveBtns.forEach(b => { if(b) b.style.display = 'none'; });
    } else {
        if(table) table.style.display = 'table'; 
        if(restMsg) restMsg.style.display = 'none';
        saveBtns.forEach(b => { if(b) b.style.display = 'block'; });
        renderTable(exercises, dateKey);
    }
}

function getLastSessionData(currentDateKey, exID) {
    const pastDates = Object.keys(globalLog).filter(d => d < currentDateKey).sort().reverse();
    for (let d of pastDates) {
        if (globalLog[d][exID] && globalLog[d][exID].length > 0) {
            return globalLog[d][exID];
        }
    }
    return null;
}

function renderTable(exercises, dateKey) {
    const tbody = document.getElementById('active-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    exercises.forEach((exID, index) => {
        const exName = exerciseDB[exID] || globalNames[exID] || 'Unknown';
        
        if (exName === "Forearm Circuit") {
            const parentRow = document.createElement('tr');
            parentRow.className = 'ex-header-row';
            const btnText = isEditMode ? "Done" : "✎ Edit";
            const btnStyle = "margin: 0; padding: 4px 14px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; border: 1px solid #B8860B; border-radius: 20px; font-weight: 800; font-size: 0.75rem; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 10px rgba(255, 215, 0, 0.4); transition: all 0.3s ease;";
            
            let parentNameHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div class="ex-title">Forearm Circuit</div><button class="action-mode-btn edit" style="${btnStyle}" onclick="window.toggleEditMode()">${btnText}</button></div>`;
            
            if (isEditMode) {
                parentNameHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div class="ex-title" style="display: flex; align-items: center; gap: 8px;"><button class="delete-btn" onclick="removeExercise(${index})">×</button><input type="text" value="Forearm Circuit" class="mini-input" style="width:120px; text-align:left;" onchange="updateName('${exID}', this.value, ${index})"></div><button class="action-mode-btn edit" style="${btnStyle}" onclick="window.toggleEditMode()">${btnText}</button></div>`;
            }

            parentRow.innerHTML = `<td colspan="3" style="position: sticky; top: 0; background: #111; z-index: 10; border-bottom: 1px solid #333; padding: 10px 5px;">${parentNameHTML}</td>`;
            tbody.appendChild(parentRow);

            const subs = ["Standing Reverse Curls", "Wrist Curls", "Reverse Wrist Curls"];
            subs.forEach(subName => {
                const subID = exID + "-" + subName.replace(/\s+/g, '-').toLowerCase();
                renderSingleExercise(subID, subName, dateKey, tbody, index, true);
            });
        } else {
            renderSingleExercise(exID, exName, dateKey, tbody, index, false);
        }
    });
}

function renderSingleExercise(exID, exName, dateKey, tbody, index, isSub) {
    const dayLog = globalLog[dateKey] || {};
    const setsData = dayLog[exID] || [{r:'', w:''}, {r:'', w:''}, {r:'', w:''}];
    const lastSession = getLastSessionData(dateKey, exID);
    const isTimeBased = exName.toLowerCase().includes('plank');
    let readyToUpWeight = false;
    
    if (lastSession && lastSession.length > 0) {
        if (isTimeBased) readyToUpWeight = lastSession.every(s => s.r && parseInt(s.r) >= 60);
        else readyToUpWeight = lastSession.every(s => s.r && parseInt(s.r) >= 12);
    }

    const headerRow = document.createElement('tr');
    headerRow.className = isSub ? 'sub-ex-header-row' : 'ex-header-row';
    const titleClass = isSub ? 'sub-ex-title' : 'ex-title';
    
    const btnText = isEditMode ? "Done" : "✎ Edit";
    const btnStyle = "margin: 0; padding: 4px 14px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; border: 1px solid #B8860B; border-radius: 20px; font-weight: 800; font-size: 0.75rem; cursor: pointer; text-transform: uppercase; box-shadow: 0 0 10px rgba(255, 215, 0, 0.4); transition: all 0.3s ease;";

    let nameHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div class="${titleClass}">${exName}</div>${!isSub ? `<button class="action-mode-btn edit" style="${btnStyle}" onclick="window.toggleEditMode()">${btnText}</button>` : ''}</div>`;
    
    if(isEditMode && !isSub) {
        nameHTML = `<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;"><div class="${titleClass}" style="display: flex; align-items: center; gap: 8px;"><button class="delete-btn" onclick="removeExercise(${index})">×</button><input type="text" value="${exName}" class="mini-input" style="width:120px; text-align:left;" onchange="updateName('${exID}', this.value, ${index})"></div><button class="action-mode-btn edit" style="${btnStyle}" onclick="window.toggleEditMode()">${btnText}</button></div>`;
    }
    
    let tdStyle = isSub 
        ? "background: #1a1a1a !important; border-bottom: 1px solid #333; padding: 12px 15px;" 
        : "position: sticky; top: 0; background: #111; z-index: 10; border-bottom: 1px solid #333; padding: 10px 5px;";

    headerRow.innerHTML = `<td colspan="3" style="${tdStyle}">${nameHTML}</td>`;
    tbody.appendChild(headerRow);

    const labelRow = document.createElement('tr');
    labelRow.className = 'column-labels';
    labelRow.innerHTML = `<td>SET</td><td>${isTimeBased ? 'TIME (s)' : 'REPS'}</td><td>WEIGHT</td>`;
    tbody.appendChild(labelRow);

    setsData.forEach((set, setIndex) => {
        const setRow = document.createElement('tr');
        setRow.className = 'set-row';
        setRow.setAttribute('data-exid', exID);
        const lastR = (lastSession?.[setIndex]?.r) || '';
        const lastW = (lastSession?.[setIndex]?.w) || '';
        const rHint = lastR ? `<div style="font-size:0.65rem; color:#888; margin-top:2px;">Last: ${lastR}${isTimeBased ? 's' : ''}</div>` : '';
        let wHint = lastW ? (readyToUpWeight ? `<div style="font-size:0.65rem; color:#00e676; margin-top:2px; font-weight:bold;">↑ Up Weight</div>` : `<div style="font-size:0.65rem; color:#888; margin-top:2px;">Last: ${lastW}</div>`) : '';

        setRow.innerHTML = `<td>${setIndex + 1}</td><td style="vertical-align: top; padding-top: 8px;"><input type="number" class="mini-input" placeholder="${lastR || '0'}" value="${set.r}" oninput="this.style.width = Math.max(4, this.value.length + 1.5) + 'ch'" onchange="updateSet('${dateKey}', '${exID}', ${setIndex}, 'r', this.value)">${rHint}</td><td style="vertical-align: top; padding-top: 8px;"><div style="display: flex; justify-content: space-between; align-items: flex-start;"><div><div class="weight-input-container"><input type="number" class="mini-input" placeholder="${lastW || '0'}" value="${set.w}" oninput="this.style.width = Math.max(4, this.value.length + 1.5) + 'ch'" onchange="updateSet('${dateKey}', '${exID}', ${setIndex}, 'w', this.value)"><span>lbs</span></div>${wHint}</div>${isEditMode ? `<button class="delete-set-btn" onclick="removeSetLogic('${dateKey}', '${exID}', ${setIndex})" style="margin-left: 10px;">🗑</button>` : ''}</div></td>`;
        tbody.appendChild(setRow);
    });

    const addRow = document.createElement('tr');
    addRow.innerHTML = `<td colspan="3"><button class="add-set-btn" onclick="addSet('${dateKey}', '${exID}')">+ ADD SET</button></td>`;
    tbody.appendChild(addRow);
}

function syncCurrentExerciseData(dateKey, targetExID) {
    if (!globalLog[dateKey]) globalLog[dateKey] = {};
    globalLog[dateKey][targetExID] = []; 
    const rows = document.querySelectorAll(`.set-row[data-exid="${targetExID}"]`);
    rows.forEach((row) => {
        const inputs = row.querySelectorAll('input:not([disabled])');
        if(inputs.length >= 2) { globalLog[dateKey][targetExID].push({ r: inputs[0].value, w: inputs[1].value }); }
    });
}

window.addSet = function(dateKey, targetExID) {
    syncCurrentExerciseData(dateKey, targetExID); 
    globalLog[dateKey][targetExID].push({r:'', w:''}); 
    saveToStorage(); 
    loadDay(selectedDate);
}

window.removeSetLogic = function(dateKey, exID, setIndex) {
    syncCurrentExerciseData(dateKey, exID); 
    if (globalLog[dateKey]?.[exID]) {
        globalLog[dateKey][exID].splice(setIndex, 1);
        if (globalLog[dateKey][exID].length === 0) delete globalLog[dateKey][exID];
        saveToStorage(); 
        loadDay(selectedDate);
    }
}

window.updateSet = function(dateKey, exID, setIndex, field, value) {
    if (!globalLog[dateKey]) globalLog[dateKey] = {};
    if (!globalLog[dateKey][exID]) globalLog[dateKey][exID] = []; 
    while (globalLog[dateKey][exID].length <= setIndex) globalLog[dateKey][exID].push({r:'', w:''});
    globalLog[dateKey][exID][setIndex][field] = value;
    saveToStorage();
}

window.saveCurrentEntry = function() {
    saveToStorage(); 
    renderCalendar(); 
    const btn = document.getElementById('save-btn');
    if(btn) { const old = btn.innerText; btn.innerText = "Saved!"; setTimeout(() => btn.innerText = old, 1000); }
}

function saveToStorage() { localStorage.setItem('workoutLog_v3', JSON.stringify(globalLog)); }

window.toggleEditMode = function() {
    isEditMode = !isEditMode;
    const btn = document.getElementById('edit-routine-btn');
    if(btn) btn.innerText = isEditMode ? "Done" : "Edit";
    loadDay(selectedDate);
}

window.updateHeader = function(dateKey, newVal) { 
    globalHeaders[dateKey] = newVal; 
    const valCheck = newVal.trim().toLowerCase();
    if (valCheck === 'rest' || valCheck === 'rest day') {
        globalRoutine[dateKey] = [];
        delete globalHeaders[dateKey]; 
        localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
        isEditMode = false; 
        const editBtn = document.getElementById('edit-routine-btn');
        if (editBtn) editBtn.innerText = "Edit";
    }
    localStorage.setItem('customHeaders_v2', JSON.stringify(globalHeaders)); 
    loadDay(selectedDate); 
}

window.updateName = function(exID, newVal, index) { 
    const dateKey = selectedDate.toISOString().split('T')[0];
    const cycleNum = getCycleDay(selectedDate);
    
    const normalizedName = newVal.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newID = `custom-${normalizedName}`;
    
    globalNames[newID] = newVal.trim();
    
    // Check using the dynamic calf raise logic first
    if (!globalRoutine[dateKey]) { 
        globalRoutine[dateKey] = getExercisesForDate(selectedDate, dateKey, cycleNum); 
    }
    globalRoutine[dateKey][index] = newID;
    
    if (globalLog[dateKey] && globalLog[dateKey][exID]) { 
        if (exID !== newID) {
            globalLog[dateKey][newID] = globalLog[dateKey][exID]; 
            delete globalLog[dateKey][exID]; 
        }
        saveToStorage(); 
    }
    
    localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
    localStorage.setItem('customNames_v2', JSON.stringify(globalNames));
    loadDay(selectedDate);
}

window.removeExercise = function(index) {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const cycleNum = getCycleDay(selectedDate);
    if (!globalRoutine[dateKey]) { globalRoutine[dateKey] = getExercisesForDate(selectedDate, dateKey, cycleNum); }
    globalRoutine[dateKey].splice(index, 1);
    localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
    loadDay(selectedDate);
}

window.addCurrentExercise = function() {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const cycleNum = getCycleDay(selectedDate);
    const newID = `custom-${Date.now()}`;
    globalNames[newID] = "New Exercise";
    if (!globalRoutine[dateKey]) { globalRoutine[dateKey] = getExercisesForDate(selectedDate, dateKey, cycleNum); }
    globalRoutine[dateKey].push(newID);
    localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
    localStorage.setItem('customNames_v2', JSON.stringify(globalNames));
    loadDay(selectedDate);
}

window.forceWorkoutLoad = function() { window.addCurrentExercise(); }

window.exportData = function() {
    const data = { log: globalLog, routine: globalRoutine, headers: globalHeaders, names: globalNames };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const a = document.createElement('a'); a.href = dataStr; a.download = "iron_temple_v3_backup.json"; a.click();
}

window.triggerImport = function() { document.getElementById('import-file').click(); }

window.importData = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if(data.log) globalLog = data.log;
            if(data.routine) globalRoutine = data.routine;
            if(data.headers) globalHeaders = data.headers;
            if(data.names) globalNames = data.names;
            localStorage.setItem('workoutLog_v3', JSON.stringify(globalLog));
            localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
            localStorage.setItem('customHeaders_v2', JSON.stringify(globalHeaders));
            localStorage.setItem('customNames_v2', JSON.stringify(globalNames));
            location.reload();
        } catch (err) { alert("Invalid File"); }
    };
    reader.readAsText(file);
}

/* ==========================================================================
   5. ABOUT PAGE LOGIC (Scroll Reveal & 3D Tilt)
   ========================================================================== */

function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); }
        });
    }, { threshold: 0.1 }); 
    reveals.forEach(r => observer.observe(r));
}

function initTilt() {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        const glare = card.querySelector('.glare');
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15; 
            const rotateY = ((x - centerX) / centerX) * 15;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            if(glare) { glare.style.opacity = '1'; glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3), transparent 60%)`; }
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = `transform 0.5s ease`;
            if(glare) { glare.style.opacity = '0'; glare.style.transition = `opacity 0.5s ease`; }
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = `none`;
            if(glare) glare.style.transition = `none`;
        });
    });
}