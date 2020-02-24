import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { File } from "../entity/File";
import { genID } from "../utils/utils";

// tslint:disable-next-line: class-name
export class addFileEditTags1239083953412 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const fileRepository = getRepository(File);
        let files = await fileRepository.find({where: {isFolder: false}});
        files = files.filter((f) => !f.editKey);
        for (const file of files) {
            file.editKey = genID(15);
            await fileRepository.save(file);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        //
    }

}
