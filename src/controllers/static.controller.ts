import { Request, Response } from "express";
import path from "path";
import { HTTP_STATUS } from "~/constants/httpStatus";
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR_TEMP } from "~/constants/uploads";

export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params
    return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
        if (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send("Not Found !!!")
        }
    })
}

export const serveVideoController = (req: Request, res: Response) => {
    const { name } = req.params
    return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR_TEMP, name), (err) => {
        if (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send("Not Found !!!")
        }
    })
}