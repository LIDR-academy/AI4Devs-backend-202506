const multer = require('multer');
import type { Request, Response } from 'express';

const storage = multer.diskStorage({
    destination: function (req: Request, file: any, cb: (error: Error | null, destination: string) => void) {
        cb(null, '../uploads/');
    },
    filename: function (req: Request, file: any, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const fileFilter = (req: Request, file: any, cb: any) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10 // 10MB
    },
    fileFilter: fileFilter
});

export const uploadFile = (req: Request, res: Response) => {
    const uploader = upload.single('file');
    uploader(req, res, function (err: any) {
        if (err && err.name === 'MulterError') {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!(req as any).file) {
            return res.status(400).json({ error: 'Invalid file type, only PDF and DOCX are allowed!' });
        }
        res.status(200).json({
            filePath: (req as any).file.path,
            fileType: (req as any).file.mimetype
        });
    });
};