// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs'); // Parola hashleme için

const dbFile = './taskmanager.sqlite';

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    }
    console.log('SQLite veritabanına bağlanıldı.');

    // Kullanıcılar tablosunu oluştur (eğer yoksa)
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT DEFAULT 'user',  -- <<< YENİ: ROL SÜTUNU EKLENDİ <<<
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
    db.run(createUsersTable, (err) => {
        if (err) {
            console.error("Kullanıcılar tablosu oluşturulurken hata:", err.message);

            console.warn("Eğer 'users' tablosu zaten varsa ancak 'role' sütunu eksikse, manuel olarak ALTER TABLE ile sütunu eklemeniz gerekebilir.");

        } else {
            console.log('Kullanıcılar tablosu hazır.');
        }
    });
});

// Veritabanı bağlantısını dışa aktar
module.exports = db;