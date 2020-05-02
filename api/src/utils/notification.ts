import { messaging } from "firebase-admin";
import { User } from "../entity/User";

const fcm = messaging();

function notify(user: User | number, topic: string, options: any) {
    const tokens = [];
    fcm.sendMulticast({
        tokens,
        data: options.payload,
        notification: {
            body: options.body,
            title: options.title,
            imageUrl: options.imageUrl,
        },
    });
}
