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
    x: Math.min(
      touch.target.width,
      Math.max(0, touch.pageX - touch.target.offsetLeft)
    ),
    y: Math.min(
      touch.target.height,
      Math.max(0, touch.pageY - touch.target.offsetTop)
    ),
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

const isSameVertex = (v1, v2) => {
  const keys = ["x", "y", "color"];
  return keys.every((key) => v1[key] === v2[key]);
};

export { getCoords, isSameVertex };
