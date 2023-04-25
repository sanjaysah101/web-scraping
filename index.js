require("dotenv").config()
var createError = require("http-errors");
const bodyParser = require('body-parser');

var express = require("express");
var app = express();
var path = require("path");

const scrabe = require("./app.js")
const getanchor = require("./getAchor.js")

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

    // const fs = require("fs")
    // const path = require("path")
    // let subfolder = `./IndiaBix`;
    // // fs.promises.mkdir(`./${subfolder}`, { recursive: true });
    // const filePath = path.join(subfolder, `allurl.json`);
    // fs.readFile(filePath, 'utf-8', async (err, data) => {
    //     if (err) console.log(err);
    //     if (data) {
    //         data = JSON.parse(data);

    //         const urlList = [...data];
    //         // console.log(typeof urlList);
    //         // console.log(data[10])
    //         for (let i = 0; i < urlList.length; i++) {
    //             // if(i >= 10){
    //             // console.log(i)

    //             console.log(urlList[i]);
    //             const data = await getanchor(url)
    //             res.json(data);

    //         }
    //     }
    // })
    // res.send("sdf")
});

app.get("/anchor", async (req, res) => {
    const url = "https://www.indiabix.com/";
    const data = await getanchor(url)
    res.json(data);
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