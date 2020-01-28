import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as fs from "fs";
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
import { Task } from "./entity/Task";
import { Template } from "./entity/Template";
import { Tutorial } from "./entity/Tutorial";
import { TutorialStep } from "./entity/TutorialStep";
import { User } from "./entity/User";
import { Usergroup } from "./entity/Usergroup";
import { createUsergroups1574018071536 } from "./migration/1574018071536-createUsergroups";
import { createAdminUser1574018391679 } from "./migration/1574018391679-createAdminUser";
import { CreateTags1574797035707 } from "./migration/1574797035707-CreateTags";
import routes from "./routes";
import { toInt } from "./utils/utils";

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
    Project, Tag, Template, Tutorial, TutorialStep, User, Usergroup, Task],
   host: config.database_host,
   logging: false,
   migrations: [createUsergroups1574018071536, createAdminUser1574018391679, CreateTags1574797035707],
   migrationsRun: true,
   password: config.database_password,
   port: toInt(config.database_port),
   synchronize: true,
   type: "mysql",
   username: config.database_user,
})
  .then(async (connection) => {
    await connection.query("SET NAMES utf8mb4;");
    await connection.synchronize();
    // tslint:disable-next-line: no-console
    console.log("Migrations: ", await connection.runMigrations());
    // Check if all folders exist
    if (!fs.existsSync(config.storagePath)) { fs.mkdirSync(config.storagePath); }
    if (!fs.existsSync(config.templateFilesStoragePath)) { fs.mkdirSync(config.templateFilesStoragePath); }
    if (!fs.existsSync(config.tempFilesStoragePath)) { fs.mkdirSync(config.tempFilesStoragePath); }
    if (!fs.existsSync(config.tutorialFilesStoragePath)) { fs.mkdirSync(config.tutorialFilesStoragePath); }
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
