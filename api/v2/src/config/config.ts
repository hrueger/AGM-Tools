import * as path from "path";

const mainStoragePath = path.join(__dirname, "../../../../filestest");

export default {
  avalibleDiskSpaceInGB: 300,
  cacheExpireDays: 3,
  jwtSecret: "2384ND024nasd2uq2",
  storagePath: mainStoragePath,
  tutorialFilesStoragePath: path.join(mainStoragePath, "tutorialFiles"),
};
