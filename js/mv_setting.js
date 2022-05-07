var modelViewer = document.querySelector('#dimension-demo');
var progress = document.querySelector('#progress');
var bar = progress.querySelector('.bar');


// Status check
modelViewer.addEventListener('ar-status', (event) => {
    alert("This device is not supported AR mode.")
    if (event.detail.status === 'failed') {
        var error = document.querySelector("#error");
        error.classList.remove('hide');
        error.addEventListener('transitionend', (event) => {
            error.classList.add('hide');
        });
    }
});

// Loading bar
modelViewer.addEventListener('progress', (event) => {
    var {
        totalProgress
    } = event.detail;
    progress.classList.toggle('show', totalProgress < 1);
    $(".bar").css('transform', `scaleX(${totalProgress})`)
    if (totalProgress >= 1){
        $("#arButton").show()
        $(".tooltipDiv").show()
    }
});

// 
var tapDistance = 2;
var panning = false;
var panX, panY;
var startX, startY;
var lastX, lastY;
var metersPerPixel;

var startPan = () => {
    var orbit = modelViewer.getCameraOrbit();
    var {
        theta,
        phi,
        radius
    } = orbit;
    var psi = theta - modelViewer.turntableRotation;
    metersPerPixel = 0.75 * radius / modelViewer.getBoundingClientRect().height;
    panX = [-Math.cos(psi), 0, Math.sin(psi)];
    panY = [
        -Math.cos(phi) * Math.sin(psi),
        Math.sin(phi),
        -Math.cos(phi) * Math.cos(psi)
    ];
    modelViewer.interactionPrompt = 'none';
};

var movePan = (thisX, thisY) => {
    var dx = (thisX - lastX) * metersPerPixel;
    var dy = (thisY - lastY) * metersPerPixel;
    lastX = thisX;
    lastY = thisY;

    var target = modelViewer.getCameraTarget();
    target.x += dx * panX[0] + dy * panY[0];
    target.y += dx * panX[1] + dy * panY[1];
    target.z += dx * panX[2] + dy * panY[2];

    modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;

};

var recenter = (pointer) => {
    panning = false;
    if (Math.abs(pointer.clientX - startX) > tapDistance ||
        Math.abs(pointer.clientY - startY) > tapDistance)
        return;
};

var onPointerUp = (event) => {
    var pointer = event.clientX ? event : event.changedTouches[0];
    if (Math.abs(pointer.clientX - startX) < tapDistance &&
        Math.abs(pointer.clientY - startY) < tapDistance) {
        recenter(pointer);
    }
    panning = false;
};

modelViewer.addEventListener('mousedown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
    panning = event.button === 2 || event.ctrlKey || event.metaKey ||
        event.shiftKey;
    if (!panning)
        return;

    lastX = startX;
    lastY = startY;
    startPan();
    event.stopPropagation();
}, true);

modelViewer.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    panning = event.touches.length === 2;
    if (!panning)
        return;

    var {
        touches
    } = event;
    lastX = 0.5 * (touches[0].clientX + touches[1].clientX);
    lastY = 0.5 * (touches[0].clientY + touches[1].clientY);
    startPan();
}, true);

modelViewer.addEventListener('mousemove', (event) => {
    if (!panning)
        return;
    movePan(event.clientX, event.clientY);
    event.stopPropagation();
}, true);

modelViewer.addEventListener('touchmove', (event) => {
    if (!panning || event.touches.length !== 2)
        return;
    var {
        touches
    } = event;
    var thisX = 0.5 * (touches[0].clientX + touches[1].clientX);
    var thisY = 0.5 * (touches[0].clientY + touches[1].clientY);
    movePan(thisX, thisY);
}, true);

self.addEventListener('mouseup', (event) => {
    recenter(event);
}, true);

self.addEventListener('touchend', (event) => {
    recenter(event);
    if (event.touches.length === 0) {
        recenter(event.changedTouches[0]);
    }
}, true);


modelViewer.addEventListener("load", (ev) => {

    var material = modelViewer.model.materials[0];
    material.pbrMetallicRoughness.setMetallicFactor(.3);
    material.pbrMetallicRoughness.setRoughnessFactor(.5);

    var createAndApplyTexture = async (channel, v) => {
        var texture = await modelViewer.createTexture(v);
        material[channel].setTexture(texture);
    }

    createAndApplyTexture('normalTexture', 'https://i.imgur.com/euWRrtT.jpeg');
})