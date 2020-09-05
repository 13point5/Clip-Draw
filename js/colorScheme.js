const darkLightBtn = document.getElementById("dark-light-btn");
const modeIcon = document.getElementById("dark-light-btn").children[0];

const setColorScheme = (colorScheme, ctx = undefined) => {
  if (colorScheme === "light") {
    modeIcon.classList.remove("fa-moon");
    modeIcon.classList.add("fa-sun");
    document.body.classList.remove("dark-mode");
  } else {
    modeIcon.classList.remove("fa-sun");
    modeIcon.classList.add("fa-moon");
    document.body.classList.add("dark-mode");
  }

  if (typeof ctx !== "undefined") {
    ctx.strokeStyle = colorScheme === "light" ? "black" : "white";
  }

  localStorage.setItem("colorScheme", colorScheme);
};

const loadColorScheme = (ctx = undefined) => {
  const savedColorScheme = localStorage.getItem("colorScheme");

  if (!savedColorScheme) {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setColorScheme("dark", ctx);
    } else {
      setColorScheme("light", ctx);
    }
  } else {
    setColorScheme(savedColorScheme, ctx);
  }
};

const addSystemColorChangeListener = (ctx = undefined, fn = undefined) => {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const newColorScheme = e.matches ? "dark" : "light";
      setColorScheme(newColorScheme, ctx);

      if (typeof fn === "function") {
        fn();
      }
    });
};

darkLightBtn.onclick = () => {
  const colorScheme = modeIcon.classList.contains("fa-sun") ? "dark" : "light";
  setColorScheme(colorScheme);
};

loadColorScheme();
addSystemColorChangeListener();

export { setColorScheme, loadColorScheme, addSystemColorChangeListener };
