const canvas = document.getElementById("canvas");

if (!canvas.getContext) {
    alert("Canvas is not supported in this browser ☹");
    window.stop();
}

const getPathBtn = document.getElementById("get-path");
const editPolygonBtn = document.getElementById("edit");
const clearCanvasBtn = document.getElementById("clear");
const clipPathCodeElement = document.getElementById("clip-path-code");
const changeCanvasDimsForm = document.getElementById("canvas-dims-form");
const cWidthInput = document.getElementById("cWidth");
const cHeightInput = document.getElementById("cHeight");

const ctx = canvas.getContext("2d");

let cWidth = canvas.width;
let cHeight = canvas.height;
let vertices = [];
let usedColors = new Set();
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
    usedColors.clear();
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

const getRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    if (
        usedColors === "000000" ||
        !usedColors.has(randomColor) ||
        usedColors.size === 16777216
    ) {
        usedColors.add(randomColor);
        return `#${randomColor}`;
    }

    return getRandomColor();
};

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

    vertices.push({ x: coords.x, y: coords.y, color: getRandomColor() });

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

editPolygonBtn.onclick = () => {
    isDrawing = false;
    setClipPathCode("");

    completePolygon();
    drawAnchors();
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
