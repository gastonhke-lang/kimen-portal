const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "kimen-secret-credenciales",
    resave: false,
    saveUninitialized: true
  })
);

const DB_PATH = path.join(__dirname, "data", "db.json");
const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === db.admin.email && password === db.admin.password) {
    req.session.user = email;
    return res.redirect("/dashboard");
  }
  res.send("Login incorrecto");
});

function auth(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

app.get("/dashboard", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/operarios", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "operarios.html"));
});

app.get("/api/operarios", auth, (req, res) => {
  res.json(db.operarios);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login.html"));
});

app.listen(PORT, () => {
  console.log("Kimen Portal corriendo en puerto", PORT);
});
