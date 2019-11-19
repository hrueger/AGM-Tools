import * as path from "path";

const mainStoragePath = path.join(__dirname, "../../../../filestest");

export default {
  avalibleDiskSpaceInGB: 300,
  cacheExpireDays: 3,
  emailSettings: {
    auth: {
      pass: "b9c9e7d04bf824",
      user: "c5bbb813340050",
    },
    host: "smtp.mailtrap.io",
    port: 2525,
  },
  jwtSecret: "2384ND024nasd2uq2",
  storagePath: mainStoragePath,
  tutorialFilesStoragePath: path.join(mainStoragePath, "tutorialFiles"),
};
