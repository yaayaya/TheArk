const modelViewer = document.querySelector('#dimension-demo');
const progress = document.querySelector('#progress');
const bar = progress.querySelector('.bar');


// Status check
modelViewer.addEventListener('ar-status', (event) => {
    alert("This device is not supported AR mode.")
    if (event.detail.status === 'failed') {
        const error = document.querySelector("#error");
        error.classList.remove('hide');
        error.addEventListener('transitionend', (event) => {
            error.classList.add('hide');
        });
    }
});

// Loading bar
modelViewer.addEventListener('progress', (event) => {
    const {
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
const tapDistance = 2;
let panning = false;
let panX, panY;
let startX, startY;
let lastX, lastY;
let metersPerPixel;

const startPan = () => {
    const orbit = modelViewer.getCameraOrbit();
    const {
        theta,
        phi,
        radius
    } = orbit;
    const psi = theta - modelViewer.turntableRotation;
    metersPerPixel = 0.75 * radius / modelViewer.getBoundingClientRect().height;
    panX = [-Math.cos(psi), 0, Math.sin(psi)];
    panY = [
        -Math.cos(phi) * Math.sin(psi),
        Math.sin(phi),
        -Math.cos(phi) * Math.cos(psi)
    ];
    modelViewer.interactionPrompt = 'none';
};

const movePan = (thisX, thisY) => {
    const dx = (thisX - lastX) * metersPerPixel;
    const dy = (thisY - lastY) * metersPerPixel;
    lastX = thisX;
    lastY = thisY;

    const target = modelViewer.getCameraTarget();
    target.x += dx * panX[0] + dy * panY[0];
    target.y += dx * panX[1] + dy * panY[1];
    target.z += dx * panX[2] + dy * panY[2];

    modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;
    // console.log(`${target.x}m ${target.y}m ${target.z}m`)

    // This pauses turntable rotation
    // modelViewer.dispatchEvent(new CustomEvent(
    //     'camera-change', {
    //         detail: {
    //             source: 'user-interaction'
    //         }
    //     }));
};

const recenter = (pointer) => {
    panning = false;
    if (Math.abs(pointer.clientX - startX) > tapDistance ||
        Math.abs(pointer.clientY - startY) > tapDistance)
        return;
    // const rect = modelViewer.getBoundingClientRect();
    // const x = event.clientX - rect.left;
    // const y = event.clientY - rect.top;
    // const hit = modelViewer.positionAndNormalFromPoint(x, y);
    // modelViewer.cameraTarget =
    //     hit == null ? 'auto auto auto' : hit.position.toString();
};

const onPointerUp = (event) => {
    const pointer = event.clientX ? event : event.changedTouches[0];
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

    const {
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
    const {
        touches
    } = event;
    const thisX = 0.5 * (touches[0].clientX + touches[1].clientX);
    const thisY = 0.5 * (touches[0].clientY + touches[1].clientY);
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

// // Anotations
// $("#show-dimensions").change(() => {
//     if ($('#show-dimensions').prop('checked')) {
//         $(".dim").show()
//         $(".dot").show()
//     } else {
//         $(".dim").fadeOut(500)
//         $(".dot").fadeOut(500)
//     }
// })

// modelViewer.addEventListener('load', (event) => {
//     console.log(event)
//     const center = modelViewer.getCameraTarget();
//     const size = modelViewer.getDimensions();
//     const x2 = size.x / 2;
//     const y2 = size.y / 2;
//     const z2 = size.z / 2;

//     modelViewer.updateHotspot({
//         name: 'hotspot-dot+X-Y+Z',
//         position: `${center.x + x2} ${center.y - y2} ${center.z + z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dim+X-Y',
//         position: `${center.x + x2} ${center.y - y2} ${center.z}`
//     });
//     modelViewer.updateHotspot({
//         name: 'hotspot-dot+X-Y-Z',
//         position: `${center.x + x2} ${center.y - y2} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dim+X-Z',
//         position: `${center.x + x2} ${center.y} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dot+X+Y-Z',
//         position: `${center.x + x2} ${center.y + y2} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dim+Y-Z',
//         position: `${center.x} ${center.y + y2} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dot-X+Y-Z',
//         position: `${center.x - x2} ${center.y + y2} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dim-X-Z',
//         position: `${center.x - x2} ${center.y} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dot-X-Y-Z',
//         position: `${center.x - x2} ${center.y - y2} ${center.z - z2}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dim-X-Y',
//         position: `${center.x - x2} ${center.y - y2} ${center.z}`
//     });

//     modelViewer.updateHotspot({
//         name: 'hotspot-dot-X-Y+Z',
//         position: `${center.x - x2} ${center.y - y2} ${center.z + z2}`
//     });
// });


modelViewer.addEventListener("load", (ev) => {

    let material = modelViewer.model.materials[0];
    material.pbrMetallicRoughness.setMetallicFactor(.3);
    material.pbrMetallicRoughness.setRoughnessFactor(.5);

    let createAndApplyTexture = async (channel, v) => {
        let texture = await modelViewer.createTexture(v);
        material[channel].setTexture(texture);
    }

    // let applyPBRTexture = (channel, url) => {
    //     console.log(material.pbrMetallicRoughness)
    //     material.pbrMetallicRoughness[channel].texture.source.setURI(url);
    // }


    // let createAndApplyTexture = async (channel, _t) => {
    //     if (_t == "None") {
    //         material[channel].setTexture(null);
    //     } else if (_t) {
    //         let texture = await modelViewer.createTexture(_t);
    //         material[channel].setTexture(texture);
    //         console.log(material[channel].texture)
    //     }
    // }
    // 0817 https://i.imgur.com/euWRrtT.jpeg
    // full white https://i.imgur.com/ilvk9x0.png
    createAndApplyTexture('normalTexture', 'https://i.imgur.com/euWRrtT.jpeg');
    // createAndApplyTexture('normalTexture', 'https://i.imgur.com/ilvk9x0.png');
})