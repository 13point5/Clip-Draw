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

// Actions
const clearCanvasBtn = document.getElementById("clear-canvas");

const addVertexBtn = document.getElementById("add-vertex");
const removeVertexBtn = document.getElementById("remove-vertex");
const reshapePolygonBtn = document.getElementById("reshape-polygon");

// Settings
const cWidthInput = document.getElementById("cWidth");
const cHeightInput = document.getElementById("cHeight");

const strokeIncBtn = document.getElementById("stroke-inc");
const strokeDecBtn = document.getElementById("stroke-dec");
const strokeWidthTxt = document.getElementById("stroke-width");

const anchorIncBtn = document.getElementById("anchor-inc");
const anchorDecBtn = document.getElementById("anchor-dec");
const anchorWidthTxt = document.getElementById("anchor-width");

const clipPathCodeElement = document.getElementById("clip-path-code");
const changeCanvasDimsForm = document.getElementById("canvas-dims-form");

let ctx = canvas.getContext("2d");

const modes = {
    draw: "DRAW",
    reshape: "RESHAPE",
    addVertex: "ADD_VERTEX",
    removeVertex: "REMOVE_VERTEX",
};

let mode = modes.draw;

let vertices = [];
let anchorRadius = 10;
let isDrawing = true;
let draggable = false;
let canInteract = true;
let isMouseDown = false;
let cWidth = canvas.width;
let cHeight = canvas.height;

ctx.lineWidth = 2;

const resetVars = () => {
    mode = modes.draw;
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
    const coords = getCoords(mode, e);

    isMouseDown = true;

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(ctx, vertices[idx], anchorRadius);
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
    if (!isMouseDown) {
        return;
    }

    const coords = getCoords(mode, e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = coords.x;
            vertices[draggable - 1].y = coords.y;
            drawPolygon(ctx, vertices, anchorRadius);
        }
    } else {
        drawEdges(ctx, vertices);

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(ctx, lastPoint, coords);
    }

    setClipPathCode();
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
    isDrawing = false;
    setClipPathCode();

    completePolygon(ctx, vertices);
    drawAnchors(ctx, vertices, anchorRadius);
};

addVertexBtn.onclick = () => {
    if (isDrawing) return;

    isDrawing = true;
    setClipPathCode();

    vertices = vertices.slice(0, vertices.length - 1);
    drawEdges(ctx, vertices);
};

changeCanvasDimsForm.onsubmit = (e) => {
    e.preventDefault();
    const newWidth = cWidthInput.value || cWidth;
    const newHeight = cHeightInput.value || cHeight;

    if (newWidth <= 0 || newHeight <= 0) {
        alert("Enter valid dimensions for the canvas");
        return;
    }

    vertices = vertices.map((vertex) => {
        return {
            x: Math.round((vertex.x / cWidth) * newWidth),
            y: Math.round((vertex.y / cHeight) * newHeight),
            color: vertex.color,
        };
    });

    canvas.width = newWidth;
    canvas.height = newHeight;

    cWidth = newWidth;
    cHeight = newHeight;

    drawEdges(ctx, vertices);
};

strokeIncBtn.onclick = () => {
    strokeWidthTxt.textContent = ++ctx.lineWidth;
};

strokeDecBtn.onclick = () => {
    ctx.lineWidth = Math.max(2, --ctx.lineWidth);
    strokeWidthTxt.textContent = ctx.lineWidth;
};

anchorIncBtn.onclick = () => {
    anchorWidthTxt.textContent = ++anchorRadius;
};

anchorDecBtn.onclick = () => {
    anchorRadius = Math.max(5, --anchorRadius);
    anchorWidthTxt.textContent = anchorRadius;
};
