import ThemeManager from "../utils/ThemeManager.js";
import { getCoords, isSameVertex } from "../utils/coords.js";
import { getRandomColor, getInvertedColor } from "../utils/color.js";
import {
  clearCanvas,
  drawSingleLine,
  drawSingleCircle,
  drawAnchors,
  drawEdges,
  drawPolygon,
  completePolygon,
} from "../utils/draw.js";

const canvas = document.getElementById("canvas");

if (!canvas.getContext) {
  alert("Canvas is not supported in this browser ☹");
  window.stop();
}

const ctx = canvas.getContext("2d");

// Actions
const drawBtn = document.getElementById("action-draw-btn");
const reshapePolygonBtn = document.getElementById("action-reshape-btn");
const removeVertexBtn = document.getElementById("action-removeVertex-btn");
const clearCanvasBtn = document.getElementById("action-clearCanvas-btn");

const copyCodeBtn = document.getElementById("copy-code-btn");

// Settings
const themeBtn = document.getElementById("dark-light-btn");
const themeIcon = themeBtn.children[0];

const settingsBtn = document.getElementById("settings-btn");
const settingsBox = document.getElementById("settings-box");

const cWidthInput = document.getElementById("cWidth");
const cHeightInput = document.getElementById("cHeight");

const strokeForm = document.getElementById("stroke-form");
const anchorForm = document.getElementById("anchor-form");

const clipPathCodeElement = document.getElementById("clip-path-code");
const changeCanvasDimsForm = document.getElementById("canvas-dims-form");

const actionModes = Object.freeze({
  draw: "draw",
  reshape: "reshape",
  removeVertex: "removeVertex",
});

// stroke
let prevStrokeWidth = strokeForm.stroke.value;

const strokeToPx = Object.freeze({
  thin: 1,
  normal: 2,
  bold: 4,
});

let strokeWidth = strokeToPx[prevStrokeWidth];

// anchor
let prevAnchorRadius = anchorForm.anchor.value;

const anchorToPx = Object.freeze({
  small: 8,
  normal: 10,
  large: 12,
});

let anchorRadius = anchorToPx[prevAnchorRadius];

// other
let vertices = [];
let dragIndex = false;
let isMouseDown = false;
let cWidth = canvas.width;
let cHeight = canvas.height;
let currActionMode = actionModes.draw;

canvas.style.cursor = "crosshair";
ctx.lineWidth = strokeWidth;

const setActionMode = (mode) => {
  document
    .getElementById(`action-${currActionMode}-btn`)
    .classList.toggle("active");
  document.getElementById(`action-${mode}-btn`).classList.toggle("active");
  currActionMode = mode;
};

const resetVars = () => {
  vertices = [];
  dragIndex = false;
  isMouseDown = false;

  cWidth = canvas.width;
  cHeight = canvas.height;

  setActionMode(actionModes.draw);
  setClipPathCode();
};

const redrawCanvas = () => {
  if (vertices.length === 0) return;

  if (currActionMode === actionModes.draw) {
    drawEdges(ctx, vertices);
  } else {
    completePolygon(ctx, vertices);
    drawAnchors(ctx, vertices, anchorRadius);
  }
};

const setCanvasStroke = (color) => {
  ctx.strokeStyle = color === "light" ? "black" : "white";
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

  isMouseDown = true;

  if (currActionMode !== actionModes.draw) {
    let removeIdx = -1;

    for (let idx = 0; idx < vertices.length; idx++) {
      drawSingleCircle(ctx, vertices[idx], anchorRadius);
      if (ctx.isPointInPath(coords.x, coords.y)) {
        if (currActionMode === actionModes.reshape) {
          dragIndex = idx + 1;
          break;
        } else if (currActionMode === actionModes.removeVertex) {
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

  if (currActionMode !== actionModes.draw) {
    if (dragIndex) {
      vertices[dragIndex - 1] = {
        color: vertices[dragIndex - 1].color,
        ...coords,
      };

      if (dragIndex === 1) {
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
    dragIndex = false;
    return;
  }

  const coords = getCoords(cursorMode, e, true);

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

canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
canvas.addEventListener("touchend", handleTouchEnd, { passive: true });

const themeManager = new ThemeManager(themeIcon);

themeManager.loadTheme();
setCanvasStroke(themeManager.theme);

themeManager.onSystemChange = () => {
  setCanvasStroke(themeManager.theme);
  redrawCanvas();
};

themeBtn.onclick = () => {
  themeManager.toggleTheme();
  setCanvasStroke(themeManager.theme);
  redrawCanvas();
};

settingsBox.onclick = (e) => {
  e.stopPropagation();
};

settingsBtn.onclick = (e) => {
  const displayState = settingsBox.style.display;
  settingsBox.style.display = displayState === "flex" ? "none" : "flex";
  e.stopPropagation();
};

document.onclick = (e) => {
  settingsBox.style.display = "none";
};

copyCodeBtn.onclick = () => {
  const el = document.createElement("textarea");
  el.value = clipPathCodeElement.innerText;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

clearCanvasBtn.onclick = () => {
  canvas.style.cursor = "crosshair";
  resetVars();
  clearCanvas(ctx);
};

reshapePolygonBtn.onclick = () => {
  canvas.style.cursor = "move";
  setActionMode(actionModes.reshape);

  setClipPathCode();

  completePolygon(ctx, vertices);
  drawAnchors(ctx, vertices, anchorRadius);
};

drawBtn.onclick = () => {
  if (currActionMode === actionModes.draw) return;

  canvas.style.cursor = "crosshair";
  setActionMode(actionModes.draw);

  setClipPathCode();

  vertices = vertices.slice(0, vertices.length - 1);
  drawEdges(ctx, vertices);
};

removeVertexBtn.onclick = () => {
  canvas.style.cursor = "pointer";
  setActionMode(actionModes.removeVertex);

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
  ctx.strokeStyle = themeIcon.classList.contains("fa-sun") ? "black" : "white";

  drawEdges(ctx, vertices);
};

strokeForm.addEventListener("change", function (e) {
  const elements = strokeForm.elements;

  let newStrokeWidth = "";

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].checked) {
      newStrokeWidth = elements[i].value;
      break;
    }
  }

  document
    .getElementById(`stroke-${prevStrokeWidth}-label`)
    .classList.toggle("active");
  document
    .getElementById(`stroke-${newStrokeWidth}-label`)
    .classList.toggle("active");

  prevStrokeWidth = newStrokeWidth;
  strokeWidth = strokeToPx[newStrokeWidth];
  ctx.lineWidth = strokeToPx[newStrokeWidth];
});

anchorForm.addEventListener("change", function (e) {
  const elements = anchorForm.elements;

  let newAnchorRadius = "";

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].checked) {
      newAnchorRadius = elements[i].value;
      break;
    }
  }

  document
    .getElementById(`anchor-${prevAnchorRadius}-label`)
    .classList.toggle("active");
  document
    .getElementById(`anchor-${newAnchorRadius}-label`)
    .classList.toggle("active");

  prevAnchorRadius = newAnchorRadius;
  anchorRadius = anchorToPx[newAnchorRadius];
});
