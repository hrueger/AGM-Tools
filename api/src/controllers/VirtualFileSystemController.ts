import { Request, Response } from "express";
import { getRepository, getTreeRepository } from "typeorm";
import { File } from "../entity/File";
import { Project } from "../entity/Project";
import { getStoragePath } from "../utils/utils";

const projectItemGuidStart: string = "f069b07a6ef440cf8254";
const normalItemGuidStart: string = "f069b07b6ef440cf8254";
const parentGuid: string = "00000000000000000000000000000000";
const guidRestLength: number = 12;
const itemTypes: any = {
  file: 0,
  folder: 1,
};

class VirtualFileSystemController {
  public static drives = async (req: Request, res: Response) => {
    res.send({
      Attributes: 0,
      ContentETag: "00",
      CreationTimeUtc: "0001-01-01T00:00:00",
      Id: parentGuid,
      LastWriteTimeUtc: "0001-01-01T00:00:00",
      Length: 0,
      Name: "Servus",
      ParentId: parentGuid,
      Type: 1,
    });
  }
  public static drive = async (req: Request, res: Response) => {
    res.send({});
  }
  public static children = async (req: Request, res: Response) => {
    if (getGuidFromString(req.params.id) == parentGuid) {
      const projectRepository = getRepository(Project);
      const projects = await projectRepository.find();
      res.send(projects.map((p) => {
        return {
          Attributes: 0,
          ContentETag: "00",
          CreationTimeUtc: "0001-01-01T00:00:00",
          Id: getGuidFromId(p.id, true),
          LastWriteTimeUtc: "0001-01-01T00:00:00",
          Length: 0,
          Name: p.name,
          ParentId: getGuidFromString(req.params.id),
          Type: 1,
        };
      }));
    } else {
      const pid = getIdFromGuid(req.params.id);
      if (isProjectGuid(req.params.id)) {
        const project = await getRepository(Project).findOne(pid);
        let files = await getTreeRepository(File).findRoots();
        const fileIds = files.map((file) => file.id);
        files = await getRepository(File).findByIds(fileIds, {relations: ["tags", "creator"], where: {project}});
        res.send(files.map((f) => {
          return {
            Attributes: 0,
            ContentETag: "00",
            CreationTimeUtc: "0001-01-01T00:00:00",
            Id: getGuidFromId(f.id, false),
            LastWriteTimeUtc: "0001-01-01T00:00:00",
            Length: 0,
            Name: f.name,
            ParentId: getGuidFromString(req.params.id),
            Type: f.isFolder ? itemTypes.folder : itemTypes.file,
          };
        }));
        console.log("Sent:", files);
      } else {
        const fileRepository = getRepository(File);
        const element = await fileRepository.findOne(req.params.id);
        if (element && element.isFolder) {
          const file = await getTreeRepository(File).findDescendantsTree(element);
          let files = file.files;
          const fileIds = files.map((f) => f.id);
          files = await getRepository(File).findByIds(fileIds, {relations: ["tags", "creator"]});
          files.map((i) => {
            return {
              Attributes: 0,
              ContentETag: "00",
              CreationTimeUtc: "0001-01-01T00:00:00",
              Id: i.id,
              LastWriteTimeUtc: "0001-01-01T00:00:00",
              Length: 0,
              Name: i.name,
              ParentId: req.params.id,
              Type: i.isFolder ? 1 : 0,
            };
          });
          res.send(files);
          console.log("Sent:", files);
        }
      }
    }
  }
  public static folders = async (req: Request, res: Response) => {
    res.send([
      {
        Attributes: 16,
        ContentETag: "0637142887482964038",
        CreationTimeUtc: "2020-01-10T21:32:28.2964038Z",
        Id: "468d819cdab743c4aeaff94d60f3a4b8",
        LastWriteTimeUtc: "2020-01-10T21:32:28.2964038Z",
        Length: 0,
        Name: "test1",
        ParentId: req.params.id,
        Type: 1,
      },
    ]);
  }
  public static items = async (req: Request, res: Response) => {
    res.send([
      {
        Attributes: 1,
        ContentETag: "92735656434740c68c2636537c93a17d",
        CreationTimeUtc: "0001-01-01T00:00:00",
        Id: "3855336aa8e44e57999e7211fed043ac",
        LastWriteTimeUtc: "0001-01-01T00:00:00",
        Length: 0,
        Name: "Time is 12:19:37.5677226.png",
        ParentId: req.params.id,
        Type: 0,
      },
    ]);
  }
  public static content = async (req: Request, res: Response) => {
    // res.sendFile(await getStoragePath(await getRepository(File).findOne(getIdFromGuid(req.params.id))));
    res.send("Servus");
    res.send({});
  }
}

function getNewGuid() {
   return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      // tslint:disable-next-line: no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === "x" ? r : (r & 0x3 | 0x8);
      return v.toString(16);
   });
}

function getGuidFromId(id: number, isRootItem: boolean) {
  return `${isRootItem ? projectItemGuidStart : normalItemGuidStart}${"0".repeat(guidRestLength - id.toString().length)}${id.toString()}`;
}

function getGuidFromString(s: string) {
  return s.replace(/-/g, "");
}

function isProjectGuid(s: string) {
  s = getGuidFromString(s);
  return s.indexOf(projectItemGuidStart) != -1;
}

function getIdFromGuid(s: string) {
  s = getGuidFromString(s);
  s = s.replace(projectItemGuidStart, "");
  s = s.replace(normalItemGuidStart, "");
  return parseInt(s, undefined).toString();
}
export default VirtualFileSystemController;
