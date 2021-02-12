import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fileUpload from "express-fileupload";
import * as fs from "fs";
import * as helmet from "helmet";
import * as i18n from "i18n";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import * as socketIO from "socket.io";
import "reflect-metadata";
import { createConnection } from "typeorm";
import { Cache } from "./entity/Cache";
import { Event } from "./entity/Event";
import { File } from "./entity/File";
import { Message } from "./entity/Message";
import { Notification } from "./entity/Notification";
import { Project } from "./entity/Project";
import { Setting } from "./entity/Setting";
import { Tag } from "./entity/Tag";
import { Task } from "./entity/Task";
import { Template } from "./entity/Template";
import { Tutorial } from "./entity/Tutorial";
import { TutorialStep } from "./entity/TutorialStep";
import { User } from "./entity/User";
import { Usergroup } from "./entity/Usergroup";
import { addFileEditTags1239083953412 } from "./migration/1239083953412-addFileEditTags";
import { createUsergroups1574018071536 } from "./migration/1574018071536-createUsergroups";
import { createAdminUser1574018391679 } from "./migration/1574018391679-createAdminUser";
import { CreateTags1574797035707 } from "./migration/1574797035707-CreateTags";
import routes from "./routes";
import { toInt } from "./utils/utils";
import { ChatStatus } from "./entity/ChatStatus";
import { Device } from "./entity/Device";
import { createMailDevices2984503475348 } from "./migration/2984503475348-createMailDevices";
import UserController from "./controllers/UserController";
import { getConfig } from "container-env";

const config = getConfig(JSON.parse(fs.readFileSync(path.join(__dirname, "../../container-env.json")).toString()), "/app/agfree-config.json");

export const PATHS = {
    data: "/data",
    temp: "/data/temp",
    tutorials: "/data/tutorials",
    templates: "/data/templates",
}

i18n.configure({
    defaultLocale: config.defaultLanguage ? config.defaultLanguage : "en",
    directory: path.join(__dirname, "../assets/i18n"),
    objectNotation: true,
});

// Connects to the Database -> then starts the express
createConnection({
    charset: "utf8mb4",
    cli: {
        entitiesDir: "src/entity",
        migrationsDir: "src/migration",
        subscribersDir: "src/subscriber",
    },
    database: config.DB_NAME,
    entities: [
        Cache,
        ChatStatus,
        Event,
        File,
        Message,
        Notification,
        Project,
        Device,
        Setting,
        Tag,
        Task,
        Template,
        Tutorial,
        TutorialStep,
        User,
        Usergroup,
    ],
    host: config.DB_HOST,
    logging: false,
    migrations: [
        createUsergroups1574018071536,
        createAdminUser1574018391679,
        CreateTags1574797035707,
        addFileEditTags1239083953412,
        createMailDevices2984503475348,
    ],
    migrationsRun: true,
    password: config.DB_PASSWORD,
    port: toInt(config.DB_PORT),
    synchronize: true,
    type: "mysql",
    username: config.DB_USER,
})
    .then(async (connection) => {
        await connection.query("SET NAMES utf8mb4;");
        await connection.synchronize();
        // eslint-disable-next-line no-console
        console.log("Migrations: ", await connection.runMigrations());
        // Check if all folders exist
        if (!fs.existsSync(PATHS.data)) {
            fs.mkdirSync(PATHS.data);
        }
        if (!fs.existsSync(PATHS.templates)) {
            fs.mkdirSync(PATHS.templates);
        }
        if (!fs.existsSync(PATHS.temp)) {
            fs.mkdirSync(PATHS.temp);
        }
        if (!fs.existsSync(PATHS.tutorials)) {
            fs.mkdirSync(PATHS.tutorials);
        }
        // Create a new express application instance
        const app = express();

        app.locals.config = config;
        
        // Call midlewares
        app.use(fileUpload());
        app.use(cors());
        app.use(helmet());
        app.use(bodyParser.json({ limit: "20mb" }));
        app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

        // Set all routes from routes folder
        app.use("/api", routes);

        const useHTTPS = false; //process.env.NODE_ENV == "development";
        let server;
        if (useHTTPS) {
            server = https.createServer({
                key: fs.readFileSync(path.join(__dirname, "./key.pem")),
                cert: fs.readFileSync(path.join(__dirname, "./cert.pem")),
            }, app);
        } else {
            server = new http.Server(app);
        }
        app.locals.sockets = [];
        app.locals.rtcSockets = [];
        const io = socketIO(server);
        const namespace = io.of("/api/live");
        namespace.on("connection", (socket) => {
            socket.on("login", (data) => {
                UserController.socketLogin(app, socket, data);
            });
        });

        // Set routes for static built frontend
        app.use("/", express.static("/app/dist/frontend"));
        app.use("*", express.static("/app/dist/frontend/index.html"));

        let port = 80;
        if (process.env.NODE_ENV?.trim() == "development") {
            port = 3000;
        }

        server.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`Server started on port ${port}!`);
        });
    })
    // eslint-disable-next-line no-console
    .catch((error) => console.log(error));
