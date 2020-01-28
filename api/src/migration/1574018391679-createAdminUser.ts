import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { User } from "../entity/User";
import { Usergroup } from "../entity/Usergroup";

// tslint:disable-next-line: class-name
export class createAdminUser1574018391679 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const user = new User();
        user.username = "admin";
        user.password = "admin";
        user.hashPassword();
        user.usergroup = await getRepository(Usergroup).findOne({ where: { name: "Super"}});
        user.email = "admin@agmtools.github.io";
        const userRepository = getRepository(User);
        await userRepository.save(user);
    }

    // tslint:disable-next-line: no-empty
    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
