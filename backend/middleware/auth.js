const jwt = require('jsonwebtoken'); 

const JWT_SECRET = process.env.JWT_SECRET || 'cokgizlibirvarsayilangizlianahtar'; 

// Kimlik doğrulama (Authentication) middleware fonksiyonu.
function authenticateToken(req, res, next) {
 
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log('Yetkilendirme token\'ı bulunamadı. İstek reddedildi.');
        return res.status(401).json({ message: 'Yetkilendirme token\'ı gerekli.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Yetkilendirme token\'ı geçersiz veya süresi dolmuş:', err.message);
            return res.status(403).json({ message: 'Yetkilendirme token\'ı geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.' });
        }

        req.user = user; 

        next();
    });
}


module.exports = authenticateToken;