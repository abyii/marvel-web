import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import utilRoutes from "./routes/utils.js";
// import devRoutes from "./routes/devRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import getRoutes from "./routes/getRoutes.js";
import updateRoutes from "./routes/updateRoutes.js";
import createRoutes from "./routes/createRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import cloudinary from "cloudinary";
import actionRoutes from "./routes/actionRoutes.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

const app = express();
dotenv.config();

//setting up bodyparser and cors
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLDNRY_CLOUD_NAME,
  api_key: process.env.CLDNRY_API_KEY,
  api_secret: process.env.CLDNRY_API_SECRET,
});

var defaultClient = SibApiV3Sdk.ApiClient.instance;
var apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.SIB_API_KEY;

app.get("/", (req, res) => {
  res.send("Welcome to UVCE Marvel REST API. v 2.05.");
});

//starting points for routes
app.use("", utilRoutes);
// app.use("/dev", devRoutes); // only for dev use
app.use("/get", getRoutes);
app.use("/update", updateRoutes);
app.use("/create", createRoutes);
app.use("/action", actionRoutes);
app.use("/feed", feedRoutes);
app.use("/search", searchRoutes);
app.use("/meta", metaRoutes);

//connecting to cosmos
const PORT = process.env.PORT || 3000;
mongoose
  .connect(
    "mongodb://" +
      process.env.COSMOSDB_HOST +
      ":" +
      process.env.COSMOSDB_PORT +
      "/" +
      process.env.COSMOSDB_DBNAME +
      "?ssl=true&replicaSet=globaldb",
    {
      auth: {
        username: process.env.COSMOSDB_USER,
        password: process.env.COSMOSDB_PASSWORD,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: false,
      retryReads: true,
    }
  )
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Server Running on Port: http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log(`${error}`));
