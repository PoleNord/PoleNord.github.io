const mapImage = document.getElementById("map-image");
const pointsContainer = document.getElementById('points-container');
const mapList = document.getElementById('map-list');


//Image lineup
const lineupPlacement = document.getElementById('lineup-placement');
const lineupAim = document.getElementById('lineup-aim');
const lineupVideo = document.getElementById('lineup-video');
const lineupThrow = document.getElementById('lineup-throw');

//Debug
const debugBox = document.getElementById('debug-coords');
let debugMode = true

mapContainer = document.getElementById('map-container');

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
let currentMap = "ancient";
let launchPoint = null;
let launchLine = null;

//Map Selection
function loadMap(mapName) {
    currentMap = mapName;
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

        point.addEventListener('click', () => {
            openNadeInfo(nade);
        });
        
        pointsContainer.appendChild(point);
    });
}

//Open Nade Info
function openNadeInfo(nade) {
    lineupPlacement.src = nade.placement || '';
    lineupAim.src = nade.aim || '';
    lineupVideo.href = nade.video || '#';
    lineupThrow.textContent = nade.throw || '';

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
}


//Sidebar Map Selection
mapList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
        const mapName = li.getAttribute('data-map');
        loadMap(mapName);
    });
});


//Initial Load
loadMap(currentMap); 