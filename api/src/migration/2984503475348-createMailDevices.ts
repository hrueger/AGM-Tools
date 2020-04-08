import { getRepository, MigrationInterface } from "typeorm";
import { User } from "../entity/User";
import { Device } from "../entity/Device";

// eslint-disable-next-line @typescript-eslint/class-name-casing
export class createMailDevices2984503475348 implements MigrationInterface {
    public async up(): Promise<any> {
        const users = await getRepository(User).find();
        const devices = [];
        for (const user of users) {
            const mailDevice = new Device();
            mailDevice.isMail = true;
            mailDevice.token = user.email;
            mailDevice.chatMessages = true;
            mailDevice.fileCommentReplys = true;
            mailDevice.fileComments = true;
            mailDevice.newEvents = true;
            mailDevice.newProjects = true;
            mailDevice.newTemplates = true;
            mailDevice.newTutorials = true;
            mailDevice.notifications = true;
            mailDevice.upcomingEvents = true;
            mailDevice.user = user;
            mailDevice.mailDelayMinutes = 90;
            devices.push(mailDevice);
        }
        await getRepository(Device).save(devices);
    }

    public async down(): Promise<any> {
        //
    }
}
