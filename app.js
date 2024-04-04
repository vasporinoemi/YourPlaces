const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  /* azért van szükség a lenti header-re, mert a különböző domainek miatt (localhost:3000 és 5000) 
  a böngésző hibaüzenetet ad a szerverről érkező response-ra, ezzel viszont azt mondjuk neki (a * jellel),
  hogy bármely domain-ről fogadjon adatot */
  res.setHeader("Access-Control-Allow-Origin", "*");
  // ezzel megmondom a böngészőnek, hogy milyen header-rel rendelkező requestet fogadjon be
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  // milyen http request-ek használhatók a frontenden
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});

app.use("/api/places", placesRoutes); //  =>  /api/places <- csak ez a route fog a placesRoutes-hoz vezetni
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  // only runs if there's a request which didn't get a response
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  /* express.js észreveszi, hogy ez egy error handling minddleware, vagyis csak akkor fogja ezt 
végrehajtani, ha error van */

  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    }); //deletes the file if something goes wrong, so won't store if it was unsuccessful
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n2sh0nt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(5000); // ez elé kell bekötni az adatbázist, mert csak akkor akarjuk betölteni a backendet, ha sikerült csatlkozni a db-hez
  })
  .catch((err) => {
    console.log(err);
  });
