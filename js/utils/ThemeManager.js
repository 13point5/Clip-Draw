class ThemeManager {
  constructor(themeIcon) {
    this.themeIcon = themeIcon;
    this.theme = "dark";

    this.loadTheme();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        const newTheme = e.matches ? "dark" : "light";
        this.setTheme(newTheme);
        this.onSystemChange();
      });
  }

  setTheme(theme) {
    if (theme === "light") {
      this.themeIcon.classList.remove("fa-moon");
      this.themeIcon.classList.add("fa-sun");
      document.body.classList.remove("dark-mode");
    } else {
      this.themeIcon.classList.remove("fa-sun");
      this.themeIcon.classList.add("fa-moon");
      document.body.classList.add("dark-mode");
    }

    this.theme = theme;
    localStorage.setItem("theme", theme);
  }

  toggleTheme() {
    const newColor = this.theme === "light" ? "dark" : "light";
    this.setTheme(newColor);
  }

  loadTheme() {
    let savedColor = localStorage.getItem("theme");

    if (!savedColor) {
      savedColor = "light";

      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        savedColor = "dark";
      }
    }

    this.setTheme(savedColor);
  }

  onSystemChange() {}
}

export default ThemeManager;
