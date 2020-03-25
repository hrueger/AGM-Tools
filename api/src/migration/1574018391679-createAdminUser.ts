import { getRepository, MigrationInterface } from "typeorm";
import { User } from "../entity/User";
import { Usergroup } from "../entity/Usergroup";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class createAdminUser1574018391679 implements MigrationInterface {
    public async up(): Promise<any> {
        const user = new User();
        user.username = "admin";
        user.password = "admin";
        user.hashPassword();
        user.usergroup = await getRepository(Usergroup).findOne({ where: { name: "Super" } });
        user.email = "admin@agmtools.github.io";
        const userRepository = getRepository(User);
        await userRepository.save(user);
    }

    public async down(): Promise<any> {
        //
    }
}
