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

const getTouchCoords = (e) => {
    if (!e) e = event;

    if (e.touches) {
        if (e.touches.length == 1) {
            // Only deal with one finger
            let touch = e.touches[0]; // Get the information for finger #1
            return {
                x: touch.pageX - touch.target.offsetLeft,
                y: touch.pageY - touch.target.offsetTop,
            };
        }
    }
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

const drawSingleCircle = (pos, color = "red", size = 8) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "black";
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

const handleMouseDown = (e) => {
    isMouseDown = true;
    const mouseCoords = getMouseCoords(e);

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(vertices[idx]);
            if (ctx.isPointInPath(mouseCoords.x, mouseCoords.y)) {
                draggable = idx + 1;
                break;
            }
        }
    } else {
        if (vertices.length === 0) {
            vertices.push({ x: mouseCoords.x, y: mouseCoords.y });
        }
    }
};

const handleMouseMove = (e) => {
    if (!isMouseDown) {
        return;
    }

    const mouseCoords = getMouseCoords(e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = mouseCoords.x;
            vertices[draggable - 1].y = mouseCoords.y;
            drawPolygon();
        }
    } else {
        drawEdges();

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(lastPoint.x, lastPoint.y, mouseCoords.x, mouseCoords.y);
    }
};

const handleMouseUp = (e) => {
    isMouseDown = false;

    if (!isDrawing) {
        draggable = false;
        return;
    }

    const mouseCoords = getMouseCoords(e);

    vertices.push({ x: mouseCoords.x, y: mouseCoords.y });

    drawEdges();
};

const handleTouchStart = (e) => {
    isMouseDown = true;
    const touchCoords = getTouchCoords(e);

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(vertices[idx]);
            if (ctx.isPointInPath(touchCoords.x, touchCoords.y)) {
                draggable = idx + 1;
                break;
            }
        }
    } else {
        if (vertices.length === 0) {
            vertices.push({ x: touchCoords.x, y: touchCoords.y });
        }
    }

    e.preventDefault();
};

const handleTouchMove = (e) => {
    if (!isMouseDown) {
        return;
    }

    const touchCoords = getTouchCoords(e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = touchCoords.x;
            vertices[draggable - 1].y = touchCoords.y;
            drawPolygon();
        }
    } else {
        drawEdges();

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(lastPoint.x, lastPoint.y, touchCoords.x, touchCoords.y);
    }

    e.preventDefault();
};

const handleTouchEnd = (e) => {
    isMouseDown = false;

    if (!isDrawing) {
        draggable = false;
        return;
    }

    let touch = e.changedTouches[0]; // Get the information for finger #1
    vertices.push({
        x: touch.pageX - touch.target.offsetLeft,
        y: touch.pageY - touch.target.offsetTop,
    });

    drawEdges();
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
