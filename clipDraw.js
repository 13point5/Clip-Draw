const canvas = document.getElementById("canvas");

if (!canvas.getContext) {
    alert("Canvas is not supported in this browser ☹");
    window.stop();
}

const getPathBtn = document.getElementById("get-path");
const reshapePolygonBtn = document.getElementById("reshape");
const addVertexBtn = document.getElementById("add-vertex");
const clearCanvasBtn = document.getElementById("clear");
const clipPathCodeElement = document.getElementById("clip-path-code");
const changeCanvasDimsForm = document.getElementById("canvas-dims-form");
const cWidthInput = document.getElementById("cWidth");
const cHeightInput = document.getElementById("cHeight");

const ctx = canvas.getContext("2d");

let cWidth = canvas.width;
let cHeight = canvas.height;
let vertices = [];
let isDrawing = true;
let draggable = false;
let isMouseDown = false;

ctx.lineWidth = 2;

const setClipPathCode = (code) => {
    clipPathCodeElement.textContent = code;
};

const resetVars = () => {
    vertices = [];
    isDrawing = true;
    draggable = false;
    isMouseDown = false;
    setClipPathCode("");
    cWidth = canvas.width;
    cHeight = canvas.height;
};

const getMouseCoords = (e) => {
    if (e.offsetX) {
        return {
            x: e.offsetX,
            y: e.offsetY,
        };
    } else if (e.layerX) {
        return {
            x: e.layerX,
            y: e.layerY,
        };
    }
};

const getTouchCoords = (e, end) => {
    const touch = end ? e.changedTouches[0] : e.touches[0];
    return {
        x: Math.min(cWidth, Math.max(0, touch.pageX - touch.target.offsetLeft)),
        y: Math.min(cHeight, Math.max(0, touch.pageY - touch.target.offsetTop)),
    };
};

const getCoords = (mode, e, end = false) => {
    if (mode === "touch") {
        return getTouchCoords(e, end);
    } else if (mode === "mouse") {
        return getMouseCoords(e);
    } else {
        alert("An anomaly has occured!");
        window.stop();
    }
};

function getRandomColor() {
    const hue = getRandomNumber(0, 360);
    const saturation = getRandomNumber(90, 100);
    const lightness = getRandomNumber(0, 90);

    const { r, g, b } = HSLToRGB(hue, saturation, lightness);
    const hexCode = RGBToHex(r, g, b);

    return hexCode;
}

function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
}

function RGBToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

function getRandomNumber(low, high) {
    var r = Math.floor(Math.random() * (high - low + 1)) + low;
    return r;
}

const clearCanvas = () => {
    ctx.clearRect(0, 0, cWidth, cHeight);

    if (vertices.length == 0) {
        return;
    }
};

const drawSingleLine = (x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
};

const drawSingleCircle = (vertex, size = 12) => {
    ctx.beginPath();
    ctx.fillStyle = vertex.color;
    ctx.arc(vertex.x, vertex.y, size, 0, Math.PI * 2);
    ctx.fill();
};

const drawAnchors = () => {
    vertices.forEach((vertex) => {
        drawSingleCircle(vertex);
    });
};

const drawEdges = () => {
    clearCanvas();

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach((vertex, idx) => {
        if (idx > 0) {
            ctx.lineTo(vertex.x, vertex.y);
        }
    });
    ctx.stroke();
};

const drawPolygon = () => {
    drawEdges();
    drawAnchors();
};

const completePolygon = () => {
    if (vertices[0] !== vertices[vertices.length - 1])
        vertices.push(vertices[0]);
    drawEdges();
};

const handleStart = (mode, e) => {
    const coords = getCoords(mode, e);

    isMouseDown = true;

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(vertices[idx]);
            if (ctx.isPointInPath(coords.x, coords.y)) {
                draggable = idx + 1;
                break;
            }
        }
    } else {
        if (vertices.length === 0) {
            vertices.push({
                x: coords.x,
                y: coords.y,
                color: getRandomColor(),
            });
        }
    }
};

const handleMove = (mode, e) => {
    if (!isMouseDown) {
        return;
    }

    const coords = getCoords(mode, e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = coords.x;
            vertices[draggable - 1].y = coords.y;
            drawPolygon();
        }
    } else {
        drawEdges();

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(lastPoint.x, lastPoint.y, coords.x, coords.y);
    }
};

const handleEnd = (mode, e) => {
    isMouseDown = false;

    if (!isDrawing) {
        draggable = false;
        return;
    }

    const coords = getCoords(mode, e, true);

    vertices.push({
        x: coords.x,
        y: coords.y,
        color: getRandomColor(),
    });

    drawEdges();
};

const handleMouseDown = (e) => {
    handleStart("mouse", e);
};

const handleMouseMove = (e) => {
    handleMove("mouse", e);
};

const handleMouseUp = (e) => {
    handleEnd("mouse", e);
};

const handleTouchStart = (e) => {
    handleStart("touch", e);
    e.preventDefault();
};

const handleTouchMove = (e) => {
    handleMove("touch", e);
    e.preventDefault();
};

const handleTouchEnd = (e) => {
    handleEnd("touch", e);
};

canvas.addEventListener("mouseup", handleMouseUp, false);
canvas.addEventListener("mousedown", handleMouseDown, false);
canvas.addEventListener("mousemove", handleMouseMove, false);

canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);
canvas.addEventListener("touchend", handleTouchEnd, false);

clearCanvasBtn.onclick = () => {
    resetVars();
    clearCanvas();
};

reshapePolygonBtn.onclick = () => {
    isDrawing = false;
    setClipPathCode("");

    completePolygon();
    drawAnchors();
    console.log(vertices);
};

addVertexBtn.onclick = () => {
    if (isDrawing) return;

    isDrawing = true;
    setClipPathCode("");

    vertices = vertices.slice(0, vertices.length - 1);
    drawEdges();
};

getPathBtn.onclick = () => {
    completePolygon();

    const numOfVertices = vertices.length;

    const clipPathPoints = vertices
        .slice(0, numOfVertices - 1)
        .map((vertex) => {
            const xPercent = ((vertex.x / cWidth) * 100).toFixed(0);
            const yPercent = ((vertex.y / cHeight) * 100).toFixed(0);
            return `${xPercent}% ${yPercent}%`;
        });

    const clipPathString = `clip-path: (${clipPathPoints.join(", ")});`;

    setClipPathCode(clipPathString);
};

changeCanvasDimsForm.onsubmit = (e) => {
    e.preventDefault();
    const newCanvasWidth = cWidthInput.value;
    const newCanvasHeight = cHeightInput.value;

    if (newCanvasWidth <= 0 || newCanvasHeight <= 0) {
        alert("Enter valid dimensions for the canvas");
        return;
    }

    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;

    resetVars();
    clearCanvas();
};
