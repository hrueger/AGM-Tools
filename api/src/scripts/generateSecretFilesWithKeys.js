const fs = require("fs");
const path = require("path");
const content = 'export const config = { avalibleDiskSpaceInGB: 1, defaultLanguage: "en", documentServerUrl: "", cacheExpireDays: 1, database_host: "", database_name: "", database_password: "", database_port: 3306, database_user: "", port: 80, emailSender: "", email_auth_pass: "", email_auth_user: "", email_host: "", email_port: 0, mapboxApiKey: "", jwtSecret: "", storagePath: "", tempFilesStoragePath: "", templateFilesStoragePath: "", tutorialFilesStoragePath: "", url: ``, url_domain: "", url_path: "", url_protocoll: "",};';
fs.writeFileSync(path.join(__dirname, "../config/config.ts"), content);