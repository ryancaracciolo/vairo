import express from 'express';
import multer from 'multer';
import path from 'path';
import { connectAndCreateDataSource } from '../controllers/connectionController.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
    },
});
  
const upload = multer({ storage: storage });
  
router.post('/connect', upload.single('file'), connectAndCreateDataSource);

export default router;
