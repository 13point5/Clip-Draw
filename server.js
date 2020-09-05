const express = require("express");
const path = require("path");
const hbs = require("hbs");

const PORT = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "/public");
const viewsPath = path.join(__dirname, "./templates/views");
const partialsPath = path.join(__dirname, "./templates/partials");

const app = express();

app.use(express.static(publicDirPath));

app.set("view engine", "hbs");
app.set("views", viewsPath);
hbs.registerPartials(partialsPath);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Clip Draw running on localhost:${PORT}`);
});
