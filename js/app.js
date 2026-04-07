const mapImage = document.getElementById("map-image");
const pointsContainer = document.getElementById('points-container');
const mapList = document.getElementById('map-list');


//Image lineup
const lineupPlacement = document.getElementById('lineup-placement');
const lineupAim = document.getElementById('lineup-aim');
const lineupVideo = document.getElementById('lineup-video');
const lineupThrow = document.getElementById('lineup-throw');
const lineupName = document.getElementById('lineup-title');

//Debug
const debugBox = document.getElementById('debug-coords');
let debugMode = true

//Edition Mode
let editMode = false;

let editStep = 0;
let impact = null;
let launch = null;

const editBtn = document.getElementById('edit-mode-btn');
const editPanel = document.getElementById('edit-panel');
const editStepText = document.getElementById('edit-step');
const editOutput = document.getElementById('edit-output');

function openEditPanel() {
    editMode = true;
    editPanel.classList.remove('hidden');
    editBtn.textContent = 'Editing...';
    editBtnclassList.add('active');
    editStep = 0;
    impact = null;
    launch = null;
    editStepText.textContent = 'Click on the impact point';
    loadPoints(currentMap);
}

function closeEditPanel() {
    document.getElementById('edit-placement-path').value = null;
    document.getElementById('edit-placement-info').textContent = "";
    document.querySelectorAll('.point').forEach(point => point.classList.remove('highlight'));
    editMode = false;
    editPanel.classList.add('hidden');
    editBtn.textContent = 'Edit Mode';
    editBtn.classList.remove('active');
    editStep = 0;
    impact = null;
    launch = null;
    editStepText.textContent = 'Click on the impact point';
    loadPoints(currentMap);
}

function formatNadeForJSON(nade) {
    let json = JSON.stringify(nade, null, 4);

    json = json.replace(/"([^"]+)":/g, '$1:');
    json += ',';

    return json;
}



editBtn.addEventListener('click', () => {
    if (editMode) {
        closeEditPanel();
    } else {
        openEditPanel();
    }
});


pointsContainer.addEventListener('click', (e) => {
    if (!editMode) return;
    
    const rect = pointsContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    if (editStep === 0) {
        impact = { x, y };
        editStep = 1;
        editStepText.textContent = 'Click on the launch point';

    } else if (editStep === 1) {
        launch = { x, y };
        editStep = 2;
        editStepText.textContent = 'Nade Info';
    }
});

document.getElementById('edit-save-btn').addEventListener('click', () => {

    if (!impact || !launch) {
        alert('Please select both impact and launch points.');
        return;
    }

    const rawName = document.getElementById('edit-title').value.trim();
    const cleanName = rawName
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "");

    const placementPath = `assets/nades/${currentMap}/${cleanName}_placement.png`;
    const aimPath = `assets/nades/${currentMap}/${cleanName}_aim.png`;

    const nadeData = {
        Map: currentMap,
        Type: document.getElementById('edit-type').value,
        x: Number(impact.x.toFixed(3)),
        y: Number(impact.y.toFixed(3)),
        fromx: Number(launch.x.toFixed(3)),
        fromy: Number(launch.y.toFixed(3)),
        title: rawName,
        throw: document.getElementById('edit-throw').value,
        video: "",
        placement: placementPath,
        aim: aimPath,
    };

    editOutput.value = formatNadeForJSON(nadeData);
});

document.getElementById('edit-cancel-btn').addEventListener('click', () => {
    closeEditPanel();
});

document.getElementById('edit-copy-btn').addEventListener('click', () => {
    const text = editOutput.value.trim();

    if (!text) {
        editOutput.value = 'No JSON to copy!';
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        const oldText = document.getElementById('edit-copy-btn').textContent;
        document.getElementById('edit-copy-btn').textContent = 'Copied!';

        setTimeout(() => {
            document.getElementById('edit-copy-btn').textContent = oldText;
        }, 1200);
    });
});
//Fin Edition Mode


let nadesVisible = true;

mapContainer = document.getElementById('map-container');

mapContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('point')) return;

    resetNadesView();
});

mapContainer.addEventListener('mousemove', (e) => {
    if (!debugMode) return;

    const rect = mapContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    debugBox.textContent = `X: ${x.toFixed(3)}, Y: ${y.toFixed(3)}`;
    debugBox.classList.remove('hidden');
});

mapContainer.addEventListener('mouseleave', () => {
    debugBox.classList.add('hidden');
});

//Map Actuelle
let currentMap = null;
let launchPoint = null;
let launchLine = null;

//Map Selection
function loadMap(mapName) {
    currentMap = mapName;

    document.getElementById('home').style.display = 'none';
    document.getElementById('map-container').style.display = 'block';

    mapImage.src = `assets/maps/${mapName}.png`;

    pointsContainer.innerHTML = '';

    loadPoints(mapName);
}

//Load Points
function loadPoints(mapName) {
    const mapNades = nades.filter(n => n.Map === mapName);

    pointsContainer.innerHTML = '';

    mapNades.forEach(nade => {
        const point = document.createElement('div');
        point.classList.add('point');

        point.classList.add(nade.Type.toLowerCase());

        point.style.left = `${nade.x * 100}%`;
        point.style.top = `${nade.y * 100}%`;

        point.addEventListener('click', (e) => {

            if (editMode) {
                e.stopPropagation();
                handleExistingPointClick(nade, point);
                return;
            }

            openNadeInfo(nade, point);
        });
        
        pointsContainer.appendChild(point);   
    });
}


//Open Nade Info
function openNadeInfo(nade, clickedPoint = null) {

    document.getElementById('lineup-block').classList.remove('hidden');

    

    lineupPlacement.src = nade.placement || '';
    lineupAim.src = nade.aim || '';
    lineupVideo.href = nade.video || '#';
    lineupThrow.textContent = nade.throw || '';
    lineupName.textContent = nade.title || "";

    if (launchPoint) {
        launchPoint.remove();
        launchPoint = null;
    }

    if (launchLine) {
        launchLine.remove();
        launchLine = null;
    }

    // Launch Point
    launchPoint = document.createElement('div');
    launchPoint.classList.add('point-launch');

    launchPoint.style.left = (nade.fromx * 100) + '%';
    launchPoint.style.top = (nade.fromy * 100) + '%';

    pointsContainer.appendChild(launchPoint);



    // Line from launch to target

    const x1 = nade.fromx * pointsContainer.offsetWidth;
    const y1 = nade.fromy * pointsContainer.offsetHeight;
    const x2 = nade.x * pointsContainer.offsetWidth;
    const y2 = nade.y * pointsContainer.offsetHeight;

    const dx = x2 - x1;
    const dy = y2 - y1;

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const distance = Math.sqrt(dx * dx + dy * dy);

    launchLine = document.createElement('div');
    launchLine.classList.add('launch-line');

    launchLine.style.width = distance + 'px';
    launchLine.style.transform = `rotate(${angle}deg)`;
    launchLine.style.left = x1 + 'px';
    launchLine.style.top = y1 + 'px';

    pointsContainer.appendChild(launchLine);

    //Opacity
    document.querySelectorAll('.point').forEach(point => {
        point.classList.remove('dimmed');
    });

    document.querySelectorAll('.point').forEach(point => {
        if (point != clickedPoint) {
            point.classList.add('dimmed');
        }
    });
}


//Sidebar Map Selection
mapList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        const mapName = li.getAttribute('data-map');
        loadMap(mapName);
    });
});

const toggleNadesBtn = document.getElementById('toggle-nades');

toggleNadesBtn.addEventListener('change', () => {
    nadesVisible = toggleNadesBtn.checked;
    document.querySelectorAll('.point').forEach(point => {
        point.style.display = nadesVisible ? 'block' : 'none';
    });

    if (launchPoint) {
        launchPoint.style.display = nadesVisible ? 'block' : 'none';
    }   

    if (launchLine) {
        launchLine.style.display = nadesVisible ? 'block' : 'none';
    }
});

function resetNadesView() {

    document.querySelectorAll('.point').forEach(point => {
        point.classList.remove('dimmed');
    });

    if (launchPoint) {
        launchPoint.remove();
        launchPoint = null;
    }   

    if (launchLine) {
        launchLine.remove();
        launchLine = null;
    }

    document.getElementById('lineup-block').classList.add('hidden');
}

//Drag EditMode

(function() {
    const panel = document.getElementById('edit-panel');
    const header = document.getElementById('edit-panel-header');

    let offsetX, offserY = 0;
    let isDragging = false;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;
        panel.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;

        panel.style.left = (e.clientX - offsetX) + 'px';
        panel.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        panel.style.transition = "";
    });
})();