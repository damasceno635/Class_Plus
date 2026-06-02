"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
exports.multerConfig = {
    // Configura para salvar direto no disco (na pasta uploads que você criou)
    storage: multer_1.default.diskStorage({
        destination: path_1.default.resolve(__dirname, '..', '..', 'uploads'),
        filename: (req, file, cb) => {
            // Cria um código aleatório para evitar que dois arquivos com o nome "rg.pdf" se sobrescrevam
            const hash = crypto_1.default.randomBytes(6).toString('hex');
            const fileName = `${hash}-${file.originalname}`;
            cb(null, fileName);
        }
    })
};
