import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { Usergroup } from "../entity/Usergroup";

// tslint:disable-next-line: class-name
export class createUsergroups1574018071536 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const standarduser = new Usergroup();
        standarduser.name = "Standard";
        standarduser.ADD_USER_TO_PROJECT = false;
        standarduser.CREATE_PROJECT = false;
        standarduser.CREATE_USER = false;
        standarduser.DELETE_USER = false;
        standarduser.EDIT_GLOBAL_SETTINGS = false;
        standarduser.EDIT_USER = false;
        standarduser.REMOVE_EVENT = false;
        standarduser.REMOVE_FILE = true;
        standarduser.REMOVE_PROJECT = false;
        await getRepository(Usergroup).save(standarduser);
        const superuser = new Usergroup();
        superuser.name = "Super";
        superuser.ADD_USER_TO_PROJECT = true;
        superuser.CREATE_PROJECT = true;
        superuser.CREATE_USER = true;
        superuser.DELETE_USER = true;
        superuser.EDIT_GLOBAL_SETTINGS = true;
        superuser.EDIT_USER = true;
        superuser.REMOVE_EVENT = true;
        superuser.REMOVE_FILE = true;
        superuser.REMOVE_PROJECT = true;
        await getRepository(Usergroup).save(superuser);
    }

    // tslint:disable-next-line: no-empty
    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
