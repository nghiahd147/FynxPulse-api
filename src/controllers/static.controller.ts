import { Request, Response } from "express";
import path from "path";
import { HTTP_STATUS } from "~/constants/httpStatus";

export const serveImageController = (req: Request, res: Response) => {
    const { name } = req.params
    return res.sendFile(path.resolve(path.resolve('uploads'), name), (err) => {
        if (err) {
            res.status(HTTP_STATUS.NOT_FOUND).send("Not Found !!!")
        }
    })
}