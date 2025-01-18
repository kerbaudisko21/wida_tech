import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .xlsx files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadFile = upload.single('file');