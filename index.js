require("dotenv").config()
var createError = require("http-errors");
const bodyParser = require('body-parser');

var express = require("express");
var app = express();
var path = require("path");

const scrabe = require("./app.js")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// var logger = require("morgan");
var livereload = require("livereload");
var connectLiveReload = require("connect-livereload");

const PORT = process.env.PORT || 5000
// var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});


app.use(connectLiveReload());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render('Home', {
        isSaved: "none"
    })
});

app.post("/api", async (req, res) => {
    // console.log(req.body)
    const { url } = req.body;
    if (!url) res.status(400).json({ "data": "url is missing" })
    else {
        scrabe(url)
            .then(message => {
                res.status(200).json({ message })
            }).catch(err => res.status(500).json({ "message": "something went wrong" }))
    }
})
// app.use("/users", usersRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });


app.listen(PORT, (req, res) => {
    console.log(`http://localhost:${PORT}`)
})
module.exports = app;