require("dotenv").config();

const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);
const app = express();
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);



// CORS setup
app.use(
  cors({
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 200,
    origin: process.env.REACT_APP_CLIENT_POINT,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "HEAD", "PATCH", "DELETE"],
  })
);
// Middleware Setup
app.use(helmet());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./configs/db.config.js");

app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60 * 1000 }, // 60 seconds
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    resave: true,
    saveUninitialized: false,
    ttl: 24 * 60 * 60 // 1 day
  })
}));


// Route setup
app.use("/", require("./routes/index.js"));
app.use("/auth", require("./routes/auth.js"));
app.use("/app", require("./routes/application.js"));

module.exports = app;
