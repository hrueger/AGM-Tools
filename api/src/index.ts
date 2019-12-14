import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as helmet from "helmet";
import * as i18n from "i18n";
import * as path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import routes from "./routes";

i18n.configure({
  defaultLocale: "de",
  directory: path.join(__dirname, "i18n"),
  objectNotation: true,
});

// Connects to the Database -> then starts the express
createConnection()
  .then(async (connection) => {
    await connection.query("SET NAMES utf8mb4;");
    await connection.synchronize();
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(fileUpload());
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    // Set all routes from routes folder
    app.use("/", routes);

    app.listen(3000, () => {
      // tslint:disable-next-line: no-console
      console.log("Server started on port 3000!");
    });
  })
  // tslint:disable-next-line: no-console
  .catch((error) => console.log(error));
