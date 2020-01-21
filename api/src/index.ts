import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as helmet from "helmet";
import * as i18n from "i18n";
import * as path from "path";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { config } from "./config/config";
import { Cache } from "./entity/Cache";
import { Event } from "./entity/Event";
import { File } from "./entity/File";
import { Message } from "./entity/Message";
import { Notification } from "./entity/Notification";
import { Project } from "./entity/Project";
import { Tag } from "./entity/Tag";
import { Template } from "./entity/Template";
import { Tutorial } from "./entity/Tutorial";
import { TutorialStep } from "./entity/TutorialStep";
import { User } from "./entity/User";
import { Usergroup } from "./entity/Usergroup";
import routes from "./routes";

i18n.configure({
  defaultLocale: "en",
  directory: path.join(__dirname, "../assets/i18n"),
  objectNotation: true,
});

// Connects to the Database -> then starts the express
createConnection({
   charset : "utf8mb4",
   cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
   },
   database: config.database_name,
   entities: [Cache, Event, File, Message, Notification,
    Project, Tag, Template, Tutorial, TutorialStep, User, Usergroup],
   host: config.database_host,
   logging: false,
   migrations: ["src/migration/**/*.ts"],
   password: config.database_password,
   port: config.database_port,
   subscribers: ["src/subscriber/**/*.ts"],
   synchronize: true,
   type: "mysql",
   username: config.database_user,
})
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
    app.use("/api", routes);

    // Set routes for static built frontend
    app.use("/", express.static(path.join(__dirname, "../../frontend_build")));

    app.listen(config.port, () => {
      // tslint:disable-next-line: no-console
      console.log(`Server started on port ${config.port}!`);
    });
  })
  // tslint:disable-next-line: no-console
  .catch((error) => console.log(error));
