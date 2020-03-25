import { Request } from "express";

export interface RequestWithFiles extends Request {
    files: {
        [key: string]: {
            name: string;
            mv: (destination: string) => void;
            mimetype: string;
            data: Buffer;
            tempFilePath: string;
            truncated: boolean;
            size: number;
            md5: string;
        };
    };
}
