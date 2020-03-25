import { getRepository, MigrationInterface } from "typeorm";
import { File } from "../entity/File";
import { genID } from "../utils/utils";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class addFileEditTags1239083953412 implements MigrationInterface {
    public async up(): Promise<any> {
        const fileRepository = getRepository(File);
        let files = await fileRepository.find({ where: { isFolder: false } });
        files = files.filter((f) => !f.editKey);
        for (const file of files) {
            file.editKey = genID(15);
            await fileRepository.save(file);
        }
    }

    public async down(): Promise<any> {
        //
    }
}
