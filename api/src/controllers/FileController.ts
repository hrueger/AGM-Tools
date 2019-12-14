import * as archiver from "archiver";
import { Request, Response } from "express";
import * as fs from "fs";
import * as i18n from "i18n";
import * as mergeFiles from "merge-files";
import * as path from "path";
import * as request from "request";
import { getRepository, getTreeRepository } from "typeorm";
import config from "../config/config";
import { File } from "../entity/File";
import { Project } from "../entity/Project";
import { Tag } from "../entity/Tag";
import { User } from "../entity/User";
import { RequestWithFiles } from "../utils/iRequestWithFiles";
import { deleteFolderRecursive, genID, getStoragePath } from "../utils/utils";

class FileController {
  public static listAll = async (req: Request, res: Response) => {
    const project = await getRepository(Project).findOne(req.params.pid);
    let files = await getTreeRepository(File).findRoots();
    const fileIds = files.map((file) => file.id);
    files = await getRepository(File).findByIds(fileIds, {relations: ["tags", "creator"], where: {project}});
    res.send(files);
  }

  public static showElement = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    const element = await fileRepository.findOne(req.params.id);
    if (element.isFolder) {
      let files = await getTreeRepository(File).findDescendants(element);
      files = files.filter((file) => file.id != element.id);
      const fileIds = files.map((file) => file.id);
      files = await getRepository(File).findByIds(fileIds, {relations: ["tags", "creator"]});
      res.send(files);
    } else {
      res.sendFile(await getStoragePath(element));
    }
  }

  public static downloadElement = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    const element = await fileRepository.findOne(req.params.id);
    await FileController.sendDownloadElement(element, res);
  }

  public static showShare = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    try {
      const element = await fileRepository.find({where: {shareLink: req.params.link}});
      if (element.length == 1) {
        res.send(element[0]);
      } else {
        res.status(404).send({message: i18n.__("errors.shareNotFound")});
      }
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.shareNotFound")} ${e.toString()}`});
    }
  }

  public static downloadShare = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    try {
      const element = await fileRepository.find({where: {shareLink: req.params.link}});
      if (element.length == 1) {
        await FileController.sendDownloadElement(element[0], res);
      } else {
        res.status(404).send({message: i18n.__("errors.shareNotFound")});
      }
    } catch (e) {
      res.status(404).send({message: `${i18n.__("errors.shareNotFound")} ${e.toString()}`});
    }
  }

  public static share = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    const element = await fileRepository.findOne(req.params.id);
    if (element.shareLink && element.shareLink != "") {
      res.send({status: true, link: element.shareLink});
    } else {
      element.shareLink = genID(30);
      await fileRepository.save(element);
      res.send({status: true, link: element.shareLink});
    }
  }

  public static newFolder = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    const { name, pid, fid} = req.body;
    if (!(name && pid)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const userRepo = getRepository(User);
    const projectRepo = getRepository(Project);
    const folder = new File();
    folder.isFolder = true;
    folder.name = name;
    folder.creator = await userRepo.findOne(res.locals.jwtPayload.userId);
    folder.project = await projectRepo.findOne(pid);
    if (fid != -1) {
      folder.parent = await fileRepository.findOne(fid);
    }
    try {
      await fileRepository.save(folder);
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errorWhileCreatingFolder")} ${e.toString()}`});
      return;
    }

    fs.mkdirSync(await getStoragePath(folder));
    res.status(200).send({status: true});
  }

  public static renameElement = async (req: Request, res: Response) => {
    const fileRepository = getRepository(File);
    const { name } = req.body;
    if (!name) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const element = await fileRepository.findOne(req.params.id);
    const origPath = await getStoragePath(element);
    const origParts = origPath.split(path.sep);
    origParts[origParts.length - 1] = name;
    const destPath = origParts.join(path.sep);
    await fs.renameSync(origPath, destPath);
    element.name = name;
    await fileRepository.save(element);
    res.send({status: true});
  }

  public static deleteFile = async (req: Request, res: Response) => {
    const id = req.params.id;
    const fileRepository = getTreeRepository(File);
    try {
      const element = await fileRepository.findOneOrFail(id);

      if (element.isFolder) {
        deleteFolderRecursive(await getStoragePath(element));
      } else {
        fs.unlinkSync(await getStoragePath(element));
      }

      const children = await fileRepository.findDescendants(element);
      let childrenIds = children.map((child) => child.id);
      while (childrenIds.length > 0) {
        for (const childId of childrenIds) {
          try {
            await fileRepository.delete(childId);
            childrenIds = childrenIds.filter((cid) => cid != childId);
          } catch {
            //
          }
        }
      }
      await fileRepository.remove(children);
      await fileRepository.remove(element);
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.errorWhileDeleting")} ${e.toString()}`});
      return;
    }

    res.status(200).send({status: true});
  }

  public static listTags = async (req: Request, res: Response) => {
    const tagRepository = getRepository(Tag);
    const tags = await tagRepository.find();
    res.send(tags);
  }

  public static toggleTag = async (req: Request, res: Response) => {
    const { tagId } = req.body;
    if (!tagId) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const fileRepository = getRepository(File);
    const element = await fileRepository.findOne(req.params.id, { relations: ["tags"]});
    if (element.tags.map((tag) => tag.id).indexOf(tagId) == -1) {
      element.tags.push(await getRepository(Tag).findOne(tagId));
    } else {
      element.tags = element.tags.filter((tag) => tag.id != tagId);
    }
    await fileRepository.save(element);
    res.send({status: true});
  }

  public static trackDocument = async (req: Request, res: Response) => {
    const pathForSave = "C:/Users/Hannes/Desktop/Angular/AGM-Tools/filestest/21/AG_ventskalender_2019_fehlermeldung_herz_03_anmerkungen_hannes.docx";
    const updateFile = (response, body, p) => {
      if (body.status == 2) {
          const file = request.get("GET", body.url);
          fs.writeFileSync(p, file.body);
      }

      response.send({error: 0});
      response.end();
    };

    const readbody = (r, response, p) => {
      let content = "";
      r.on("data", (data) => {
          content += data;
      });
      r.on("end", () => {
          const body = JSON.parse(content);
          updateFile(response, body, p);
      });
    };

    if (req.body.hasOwnProperty("status")) {
      updateFile(res, req.body, pathForSave);
    } else {
      readbody(req, res, pathForSave);
    }
  }

  public static uploadFile = async (req: RequestWithFiles, res: Response) => {
    try {
      if (req.files && req.files.chunkFile) {
        let {chunkIndex, totalChunk, pid, fid} = req.body;
        chunkIndex = parseInt(chunkIndex, undefined);
        totalChunk = parseInt(totalChunk, undefined);
        pid = parseInt(pid, undefined);
        fid = parseInt(fid, undefined);
        if (!(chunkIndex != undefined && totalChunk != undefined && pid != undefined && fid != undefined)) {
          res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
          return;
        }
        const tempSaveDir = path.join(config.tempFilesStoragePath, req.files.chunkFile.name);
        if (!fs.existsSync(tempSaveDir)) {
          fs.mkdirSync(tempSaveDir);
        }
        req.files.chunkFile.mv(path.join(tempSaveDir, `${chunkIndex}.part`));

        // create total file if it is the last chunk
        if (chunkIndex + 1 == totalChunk) {
          let ok = true;
          const chunkFileList = [];
          for (let i = 0; i < totalChunk; i++) {
            const p = path.join(tempSaveDir, `${i}.part`);
            if (!fs.existsSync(p)) {
              ok = false;
            } else {
              chunkFileList.push(p);
            }
          }
          if (ok) {
            const { dest, parentEl } = await FileController.getDestAndParent(fid, pid, req.files.chunkFile.name);
            if (!await mergeFiles(chunkFileList, dest)) {
              res.status(500).send({message: i18n.__("errors.unknown")});
            } else {
              await FileController.createFileInDB(req.files.chunkFile.name, res, pid, fid, parentEl);
            }
          }
        }
      } else {
        if (req.files.UploadFiles && req.files.UploadFiles) {
          let {pid, fid} = req.body;
          pid = parseInt(pid, undefined);
          fid = parseInt(fid, undefined);
          const { dest, parentEl } = await FileController.getDestAndParent(fid, pid, req.files.UploadFiles.name);
          req.files.UploadFiles.mv(dest);
          await FileController.createFileInDB(req.files.UploadFiles.name, res, pid, fid, parentEl);
        }
      }
      res.send("");
      return;
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.error")} ${e.toString()}`});
    }
  }

  private static async sendDownloadElement(element: any, res: Response) {
    if (element.isFolder) {
      const a = archiver("zip");
      res.attachment(`${element.name}.zip`);
      a.pipe(res);
      a.directory(await getStoragePath(element), false);
      await a.finalize();
    } else {
      res.download(await getStoragePath(element));
    }
  }

  private static async getDestAndParent(fid: any, pid: any, filename: string) {
    const parentEl = (fid != -1 ? await getRepository(File).findOneOrFail(fid) : undefined);
    const dest = path.join(await getStoragePath(parentEl, pid), filename);
    return { dest, parentEl };
  }

  private static async createFileInDB(filename: string, res: Response, pid: any, fid: any, parentEl: File) {
    const file = new File();
    file.name = filename;
    file.creator = await getRepository(User).findOneOrFail(res.locals.jwtPayload.userId);
    file.isFolder = false;
    file.project = await getRepository(Project).findOneOrFail(pid);
    if (fid != -1 && parentEl != undefined) {
      file.parent = parentEl;
    }
    getRepository(File).save(file);
  }
}

export default FileController;
