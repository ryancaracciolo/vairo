import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'
import { connectAndCreateDataSource } from '../controllers/connectionController.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../uploads/');
      if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
  },
});
  
const upload = multer({ storage: storage });
  
router.post('/connect', upload.single('file'), connectAndCreateDataSource);

export default router;
