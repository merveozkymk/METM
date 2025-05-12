const express = require('express');
const sqlite3 = require('sqlite3').verbose(); 
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const db = require('./database'); 
const cors = require('cors'); 

const app = express();


const PORT = process.env.PORT || 3000;

// gizli anahtar
const JWT_SECRET = process.env.JWT_SECRET || 'cokgizlibirvarsayilangizlianahtar';


app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:5500', // VS Code Live Server'ın çalıştığı adres
    credentials: true
}));


// API endpointler

// register endpointi
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Kullanıcı adı, e-posta ve şifre gerekli.' });
    }

    // Kullanıcının girdiği açık parolayı bcrypt kullanarak hash'liyoruz.
    // 10 değeri, hashing işleminin ne kadar hesaplama gerektireceğini (algoritmanın tur sayısı) belirler. Daha yüksek değer daha güvenlidir ama daha yavaştır.
    bcrypt.hash(password, 10, (err, password_hash) => {
        if (err) {
            // Hashleme sırasında bir hata olursa konsola yazdır ve 500 Internal Server Error dön.
            console.error("Parola hashleme hatası:", err.message);
            return res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.' });
        }

        // Kullanıcıyı veritabanına kaydediyoruz.
        // 'role' sütunu database.js dosyasında 'DEFAULT user' olarak ayarlandığı için,
        // INSERT sorgusunda role'ü belirtmesek bile veritabanı otomatik olarak 'user' değerini atar.
        const insertUser = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';

        // db.run, INSERT, UPDATE, DELETE gibi işlemleri çalıştırmak için kullanılır.
        // function(err) yerine arrow function kullanmamız, 'this' ile lastID'ye erişmemizi sağlar.
        db.run(insertUser, [username, email, password_hash], function(err) {
            if (err) {
                // Veritabanına ekleme sırasında bir hata olursa (örn: UNIQUE constraint ihlali - e-posta veya kullanıcı adı zaten var)
                if (err.message.includes('UNIQUE constraint failed')) {
                    // Hata mesajından hangi alanın benzersizlik hatası verdiğini bulmaya çalış
                    let field = err.message.includes('email') ? 'E-posta' : 'Kullanıcı adı';
                    // 409 Conflict status kodu ile kullanıcıya bilgi ver.
                    return res.status(409).json({ message: `${field} zaten kayıtlı.` });
                }
                // Diğer veritabanı hataları için
                console.error("Veritabanına kullanıcı ekleme hatası:", err.message);
                return res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu.' });
            }

            // Başarılı ekleme sonrası, yeni eklenen kullanıcının veritabanı ID'sini alıyoruz.
            const userId = this.lastID;

            // Başarılı kayıt yanıtı gönderiyoruz.
            // Frontend'e kullanıcı ID'si, kullanıcı adı, e-posta ve atanan rol bilgisini döndürüyoruz.
            res.status(201).json({ // 201 Created status kodu, yeni bir kaynak oluşturulduğunu belirtir.
                message: 'Kullanıcı başarıyla kaydedildi!',
                userId: userId,
                username: username,
                email: email,
                role: 'user' // Kayıt olan kullanıcıya atanan varsayılan rolü yanıta ekle
                // İsteğe bağlı: Kayıt sonrası otomatik login yapıp token da dönebilirsiniz. Bu durumda login endpointindeki token oluşturma logicini buraya taşımanız gerekir.
            });
        });
    });
});

// Giriş (Login) Endpointi: Frontend'den '/api/auth/login' adresine POST isteği geldiğinde bu fonksiyon çalışır.
app.post('/api/auth/login', (req, res) => {
    // Frontend'den gelen giriş bilgilerini (e-posta ve parola) alıyoruz.
    const { email, password } = req.body;

    // Basit sunucu tarafı doğrulama (E-posta veya parolanın boş olup olmadığını kontrol etme).
    if (!email || !password) {
        return res.status(400).json({ message: 'E-posta ve şifre gerekli.' });
    }

    // Veritabanında, gelen e-posta adresine sahip kullanıcıyı arıyoruz.
    // SELECT * ile kullanıcının tüm sütunlarını (ID, kullanıcı adı, e-posta, parola hash'i, ROL vb.) alıyoruz.
    const findUser = 'SELECT * FROM users WHERE email = ?';
    db.get(findUser, [email], (err, user) => {
        if (err) {
            // Veritabanı sorgusu sırasında bir hata olursa
            console.error("Veritabanından kullanıcı çekme hatası:", err.message);
            return res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
        }

        // Eğer belirtilen e-posta ile veritabanında bir kullanıcı bulunamazsa
        if (!user) {
            // Güvenlik nedeniyle, kullanıcı bulunamadığında da "E-posta yanlış" demek yerine genel bir hata mesajı döneriz.
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' }); // 401 Unauthorized status kodu
        }

        // Kullanıcı veritabanında bulunduysa, şimdi girilen açık parolayı, veritabanındaki hash'lenmiş parola ile karşılaştırıyoruz.
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                // Parola karşılaştırma sırasında bir hata olursa
                console.error("Parola karşılaştırma hatası:", err.message);
                return res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
            }

            // Eğer parola hash ile EŞLEŞMİYORSA
            if (!isMatch) {
                 // Güvenlik nedeniyle, parola yanlış olduğunda da "Şifre yanlış" demek yerine genel bir hata mesajı döneriz.
                return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
            }

            // --- Parola Eşleşiyorsa: Kullanıcı Başarıyla Doğrulandı! ---

            // Kullanıcı için bir JWT (JSON Web Token) oluşturuyoruz.
            // Bu token, kullanıcının kimliğini ve yetkilerini (rolü gibi) temsil eder.
            // Frontend bu token'ı saklayacak ve yetkilendirme gerektiren (örn: görevleri çekme) sonraki isteklere ekleyecek.
            const payload = {
                userId: user.id, // Token'a kullanıcının ID'sini ekliyoruz
                email: user.email, // Token'a kullanıcının e-postasını ekliyoruz
                username: user.username, // Token'a kullanıcının kullanıcı adını ekliyoruz
                role: user.role // <<< ÖNEMLİ: Kullanıcının ROLÜNÜ token'a ekliyoruz <<<
                // Dikkat: Token'a asla parola gibi hassas bilgiler eklemeyin!
            };

            // Token'ı önceden belirlediğimiz gizli anahtarımız (JWT_SECRET) ile imzalıyoruz.
            // Token'ın geçerlilik süresini { expiresIn: 'süre' } ile belirtebilirsiniz (örn: '1h' = 1 saat, '7d' = 7 gün).
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token 1 saat geçerli olacak şekilde ayarlandı.


            // Başarılı giriş yanıtı gönderiyoruz.
            // Frontend'e bir başarı mesajı, oluşturulan token ve kullanıcı bilgilerini (rolü dahil) döndürüyoruz.
            res.status(200).json({ // 200 OK status kodu, isteğin başarılı olduğunu belirtir.
                message: 'Giriş başarılı!',
                token: token, // Frontend'in saklayacağı JWT token'ı
                user: { // Frontend'de kullanmak için temel kullanıcı bilgileri (isteğe bağlı ama kullanışlı)
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role // <<< Kullanıcının ROLÜNÜ başarılı yanıta da ekle <<<
                }
            });
        });
    });
});

// --- AUTH Endpointleri Sonu ---


// --- Diğer API Endpointleri (Tasklar gibi) Buraya Gelecek ---
// Örneğin, görevlerle ilgili endpointleri ayrı bir dosyada (routes/taskRoutes.js) tanımlayıp burada içe aktarabilirsiniz:
// const taskRoutes = require('./routes/taskRoutes');
// app.use('/api/tasks', taskRoutes(db, jwt, JWT_SECRET)); // '/api/tasks' ile başlayan istekleri taskRoutes'a yönlendir

// Veya görev endpointlerini doğrudan buraya yazabilirsiniz:
// app.get('/api/tasks', (req, res) => {
//     // Görevleri çekme logic burada olacak (yetkilendirme kontrolü GEREKLİ!)
// });
// app.post('/api/tasks', (req, res) => {
//     // Görev ekleme logic burada olacak (yetkilendirme kontrolü GEREKLİ!)
// });
// ... PUT, PATCH, DELETE endpointleri ...


// --- Hata Yakalama Middleware'leri ---
// Eğer yukarıdaki hiçbir endpoint gelen istekle eşleşmezse, bu middleware çalışır ve 404 Not Found hatası oluşturur.
app.use((req, res, next) => {
    const error = new Error('Bulunamadı (Not Found)');
    error.status = 404;
    next(error); // Oluşturulan hatayı bir sonraki hata işleyici middleware'e ilet
});

// Bu middleware, uygulamada meydana gelen tüm hataları (hem bizim fırlattığımız hem de Express'in yakaladığı) işler.
app.use((error, req, res, next) => {
    // Yanıtın HTTP status kodunu belirler (hata objesinde status varsa onu kullan, yoksa 500 Internal Server Error).
    res.status(error.status || 500);
    // Yanıt olarak bir JSON objesi gönderir (genellikle hata mesajını içerir).
    res.json({
        error: {
            message: error.message || 'Beklenmeyen bir sunucu hatası oluştu!' // Hata objesindeki mesajı kullan, yoksa genel mesaj dön.
        }
    });
    // Hata detaylarını backend konsoluna yazdırır (debugging için).
    console.error(error.stack);
});
// --- Hata Yakalama Middleware'leri Sonu ---


// Sunucuyu belirtilen portta başlatıyoruz.
app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
    // Geliştirme ortamında JWT gizli anahtarını konsola yazdırmak, güvenlik için önerilmez ancak doğrulama amacıyla faydalı olabilir.
    // console.log(`Kullanılan JWT Gizli Anahtarı (DEVELOPMENT): ${JWT_SECRET}`);
});

// Uygulama kapatıldığında (Ctrl+C gibi sinyaller alındığında) veritabanı bağlantısını düzgünce kapatırız.
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Veritabanı kapatılırken hata:', err.message);
        }
        console.log('SQLite veritabanı bağlantısı kapatıldı.');
        process.exit(0); // Uygulamadan başarıyla çıkış yapar.
    });
});