import ThemeManager from "../utils/ThemeManager.js";

const themeBtn = document.getElementById("dark-light-btn");
const themeIcon = themeBtn.children[0];

const themeManager = new ThemeManager(themeIcon);

themeBtn.onclick = () => {
  themeManager.toggleTheme();
};
