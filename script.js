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
   4. FITNESS PAGE LOGIC
   ========================================================================== */

const defaultRoutine = {
    day1: ['d1-ex1', 'd1-ex2', 'd1-ex3', 'd1-ex4', 'd1-ex5', 'd1-ex6'], day2: ['d2-ex1', 'd2-ex2', 'd2-ex3', 'd2-ex4', 'd2-ex5'], day3: ['d3-ex1', 'd3-ex2', 'd3-ex3', 'd3-ex4', 'd3-ex5', 'd3-ex6'], day4: ['d4-ex1', 'd4-ex2', 'd4-ex3', 'd4-ex4', 'd4-ex5', 'd4-ex6', 'd4-ex7'], day5: ['d5-ex1', 'd5-ex2', 'd5-ex3', 'd5-ex4', 'd5-ex5'], day0: [], day6: []
};

const defaultHeaders = {
    day1: "Upper Body + Forearms", day2: "Lower Body + Abs", day3: "Push + Forearms", day4: "Pull + Abs", day5: "Legs + Forearms", day0: "Rest", day6: "Rest"
};

const exerciseDB = {
    'd1-ex1': 'Seated Chest Press', 'd1-ex2': 'Lat Pulldowns', 'd1-ex3': 'Seated Cable Rows', 'd1-ex4': 'Overhead Press', 'd1-ex5': 'Skullcrushers', 'd1-ex6': 'Forearm Circuit', 'd2-ex1': 'Dumbbell Goblet Squat', 'd2-ex2': 'Dumbbell RDLs', 'd2-ex3': 'Standing Calf Raises', 'd2-ex4': 'Hanging Leg Raises', 'd2-ex5': 'Plank', 'd3-ex1': 'Seated Incline Chest Press', 'd3-ex2': 'Seated Decline Chest Press', 'd3-ex3': 'Pec Deck', 'd3-ex4': 'Dumbbell Lateral Raises', 'd3-ex5': 'Tricep Rope Pushdowns', 'd3-ex6': 'Forearm Circuit', 'd4-ex1': 'Straight Arm Pulldowns', 'd4-ex2': 'Bent Over Dumbbell Rows', 'd4-ex3': 'Face Pulls', 'd4-ex4': 'Dumbbell Shrugs', 'd4-ex5': 'Bicep Curls', 'd4-ex6': 'Cable Crunches', 'd4-ex7': 'Russian Twists', 'd5-ex1': 'Dumbbell Reverse Lunges', 'd5-ex2': 'Lying Leg Curls', 'd5-ex3': 'Seated Calf Raises', 'd5-ex4': 'Hammer Curls', 'd5-ex5': 'Forearm Circuit', 'custom': 'Custom Exercise'
};

let currentDate = new Date();
let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);
let isEditMode = false;

let globalLog = JSON.parse(localStorage.getItem('workoutLog_v3')) || {}; 
let globalRoutine = JSON.parse(localStorage.getItem('customRoutine_v2')) || defaultRoutine;
let globalHeaders = JSON.parse(localStorage.getItem('customHeaders_v2')) || defaultHeaders;
let globalNames = JSON.parse(localStorage.getItem('customNames_v2')) || {}; 

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
        const dayKey = `day${dateObj.getDay()}`;
        
        // Logical check for Rest vs Missed
        const isRestDay = !globalRoutine[dateKey] && (!globalRoutine[dayKey] || globalRoutine[dayKey].length === 0);

        if (globalLog[dateKey]) {
            cell.classList.add('has-log'); // Completed (Green)
        } else if (isRestDay) {
            cell.classList.add('rest-day'); // Planned Rest (Blue)
        } else {
            cell.classList.add('no-log');   // Missed Workout (Red)
        }

        if (d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            cell.classList.add('active-day');
        }
        
        cell.onclick = () => { 
            selectedDate = new Date(year, month, d); 
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
    if (!display) return;
    const dateKey = date.toISOString().split('T')[0];
    const dayKey = `day${date.getDay()}`;
    display.innerText = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const exercises = globalRoutine[dateKey] || globalRoutine[dayKey] || [];
    const headerTitle = globalHeaders[dateKey] || globalHeaders[dayKey] || "Rest Day";
    const headerBadge = document.getElementById('active-day-header');
    if(isEditMode) headerBadge.innerHTML = `<input type="text" class="editable-input" value="${headerTitle}" onchange="updateHeader('${dateKey}', this.value)">`;
    else if(headerBadge) headerBadge.innerText = headerTitle;
    const table = document.getElementById('active-table');
    const restMsg = document.getElementById('rest-message');
    const saveBtns = [document.getElementById('save-btn'), document.getElementById('top-save-btn')];
    if (exercises.length === 0 && !isEditMode) {
        table.style.display = 'none'; restMsg.style.display = 'block';
        saveBtns.forEach(b => { if(b) b.style.display = 'none'; });
    } else {
        table.style.display = 'table'; restMsg.style.display = 'none';
        saveBtns.forEach(b => { if(b) b.style.display = 'block'; });
        renderTable(exercises, dateKey);
    }
}

function getOverallPR(exID) {
    let pr = 0;
    Object.values(globalLog).forEach(day => {
        if(day[exID]) {
            day[exID].forEach(set => {
                const w = parseFloat(set.w);
                if(w > pr) pr = w;
            });
        }
    });
    return pr;
}

function renderTable(exercises, dateKey) {
    const tbody = document.getElementById('active-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const dayLog = globalLog[dateKey] || {};
    exercises.forEach((exID, index) => {
        const exName = exerciseDB[exID] || globalNames[exID] || 'Unknown';
        const setsData = dayLog[exID] || [{r:'', w:''}, {r:'', w:''}, {r:'', w:''}]; 
        const overallPR = getOverallPR(exID);
        const headerRow = document.createElement('tr');
        headerRow.className = 'ex-header-row';
        let nameHTML = `<div class="ex-title">${exName}</div>`;
        if(isEditMode) nameHTML = `<div class="ex-title"><button class="delete-btn" onclick="removeExercise(${index})">×</button> <input type="text" value="${exName}" class="mini-input" style="width:120px; text-align:left;" onchange="updateName('${exID}', this.value, ${index})"></div>`;
        headerRow.innerHTML = `<td colspan="3">${nameHTML}</td>`;
        tbody.appendChild(headerRow);
        const labelRow = document.createElement('tr');
        labelRow.className = 'column-labels';
        labelRow.innerHTML = `<td>SET</td><td>REPS</td><td>WEIGHT</td>`;
        tbody.appendChild(labelRow);
        let prDisplayed = false; 
        setsData.forEach((set, setIndex) => {
            const setRow = document.createElement('tr');
            setRow.className = 'set-row';
            setRow.setAttribute('data-exid', exID);
            const currentW = parseFloat(set.w);
            let prTag = '';
            if (currentW > 0 && currentW >= overallPR && !prDisplayed) { prTag = `<span class="row-pr-label">PR!</span>`; prDisplayed = true; }
            setRow.innerHTML = `<td><span class="set-num">${setIndex + 1}</span></td><td><input type="number" class="mini-input" placeholder="0" value="${set.r}" oninput="this.style.width = Math.max(4, this.value.length + 1.5) + 'ch'" onchange="updateSet('${dateKey}', '${exID}', ${setIndex}, 'r', this.value)"></td><td><div class="weight-input-container"><input type="number" class="mini-input" placeholder="0" value="${set.w}" oninput="this.style.width = Math.max(4, this.value.length + 1.5) + 'ch'; updateKgDisplay(this)" onchange="updateSet('${dateKey}', '${exID}', ${setIndex}, 'w', this.value)"><span>lbs/</span><input type="number" class="mini-input" placeholder="0" value="${set.w ? Math.round(set.w * 0.453) : ''}" disabled><span>kg</span></div>${prTag}<button class="delete-set-btn" onclick="removeSetLogic('${dateKey}', '${exID}', ${setIndex})" title="Delete Set">🗑</button></td>`;
            tbody.appendChild(setRow);
        });
        const addRow = document.createElement('tr');
        addRow.innerHTML = `<td colspan="3"><button class="add-set-btn" onclick="addSet('${dateKey}', '${exID}')">+ ADD SET</button></td>`;
        tbody.appendChild(addRow);
    });
}

window.updateKgDisplay = function(input) {
    const container = input.closest('.weight-input-container');
    const kgInput = container.querySelectorAll('.mini-input')[1];
    if(input.value) {
        const kgVal = Math.round(parseFloat(input.value) * 0.453);
        kgInput.value = kgVal;
        kgInput.style.width = Math.max(4, String(kgVal).length + 1.5) + 'ch';
    } else { kgInput.value = ''; kgInput.style.width = '4ch'; }
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
    if (globalLog[dateKey] && globalLog[dateKey][exID]) {
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
    saveToStorage(); renderCalendar(); 
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
    const dayKey = `day${selectedDate.getDay()}`;
    const newID = `custom-${Date.now()}`;
    globalNames[newID] = newVal;
    if (!globalRoutine[dateKey]) { globalRoutine[dateKey] = globalRoutine[dayKey] ? [...globalRoutine[dayKey]] : []; }
    globalRoutine[dateKey][index] = newID;
    if (globalLog[dateKey] && globalLog[dateKey][exID]) { globalLog[dateKey][newID] = globalLog[dateKey][exID]; delete globalLog[dateKey][exID]; saveToStorage(); }
    localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
    localStorage.setItem('customNames_v2', JSON.stringify(globalNames));
    loadDay(selectedDate);
}

window.removeExercise = function(index) {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dayKey = `day${selectedDate.getDay()}`;
    if (!globalRoutine[dateKey]) { globalRoutine[dateKey] = globalRoutine[dayKey] ? [...globalRoutine[dayKey]] : []; }
    globalRoutine[dateKey].splice(index, 1);
    localStorage.setItem('customRoutine_v2', JSON.stringify(globalRoutine));
    loadDay(selectedDate);
}

window.addCurrentExercise = function() {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dayKey = `day${selectedDate.getDay()}`;
    const newID = `custom-${Date.now()}`;
    globalNames[newID] = "New Exercise";
    if (!globalRoutine[dateKey]) { globalRoutine[dateKey] = globalRoutine[dayKey] ? [...globalRoutine[dayKey]] : []; }
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
            localStorage.setItem('workoutLog_v3', JSON.stringify(globalLog));
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