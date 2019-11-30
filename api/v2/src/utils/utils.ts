import * as fs from "fs";
import * as path from "path";
import { cancel, format, register, render } from "timeago.js";
import { getRepository, getTreeRepository } from "typeorm";
import config from "../config/config";
import { File } from "../entity/File";

export function genID(length = 16) {
   let result           = "";
   const characters       = "abcdefghijklmnopqrstuvwxyz0123456789";
   const charactersLength = characters.length;
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

export function howLongAgo(d: Date | string) {
   const localeFunc = (n: number, index: number, totalSec: number): any => {
      return [
        ["gerade eben", "gerade eben"],
        ["vor %s Sekunden", "in %s Sekunden"],
        ["vor 1 Minute", "in 1 Minute"],
        ["vor %s Minuten", "in %s Minuten"],
        ["vor 1 Stunde", "in 1 Stunde"],
        ["vor %s Stunden", "in %s Stunden"],
        ["vor 1 Tag", "in 1 Tag"],
        ["vor %s Tagen", "in %s Tagen"],
        ["vor 1 Woche", "in 1 Woche"],
        ["vor %s Wochen", "in %s Wochen"],
        ["vor 1 Monat", "in 1 Monat"],
        ["vor %s Monaten", "in %s Monaten"],
        ["vor 1 Jahr", "in 1 Jahr"],
        ["vor %s Jahren", "in %s Jahren"],
      ][index];
    };
   register("de_DE", localeFunc);
   return format(d, "de_DE");
}

export async function getStoragePath(element: File, projectId?: number) {
   if (element == undefined && projectId) {
      return path.join(config.storagePath, projectId.toString());
   }
   if (!projectId) {
      if (!(element.project && element.project.id)) {
         const fileRepository = getRepository(File);
         const el = await fileRepository.findOne(element.id, {relations: ["project"]});
         element.project = el.project;
         projectId = el.project.id;
      } else {
         projectId = element.project.id;
      }
   }
   return path.join(config.storagePath, projectId.toString(), await getFilePath(element));
}

export async function getFilePath(element: File) {
   const treeRepository = getTreeRepository(File);
   const tree = await treeRepository.findAncestorsTree(element);
   return getDeepPath(tree);
}

function getDeepPath(element: File) {
   if (element.parent) {
      return path.join(getDeepPath(element.parent), element.name);
   } else {
      return element.name;
   }
}

export function deleteFolderRecursive(p: string) {
   if (fs.existsSync(p)) {
     fs.readdirSync(p).forEach((file, index) => {
       const curPath = path.join(p, file);
       if (fs.lstatSync(curPath).isDirectory()) {
         deleteFolderRecursive(curPath);
       } else {
         fs.unlinkSync(curPath);
       }
     });
     fs.rmdirSync(p);
   }
 }