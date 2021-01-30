const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);

module.exports = (app) => {
  app.set("trust proxy", true);
  app.use(
    session({
      secret: process.env.SESS_SECRET,
      name: "sessionID",
      proxy: true,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 60 * 60 * 24 * 1000,
      }),
    })
  );
};