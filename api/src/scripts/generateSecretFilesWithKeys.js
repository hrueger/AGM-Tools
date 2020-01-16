const fs = require("fs");
const path = require("path");
const content = 'export const config = { avalibleDiskSpaceInGB: 0, cacheExpireDays: 0, database_host: "", database_name: "", database_password: "", database_port: 0, database_user: "", port: 80, emailSender: "", email_auth_pass: "", email_auth_user: "", email_host: "", email_port: 0, googleMapsApiKey: "", jwtSecret: "", storagePath: "", tempFilesStoragePath: "", templateFilesStoragePath: "", tutorialFilesStoragePath: "", url: ``, url_domain: "", url_path: "", url_protocoll: "",};';
fs.writeFileSync(path.join(__dirname, "../config/config.ts"), content);
