const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs'); 

// Veritabanı dosyamızın adı. 
const dbFile = './taskmanager.sqlite';

const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error("Veritabanı bağlantı hatası:", err.message);
        throw err;
    }
    console.log('SQLite veritabanına başarıyla bağlanıldı.');

    db.serialize(() => {
        const createGroupsTable = `
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `;
        db.run(createGroupsTable, (err) => {
            if (err) {
                console.error("Gruplar tablosu oluşturulurken hata:", err.message);
            } else {
                console.log('Gruplar tablosu hazır.');
                
                const insertDefaultGroup = 'INSERT OR IGNORE INTO groups (id, name, description) VALUES (?, ?, ?)';
                db.run(insertDefaultGroup, [1, 'Default Group', 'Varsayılan kullanıcı grubu'], function(err) {
                    if (err) {
                        console.error("Varsayılan grup eklenirken hata:", err.message);
                    } else if (this.changes > 0) {
                        console.log('Varsayılan grup "Default Group" eklendi (ID: 1).');
                    }
                });
            }
        });

        
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                group_id INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET DEFAULT
            );
        `;
        db.run(createUsersTable, (err) => {
            if (err) {
                console.error("Kullanıcılar tablosu oluşturulurken hata:", err.message);
            } else {
                console.log('Kullanıcılar tablosu hazır.');
            }
        });

        
        const createTasksTable = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                due_date TEXT,
                completed BOOLEAN DEFAULT 0,
                user_id INTEGER NOT NULL,          -- Görevin atandığı kullanıcı
                created_by INTEGER,                -- Görevi oluşturan adminin ID'si
                group_id INTEGER NOT NULL,         -- Görevin ait olduğu grubun ID'si
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
            );
        `;
        db.run(createTasksTable, (err) => {
            if (err) {
                console.error("Görevler tablosu oluşturulurken hata:", err.message);
            } else {
                console.log('Görevler tablosu hazır.');
            }
        });

    }); 
}); 

module.exports = db;