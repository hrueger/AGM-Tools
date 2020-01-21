import * as emailTemplates from "email-templates";
import * as nodeMailer from "nodemailer";
import * as path from "path";
import { config } from "../config/config";
import { toInt } from "./utils";

export function sendMail(from, to, template, locals) {
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
            message: { from },
            preview: false,
            send: true,
            transport: transporter,
            views: {
                options: {
                    extension: "pug",
                },
                root: path.resolve(__dirname, "emailTemplates"),
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
