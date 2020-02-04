import * as emailTemplates from "email-templates";
import * as i18n from "i18n";
import * as nodeMailer from "nodemailer";
import * as path from "path";
import { config } from "../config/config";
import { toInt } from "./utils";

export function sendMail(to: string, data: {summary: string,
    title: string, subtitle: string, secondTitle: string, content: string, subject: string,
    // tslint:disable-next-line: align
    cardTitle: string, cardSubtitle: string, btnText: string, btnUrl: string}, template = "base") {
    const locals: any = data;
    locals.sentTo = i18n.__("mail.sentTo").replace("%s", to);
    locals.unsubscribe = i18n.__("mail.unsubscribe");
    locals.unsubscribeUrl = `${config.url}settings`;
    locals.info = i18n.__("mail.info");
    return new Promise<any>((resolve, reject) => {
        const transporter = nodeMailer.createTransport({
            auth: {
                pass: config.email_auth_pass,
                user: config.email_auth_user,
            },
            host: config.email_host,
            port: toInt(config.email_port),
        });
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

export function sendMultipleMails(to: string[], data: {summary: string,
    title: string, subtitle: string, secondTitle: string, content: string, subject: string,
    // tslint:disable-next-line: align
    cardTitle: string, cardSubtitle: string, btnText: string, btnUrl: string}, template = "base") {
    for (const recipient of to) {
        sendMail(recipient, data, template);
    }
}

export function sendMailIfAgreed(to: string, data: {summary: string,
    title: string, subtitle: string, secondTitle: string, content: string, subject: string,
    // tslint:disable-next-line: align
    cardTitle: string, cardSubtitle: string, btnText: string, btnUrl: string}, template = "base") {
    // ToDo check if user agreed!
    sendMail(to, data, template);
}
