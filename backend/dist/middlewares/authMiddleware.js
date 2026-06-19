"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    // 1. O Token vem no cabeçalho da requisição (Headers)
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }
    
    // Separar a palavra "Bearer" do código do token
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro de Token.' });
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }
    try {
        // 2. O JWT tenta abrir o token usando a senha secreta
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // 3. Cola o ID e o Cargo do usuário na requisição
        req.userId = decoded.id;
        req.userCargo = decoded.cargo;
        // 4. Libera a passagem para continuar a rota
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}
