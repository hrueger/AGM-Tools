import * as emailTemplates from "email-templates";
import * as nodeMailer from "nodemailer";
import * as path from "path";
import config from "../config/config";

export function sendMail(from, to, template, locals) {
    return new Promise<any>((resolve, reject) => {
        const transporter = nodeMailer.createTransport(config.emailSettings);
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
