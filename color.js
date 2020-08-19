const HSLToRGB = (h, s, l) => {
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
};

const RGBToHex = (r, g, b) => {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
};

const getRandomNumber = (low, high) => {
    var r = Math.floor(Math.random() * (high - low + 1)) + low;
    return r;
};

const getRandomColor = () => {
    const hue = getRandomNumber(0, 360);
    const saturation = getRandomNumber(90, 100);
    const lightness = getRandomNumber(0, 90);

    const { r, g, b } = HSLToRGB(hue, saturation, lightness);
    const hexCode = RGBToHex(r, g, b);

    return hexCode;
};

const getInvertedColor = (hex) => {
    if (hex.indexOf("#") === 0) {
        hex = hex.slice(1);
    }

    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    if (hex.length !== 6) {
        return "#000000";
    }

    const r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);

    // http://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
};

export { getRandomColor, getInvertedColor };
