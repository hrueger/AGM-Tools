import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { Tag } from "../entity/Tag";

export class CreateTags1574797035707 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const tagRepository = getRepository(Tag);

        let tag = new Tag();
        tag.name = "Fertig";
        tag.color = "#0cb539";
        tag.textColor = "#ffffff";
        await tagRepository.save(tag);

        tag = new Tag();
        tag.name = "Zu verbessern";
        tag.color = "#0da2e2";
        tag.textColor = "#ffffff";
        await tagRepository.save(tag);

        tag = new Tag();
        tag.name = "In Arbeit";
        tag.color = "#b50b0b";
        tag.textColor = "#ffffff";
        await tagRepository.save(tag);

        tag = new Tag();
        tag.name = "Wichtig";
        tag.color = "#ebef07";
        tag.textColor = "#000000";
        await tagRepository.save(tag);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        //
    }

}
