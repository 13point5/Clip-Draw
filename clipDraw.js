const canvas = document.getElementById("canvas");

if (!canvas.getContext) {
    alert("Canvas is not supported in this browser ☹");
    window.stop();
}

const getPathBtn = document.getElementById("get-path");
const editPolygonBtn = document.getElementById("edit");
const clearCanvasBtn = document.getElementById("clear");
const clipPathCodeElement = document.getElementById("clip-path-code");

const ctx = canvas.getContext("2d");

const cWidth = canvas.width;
const cHeight = canvas.height;
let vertices = [];
let isDrawing = true;
let draggable = false;
let isMouseDown = false;

ctx.lineWidth = 2;

const setClipPathCode = (code) => {
    clipPathCodeElement.textContent = code;
};

const getCurrentCoords = (e) => {
    return {
        x: parseInt(e.clientX - canvas.offsetLeft),
        y: parseInt(e.clientY - canvas.offsetTop),
    };
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
    const currCoords = getCurrentCoords(e);

    if (!isDrawing) {
        for (let idx = 0; idx < vertices.length; idx++) {
            drawSingleCircle(vertices[idx]);
            if (ctx.isPointInPath(currCoords.x, currCoords.y)) {
                draggable = idx + 1;
                break;
            }
        }
    } else {
        if (vertices.length === 0) {
            vertices.push({ x: currCoords.x, y: currCoords.y });
        }
    }
};

const handleMouseMove = (e) => {
    if (!isMouseDown) {
        return;
    }

    const currCoords = getCurrentCoords(e);

    if (!isDrawing) {
        if (draggable) {
            vertices[draggable - 1].x = currCoords.x;
            vertices[draggable - 1].y = currCoords.y;
            drawPolygon();
        }
    } else {
        drawEdges();

        const lastPoint = vertices[vertices.length - 1];
        drawSingleLine(lastPoint.x, lastPoint.y, currCoords.x, currCoords.y);
    }
};

const handleMouseUp = (e) => {
    isMouseDown = false;

    if (!isDrawing) {
        draggable = false;
        return;
    }

    const currCoords = getCurrentCoords(e);

    vertices.push({ x: currCoords.x, y: currCoords.y });

    drawEdges();
};

canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);

clearCanvasBtn.onclick = () => {
    vertices = [];
    isDrawing = true;
    draggable = false;
    isMouseDown = false;
    setClipPathCode("");
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
