import { getCoords, isSameVertex } from "./coords.js";
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

const ctx = canvas.getContext("2d");
canvas.style.cursor = "crosshair";

const actionModes = Object.freeze({
    draw: 0,
    reshape: 1,
    remove: 2,
});

let vertices = [];
let strokeWidth = 2;
let anchorRadius = 10;
let draggable = false;
let isMouseDown = false;
let cWidth = canvas.width;
let cHeight = canvas.height;
let currActionMode = actionModes.draw;

ctx.lineWidth = strokeWidth;

const resetVars = () => {
    vertices = [];
    draggable = false;
    isMouseDown = false;

    cWidth = canvas.width;
    cHeight = canvas.height;
    currActionMode = actionModes.draw;
    setClipPathCode();
};

const getClipPathPoints = () => {
    const numOfVertices = vertices.length;

    if (numOfVertices === 0) {
        return [];
    }

    let clipVertices = vertices;

    if (isSameVertex(vertices[0], vertices[numOfVertices - 1])) {
        clipVertices = vertices.slice(0, numOfVertices - 1);
    }

    const clipPathPoints = clipVertices.map((vertex) => {
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

const handleStart = (cursorMode, e) => {
    const coords = getCoords(cursorMode, e);

    console.log(coords, vertices);

    isMouseDown = true;

    if (currActionMode !== actionModes.draw) {
        let removeIdx = -1;
        console.log(vertices);
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(ctx, vertices[idx], anchorRadius);
            if (ctx.isPointInPath(coords.x, coords.y)) {
                if (currActionMode === actionModes.reshape) {
                    draggable = idx + 1;
                    break;
                } else if (currActionMode === actionModes.remove) {
                    removeIdx = idx;
                    break;
                }
            }
        }

        if (removeIdx != -1) {
            const numOfVertices = vertices.length;

            if (removeIdx == 0) {
                if (numOfVertices == 2) {
                    vertices = vertices.slice(1);
                } else if (numOfVertices == 1) {
                    vertices = [];
                } else {
                    vertices = vertices.slice(1, numOfVertices - 1);
                }
            } else {
                vertices.splice(removeIdx, 1);
            }

            if (vertices.length >= 3) {
                completePolygon(ctx, vertices);
            } else {
                drawEdges(ctx, vertices);
            }

            console.log("aft", removeIdx, vertices);

            drawAnchors(ctx, vertices, anchorRadius);
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

const handleMove = (cursorMode, e) => {
    if (!isMouseDown) {
        return;
    }

    const coords = getCoords(cursorMode, e);
    console.log(coords, vertices);

    if (currActionMode !== actionModes.draw) {
        if (draggable) {
            vertices[draggable - 1] = {
                color: vertices[draggable - 1].color,
                ...coords,
            };
            // vertices[draggable - 1].x = coords.x;
            // vertices[draggable - 1].y = coords.y;
            if (draggable === 1) {
                vertices[vertices.length - 1] = {
                    color: vertices[vertices.length - 1].color,
                    ...coords,
                };
            }
            drawPolygon(ctx, vertices, anchorRadius);
        }
    } else {
        drawEdges(ctx, vertices);

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(ctx, lastPoint, coords);
    }

    setClipPathCode();
};

const handleEnd = (cursorMode, e) => {
    isMouseDown = false;

    if (currActionMode !== actionModes.draw) {
        draggable = false;
        return;
    }

    const coords = getCoords(cursorMode, e, true);
    console.log(coords, vertices);

    vertices.push({
        x: coords.x,
        y: coords.y,
        color: getRandomColor(),
    });

    ctx.lineWidth = strokeWidth;

    drawEdges(ctx, vertices);
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
    canvas.style.cursor = "crosshair";
    resetVars();
    clearCanvas(ctx);
};

reshapePolygonBtn.onclick = () => {
    canvas.style.cursor = "move";
    currActionMode = actionModes.reshape;

    setClipPathCode();

    completePolygon(ctx, vertices);
    drawAnchors(ctx, vertices, anchorRadius);
};

addVertexBtn.onclick = () => {
    if (currActionMode === actionModes.draw) return;

    canvas.style.cursor = "crosshair";
    currActionMode = actionModes.draw;

    setClipPathCode();

    vertices = vertices.slice(0, vertices.length - 1);
    drawEdges(ctx, vertices);
};

removeVertexBtn.onclick = () => {
    canvas.style.cursor = "pointer";
    currActionMode = actionModes.remove;

    setClipPathCode();

    completePolygon(ctx, vertices);
    drawAnchors(ctx, vertices, anchorRadius);
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

    ctx.lineWidth = strokeWidth;

    drawEdges(ctx, vertices);

    console.log(ctx.lineWidth);
};

strokeIncBtn.onclick = () => {
    ctx.lineWidth = ++strokeWidth;
    strokeWidthTxt.textContent = ctx.lineWidth;
};

strokeDecBtn.onclick = () => {
    ctx.lineWidth = Math.max(2, --strokeWidth);
    strokeWidthTxt.textContent = ctx.lineWidth;
};

anchorIncBtn.onclick = () => {
    anchorWidthTxt.textContent = ++anchorRadius;
};

anchorDecBtn.onclick = () => {
    anchorRadius = Math.max(5, --anchorRadius);
    anchorWidthTxt.textContent = anchorRadius;
};
