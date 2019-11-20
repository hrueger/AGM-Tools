import * as path from "path";

const mainStoragePath = path.join(__dirname, "../../../../filestest");
const domain = "localhost";
const pth = "/#/";
const port = 4200;
const protocoll = "http";

export default {
  avalibleDiskSpaceInGB: 300,
  cacheExpireDays: 3,
  emailSender: '"AGM-Tools - No reply" <no-reply@agmtools.github.io>',
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
  urlSettings: {
    domain,
    path: pth,
    port,
    protocoll,
    url: `${protocoll}://${domain}${(port ? (":" + port) : "")}${pth}`,
  },
};
