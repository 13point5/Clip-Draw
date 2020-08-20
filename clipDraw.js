import { getCoords } from "./coords.js";
import { getRandomColor, getInvertedColor } from "./color.js";
import {
    clearCanvas,
    drawSingleLine,
    drawSingleCircle,
    drawAnchors,
    drawEdges,
    drawPolygon,
    completePolygon,
} from "./draw.js";

const canvas = document.getElementById("canvas");

if (!canvas.getContext) {
    alert("Canvas is not supported in this browser ☹");
    window.stop();
}

const cWidthInput = document.getElementById("cWidth");
const cHeightInput = document.getElementById("cHeight");
const addVertexBtn = document.getElementById("add-vertex");
const clearCanvasBtn = document.getElementById("clear-canvas");
const reshapePolygonBtn = document.getElementById("reshape-polygon");
const clipPathCodeElement = document.getElementById("clip-path-code");
const changeCanvasDimsForm = document.getElementById("canvas-dims-form");

let ctx = canvas.getContext("2d");

let cWidth = canvas.width;
let cHeight = canvas.height;
let vertices = [];
let isDrawing = true;
let draggable = false;
let isMouseDown = false;
let canInteract = true;

ctx.lineWidth = 2;

const resetVars = () => {
    vertices = [];
    isDrawing = true;
    draggable = false;
    isMouseDown = false;
    canInteract = true;
    setClipPathCode();
    cWidth = canvas.width;
    cHeight = canvas.height;
};

const getClipPathPoints = () => {
    const numOfVertices = vertices.length;

    const clipPathPoints = vertices
        .slice(0, numOfVertices - 1)
        .map((vertex) => {
            const xPercent = ((vertex.x / cWidth) * 100).toFixed(0);
            const yPercent = ((vertex.y / cHeight) * 100).toFixed(0);
            return `${xPercent}% ${yPercent}%`;
        });

    return clipPathPoints;
};

const setClipPathCode = () => {
    const clipPathPoints = getClipPathPoints();

    if (clipPathPoints.length === 0) {
        clipPathCodeElement.innerHTML = "";
        return;
    }

    clipPathCodeElement.innerHTML = "clip-path: polygon(";
    clipPathPoints.forEach((point, idx) => {
        const pointBgColor = vertices[idx].color;
        const pointTextColor = getInvertedColor(pointBgColor);
        clipPathCodeElement.innerHTML += `<span style="color:${pointTextColor};background-color:${pointBgColor};">${point}</span>`;
        clipPathCodeElement.innerHTML +=
            idx !== clipPathPoints.length - 1 ? ", " : "";
    });

    clipPathCodeElement.innerHTML += ");";
};

const handleStart = (mode, e) => {
    if (!canInteract) return;

    const coords = getCoords(mode, e);

    isMouseDown = true;

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(ctx, vertices[idx]);
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

    setClipPathCode();
};

const handleMove = (mode, e) => {
    if (!canInteract) return;

    if (!isMouseDown) {
        return;
    }

    const coords = getCoords(mode, e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = coords.x;
            vertices[draggable - 1].y = coords.y;
            drawPolygon(ctx, vertices);
        }
    } else {
        drawEdges(ctx, vertices);

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(ctx, lastPoint, coords);
    }

    setClipPathCode();
};

const handleEnd = (mode, e) => {
    if (!canInteract) return;

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

    drawEdges(ctx, vertices);
    setClipPathCode();
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
    clearCanvas(ctx);
};

reshapePolygonBtn.onclick = () => {
    canInteract = true;
    isDrawing = false;
    setClipPathCode();

    completePolygon(ctx, vertices);
    drawAnchors(ctx, vertices);
};

addVertexBtn.onclick = () => {
    canInteract = true;
    if (isDrawing) return;

    isDrawing = true;
    setClipPathCode();

    vertices = vertices.slice(0, vertices.length - 1);
    drawEdges(ctx, vertices);
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
    cWidth = canvas.width;
    cHeight = canvas.height;

    resetVars();
    clearCanvas(ctx);
};
