import * as emailTemplates from "email-templates";
import * as i18n from "i18n";
import * as nodeMailer from "nodemailer";
import * as path from "path";
import { toInt } from "./utils";

export function sendMail(config, to: string, data: {summary: string;
    title: string; subtitle: string; secondTitle: string; content: string; subject: string;
    cardTitle: string; cardSubtitle: string; btnText: string; btnUrl: string;}, template = "base") {
    const locals: any = data;
    locals.sentTo = i18n.__("mail.sentTo").replace("%s", to);
    locals.unsubscribe = i18n.__("mail.unsubscribe");
    locals.unsubscribeUrl = `${config.URL}settings`;
    locals.info = i18n.__("mail.info");
    return new Promise<any>((resolve, reject) => {
        const transporter = nodeMailer.createTransport({
            auth: {
                user: config.MAIL_SERVER_USER,
                pass: config.MAIL_SERVER_PASSWORD,
            },
            host: config.MAIL_SENDER_ADDRESS,
            port: toInt(config.MAIL_SERVER_PORT),
        });
        // eslint-disable-next-line new-cap
        const email = new emailTemplates({
            message: { from: config.emailSender },
            preview: false,
            send: true,
            transport: transporter,
            views: {
                options: {
                    extension: "ejs",
                },
                root: path.resolve(__dirname, "../../assets/mail-templates"),
            },
        });
        email
            .send({
                locals,
                message: { to },
                template,
            })
            .then((info) => {
                resolve(info);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

export function sendMultipleMails(config, to: string[], data: {summary: string;
    title: string; subtitle: string; secondTitle: string; content: string; subject: string;
    cardTitle: string; cardSubtitle: string; btnText: string; btnUrl: string;}, template = "base") {
    for (const recipient of to) {
        sendMail(config, recipient, data, template);
    }
}

export function sendMailIfAgreed(config, to: string, data: {summary: string;
    title: string; subtitle: string; secondTitle: string; content: string; subject: string;
    cardTitle: string; cardSubtitle: string; btnText: string; btnUrl: string;}, template = "base") {
    // ToDo check if user agreed!
    sendMail(config, to, data, template);
}
