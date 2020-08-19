const clearCanvas = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawSingleLine = (ctx, from, to) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
};

const drawSingleCircle = (ctx, vertex, size = 12) => {
    ctx.beginPath();
    ctx.fillStyle = vertex.color;
    ctx.arc(vertex.x, vertex.y, size, 0, Math.PI * 2);
    ctx.fill();
};

const drawAnchors = (ctx, vertices) => {
    vertices.forEach((vertex) => {
        drawSingleCircle(ctx, vertex);
    });
};

const drawEdges = (ctx, vertices) => {
    clearCanvas(ctx);

    ctx.beginPath();
    ctx.moveTo(vertices[0].x, vertices[0].y);
    vertices.forEach((vertex, idx) => {
        if (idx > 0) {
            ctx.lineTo(vertex.x, vertex.y);
        }
    });
    ctx.stroke();
};

const drawPolygon = (ctx, vertices) => {
    drawEdges(ctx, vertices);
    drawAnchors(ctx, vertices);
};

const completePolygon = (ctx, vertices) => {
    if (vertices[0] !== vertices[vertices.length - 1])
        vertices.push(vertices[0]);
    drawEdges(ctx, vertices);
};

export {
    clearCanvas,
    drawSingleLine,
    drawSingleCircle,
    drawAnchors,
    drawEdges,
    drawPolygon,
    completePolygon,
};
