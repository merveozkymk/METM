// backend/middleware/auth.js
// Gelen isteklerdeki JWT token'ı doğrulayan middleware fonksiyonu.

const jwt = require('jsonwebtoken'); // JWT kütüphanesini içe aktar

// JWT token'ları imzalamak ve doğrulamak için kullanılan GİZLİ anahtar.
// Bu anahtarın server.js dosyasındaki anahtarla AYNI olması ÇOK ÖNEMLİDİR.
// Gerçek uygulamada bu anahtar ASLA kodun içine yazılmamalı, güvenli bir şekilde ortam değişkenlerinden alınmalıdır.
const JWT_SECRET = process.env.JWT_SECRET || 'cokgizlibirvarsayilangizlianahtar'; // server.js'teki anahtarla aynı olmalı!

// Kimlik doğrulama (Authentication) middleware fonksiyonu.
// Bu fonksiyon, yetkilendirme gerektiren endpointlere gelen her istekten önce çalışır.
function authenticateToken(req, res, next) {
    // Gelen isteğin başlıklarından (headers) 'Authorization' başlığını alıyoruz.
    // Genellikle formatı "Bearer TOKEN_BURAYA_GELİR" şeklindedir.
    const authHeader = req.headers['authorization'];
    // 'Bearer ' kısmını başlığın başından atarak sadece token stringini alıyoruz.
    // authHeader varsa ve 'Bearer ' ile başlıyorsa (split ile ayırınca ikinci eleman) token'ı al, yoksa token null olur.
    const token = authHeader && authHeader.split(' ')[1];

    // Eğer token yoksa (kullanıcı yetkilendirme başlığı göndermemişse)
    if (token == null) {
        // 401 Unauthorized (Yetkisiz) HTTP yanıtı dön ve isteği sonlandır.
        console.log('Yetkilendirme token\'ı bulunamadı. İstek reddedildi.');
        return res.status(401).json({ message: 'Yetkilendirme token\'ı gerekli.' });
    }

    // Token varsa, bu token'ı JWT_SECRET gizli anahtarımız ile doğrula.
    // jwt.verify fonksiyonu: token, gizli anahtar ve bir callback fonksiyonu alır.
    // Callback fonksiyonu: Doğrulama başarılı olursa (null, payload) veya hata olursa (hata objesi) çağrılır.
    // payload (burada 'user' olarak adlandırıldı): Token oluşturulurken içine koyduğumuz veridir (örn: userId, email, role).
    jwt.verify(token, JWT_SECRET, (err, user) => { // user değişkeni token'ın payload'unu içerecek
        if (err) {
            // Token geçersizse (imzası yanlış, süresi dolmuş vb.) bir hata oluşur.
            console.error('Yetkilendirme token\'ı geçersiz veya süresi dolmuş:', err.message);
            // 403 Forbidden (Yasak) HTTP yanıtı dön ve isteği sonlandır (token var ama geçersiz).
            // Frontend bu cevabı alıp kullanıcıyı login sayfasına yönlendirmelidir.
            return res.status(403).json({ message: 'Yetkilendirme token\'ı geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.' });
        }

        // Token geçerliyse, token payload'ındaki kullanıcı bilgisini (user objesi) istek objesine ekliyoruz.
        // Bu sayede, bu middleware'den sonra çalışacak olan route handler fonksiyonları (GET /api/tasks gibi)
        // req.user.userId, req.user.role gibi bilgilere kolayca erişebilir.
        req.user = user; // req objesine 'user' adında yeni bir özellik ekledik

        // Her şey yolundaysa (token var ve geçerli), isteği işlemeye devam etmesi için
        // bir sonraki middleware'e veya asıl route handler fonksiyonuna geçiyoruz.
        next();
    });
}

// Oluşturduğumuz authenticateToken middleware fonksiyonunu Node.js modülü olarak dışa aktarıyoruz.
module.exports = authenticateToken;

// Bu dosya burada biter. Devamında başka bir kod OLMAMALIDIR.