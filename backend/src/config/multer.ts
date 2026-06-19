import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

export const multerConfig = {
  // Configura para salvar direto no disco (na pasta uploads)
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      // Cria um código aleatório para evitar que dois arquivos com o nome "rg.pdf" se sobrescrevam
      const hash = crypto.randomBytes(6).toString('hex');
      const fileName = `${hash}-${file.originalname}`;
      
      cb(null, fileName);
    }
  })
};