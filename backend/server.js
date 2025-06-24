const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database'); 
const cors = require('cors');
const authenticateToken = require('./middleware/auth'); 

const app = express();

const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'cokgizlibirvarsayilangizlianahtar'; 

app.use(express.json());

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://127.0.0.1:5501'], 
    credentials: true 
}));



// Register Endpointi: Yeni kullanıcı kaydı için POST isteği beklenir.
app.post('/api/auth/register', (req, res) => {
    const { username, email, password, group_id } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Kullanıcı adı, e-posta ve şifre gerekli.' });
    }

    bcrypt.hash(password, 10, (err, password_hash) => {
        if (err) {
            console.error("Parola hashleme hatası:", err.message);
            return res.status(500).json({ message: 'Kayıt sırasında beklenmeyen bir hata oluştu.' });
        }

        const finalGroupId = group_id || 1; 

        const insertUser = 'INSERT INTO users (username, email, password_hash, group_id) VALUES (?, ?, ?, ?)';

        db.run(insertUser, [username, email, password_hash, finalGroupId], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ message: 'Bu e-posta adresi veya kullanıcı adı zaten kullanımda.' });
                }
                console.error("Veritabanına yeni kullanıcı ekleme hatası:", err.message);
                return res.status(500).json({ message: 'Kullanıcı kaydedilirken bir hata oluştu.' });
            }

            const userId = this.lastID; 

            
            const defaultTaskTitle = 'İlk Göreviniz';
            const defaultTaskDescription = 'Bu, hesabınız oluşturulduğunda size otomatik olarak atanan ilk görevdir.';
            
            const createdByValue = userId; 
            const groupIdValue = finalGroupId; 

            const insertTaskQuery = 'INSERT INTO tasks (title, description, user_id, created_by, group_id) VALUES (?, ?, ?, ?, ?)';

            db.run(insertTaskQuery, [defaultTaskTitle, defaultTaskDescription, userId, createdByValue, groupIdValue], function(taskErr) {
                if (taskErr) {
                    console.error("Otomatik görev atama hatası:", taskErr.message);
                   
                } else {
                    console.log(`Yeni kullanıcı (ID: ${userId}) için otomatik görev "${defaultTaskTitle}" başarıyla atandı.`);
                }
                
                res.status(201).json({ 
                    message: 'Kullanıcı başarıyla kaydedildi!', 
                    user: { id: userId, username, email, role: 'user', group_id: finalGroupId } 
                });
            });
        });
    });
});

// Login Endpointi: Kullanıcı girişi için POST isteği beklenir.
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-posta ve şifre gerekli.' });
    }

    const findUser = 'SELECT id, username, email, password_hash, role, group_id FROM users WHERE email = ?';
    db.get(findUser, [email], (err, user) => {
        if (err) {
            console.error("Veritabanından kullanıcı çekme hatası:", err.message);
            return res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
        }

        if (!user) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                console.error("Parola karşılaştırma hatası:", err.message);
                return res.status(500).json({ message: 'Giriş sırasında bir hata oluştu.' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
            }

            const payload = {
                userId: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                group_id: user.group_id 
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); 

            res.status(200).json({
                message: 'Giriş başarılı!',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    group_id: user.group_id 
                }
            });
        });
    });
});





app.use('/api/tasks', authenticateToken);

// Görevleri Çekme Endpointi: GET /api/tasks (Yetkilendirme GEREKTİRİR)
app.get('/api/tasks', (req, res) => {
    const userId = req.user.userId;

    const selectTasks = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';

    db.all(selectTasks, [userId], (err, tasks) => {
        if (err) {
            console.error("Veritabanından görevleri çekerken hata:", err.message);
            return res.status(500).json({ message: 'Görevleri çekerken bir hata oluştu.' });
        }
        res.status(200).json(tasks);
    });
});

// Yeni Görev Oluşturma Endpointi: POST /api/tasks (Yetkilendirme GEREKTİRİR)
app.post('/api/tasks', (req, res) => {
    const { title, description, due_date, user_id: assignedUserIdFromClient } = req.body; 
    
    const creatorUserId = req.user.userId;
    const creatorUserRole = req.user.role;
    const creatorUserGroupId = req.user.group_id;

    if (!title) {
        return res.status(400).json({ message: 'Görev başlığı gerekli.' });
    }

    let targetUserId = creatorUserId; 
    
    if (assignedUserIdFromClient && creatorUserRole === 'admin') {
        targetUserId = assignedUserIdFromClient;
    } 

    const createdBy = creatorUserId;
    const groupId = creatorUserGroupId;

    const insertTask = 'INSERT INTO tasks (title, description, due_date, user_id, created_by, group_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(insertTask, [
        title,
        description || null,
        due_date || null,
        parseInt(targetUserId), 
        parseInt(createdBy),  
        parseInt(groupId) 
    ], function(err) {
        if (err) {
            console.error("Veritabanına yeni görev ekleme hatası:", err.message);
            if (err.message.includes('NOT NULL constraint failed')) {
                return res.status(400).json({ message: 'Görev ekleme hatası: Eksik veya hatalı bilgi. Tüm gerekli alanların dolu olduğundan emin olun.' });
            }
            return res.status(500).json({ message: 'Görev oluşturulurken beklenmeyen bir hata oluştu.' });
        }

        const taskId = this.lastID;
        db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, newTask) => {
            if (err) { console.error("Yeni oluşturulan görevi çekerken hata:", err.message); }
            res.status(201).json(newTask);
        });
    });
});

// Görev Güncelleme Endpointi: PATCH /api/tasks/:id (Yetkilendirme GEREKTİRİR)
app.patch('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.userId;
    const { title, description, due_date, completed } = req.body;

    const fieldsToUpdate = [];
    const params = [];
    if (title !== undefined) { fieldsToUpdate.push('title = ?'); params.push(title); }
    if (description !== undefined) { fieldsToUpdate.push('description = ?'); params.push(description); }
    if (due_date !== undefined) { fieldsToUpdate.push('due_date = ?'); params.push(due_date); }
    if (completed !== undefined) { fieldsToUpdate.push('completed = ?'); params.push(completed ? 1 : 0); }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: 'Güncellenecek veri bulunamadı.' });
    }

    const updateQuery = `UPDATE tasks SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND user_id = ?;`;
    params.push(taskId, userId);

    db.run(updateQuery, params, function(err) {
        if (err) {
            console.error(`Görev ID ${taskId} güncelleme hatası:`, err.message);
            return res.status(500).json({ message: 'Görevi güncellerken bir hata oluştu.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Görev bulunamadı veya bu görevi güncelleme izniniz yok.' });
        }

        db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, updatedTask) => {
            if (err) { console.error("Güncellenen görevi çekerken hata:", err.message); }
            res.status(200).json(updatedTask);
        });
    });
});

// Görev Silme Endpointi: DELETE /api/tasks/:id (Yetkilendirme GEREKTİRİR)
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const deleteQuery = 'DELETE FROM tasks WHERE id = ? AND user_id = ?;';

    db.run(deleteQuery, [taskId, userId], function(err) {
        if (err) {
            console.error(`Görev ID ${taskId} silme hatası:`, err.message);
            return res.status(500).json({ message: 'Görevi silerken bir hata oluştu.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Görev bulunamadı veya bu görevi silme izniniz yok.' });
        }

        res.status(200).json({ message: 'Görev başarıyla silindi.', taskId: taskId });
    });
});


// Tüm kullanıcıları çekme endpointi: GET /api/users (Yetkilendirme GEREKTİRİR ve ADMIN YETKİSİ GEREKİR)
app.get('/api/users', authenticateToken, (req, res) => {
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu kaynağa erişim yetkiniz yok. Sadece yöneticiler erişebilir.' });
    }

    const selectUsers = 'SELECT u.id, u.username, u.email, u.role, u.group_id, g.name AS group_name FROM users u LEFT JOIN groups g ON u.group_id = g.id ORDER BY u.role DESC, u.username ASC';

    db.all(selectUsers, [], (err, users) => {
        if (err) {
            console.error("Veritabanından kullanıcıları çekerken hata:", err.message);
            return res.status(500).json({ message: 'Kullanıcıları çekerken bir hata oluştu.' });
        }
        res.status(200).json(users);
    });
});

// Kullanıcının kendi grubundaki kullanıcıları çekme endpointi (Yetkilendirme GEREKTİRİR)
app.get('/api/users/in-my-group', authenticateToken, (req, res) => {
    const userGroupId = req.user.group_id; 

    if (userGroupId === null || userGroupId === 1) { 
        return res.status(200).json([]); 
    }

    const selectGroupUsers = 'SELECT id, username, email, role, group_id FROM users WHERE group_id = ? ORDER BY role DESC, username ASC';

    db.all(selectGroupUsers, [userGroupId], (err, users) => {
        if (err) {
            console.error(`Veritabanından grup ID ${userGroupId} kullanıcılarını çekerken hata:`, err.message);
            return res.status(500).json({ message: 'Grup kullanıcılarını çekerken bir hata oluştu.' });
        }
        res.status(200).json(users);
    });
});


// YENİ ENDPOINT: Kullanıcı adı veya e-posta ile takımsız kullanıcı arama
app.get('/api/users/find-unassigned', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok.' });
    }

    const { identifier } = req.query;

    if (!identifier) {
        return res.status(400).json({ message: 'Kullanıcı adı veya e-posta belirtilmelidir.' });
    }

    let query = `SELECT id, username, email, role, group_id FROM users WHERE group_id = 1 AND (username LIKE ? OR email LIKE ?) LIMIT 1`;
    let params = [`%${identifier}%`, `%${identifier}%`]; 

    try {
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Takımsız kullanıcı ararken veritabanı hatası:', err.message);
                return res.status(500).json({ message: 'Kullanıcı ararken bir hata oluştu.' });
            }

            if (rows.length > 0) {
                res.json(rows); 
            } else {
                res.status(404).json({ message: 'Belirtilen kimlikte takımsız kullanıcı bulunamadı.' });
            }
        });
    } catch (error) {
        console.error('Takımsız kullanıcı ararken genel hata:', error);
        res.status(500).json({ message: 'Kullanıcı ararken beklenmeyen bir hata oluştu.' });
    }
});


// Kullanıcının rolünü güncelleme endpoint'i (sadece adminler için)
app.patch('/api/users/:id/role', authenticateToken, (req, res) => {
    const targetUserId = req.params.id;
    const newRole = req.body.role;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok.' });
    }

    if (!newRole || (newRole !== 'admin' && newRole !== 'user')) {
        return res.status(400).json({ message: 'Geçersiz rol belirtildi. Rol "admin" veya "user" olmalı.' });
    }

    const updateRoleQuery = 'UPDATE users SET role = ? WHERE id = ?';
    db.run(updateRoleQuery, [newRole, targetUserId], function(err) {
        if (err) {
            console.error(`Kullanıcı ID ${targetUserId} rol güncelleme hatası:`, err.message);
            return res.status(500).json({ message: 'Kullanıcı rolü güncellenirken hata oluştu.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }
        res.status(200).json({ message: `Kullanıcı ID ${targetUserId} rolü başarıyla ${newRole} olarak güncellendi.` });
    });
});

// Kullanıcının grubunu güncelleme endpoint'i (sadece adminler için)
app.patch('/api/users/:id/group', authenticateToken, (req, res) => {
    const targetUserId = req.params.id;
    const newGroupId = req.body.group_id;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok. Sadece yöneticiler yapabilir.' });
    }

    if (!Number.isInteger(newGroupId) || newGroupId <= 0) {
        return res.status(400).json({ message: 'Geçersiz grup ID belirtildi. Grup ID pozitif bir tam sayı olmalı.' });
    }

    db.get('SELECT id FROM groups WHERE id = ?', [newGroupId], (err, group) => {
        if (err) {
            console.error("Grup kontrol hatası:", err.message);
            return res.status(500).json({ message: 'Grup kontrolü sırasında bir hata oluştu.' });
        }
        if (!group) {
            return res.status(404).json({ message: 'Belirtilen grup bulunamadı.' });
        }

        const updateGroupQuery = 'UPDATE users SET group_id = ? WHERE id = ?';
        db.run(updateGroupQuery, [newGroupId, targetUserId], function(err) {
            if (err) {
                console.error(`Kullanıcı ID ${targetUserId} grup güncelleme hatası:`, err.message);
                return res.status(500).json({ message: 'Kullanıcı grubu güncellenirken hata oluştu.' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
            }

            db.get('SELECT id, username, email, role, group_id FROM users WHERE id = ?', [targetUserId], (err, updatedUser) => {
                if (err) { console.error("Güncellenen kullanıcıyı çekerken hata:", err.message); }
                res.status(200).json({ 
                    message: `Kullanıcı ID ${targetUserId} grubu başarıyla ${newGroupId} olarak güncellendi.`,
                    user: updatedUser
                });
            });
        });
    });
});



// Tüm grupları listeleme (sadece adminler için)
app.get('/api/groups', authenticateToken, (req, res) => {
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu kaynağa erişim yetkiniz yok. Sadece yöneticiler erişebilir.' });
    }

    const selectGroups = 'SELECT id, name, description FROM groups ORDER BY name ASC';
    db.all(selectGroups, [], (err, groups) => {
        if (err) {
            console.error("Veritabanından grupları çekerken hata:", err.message);
            return res.status(500).json({ message: 'Grupları çekerken bir hata oluştu.' });
        }
        res.status(200).json(groups);
    });
});

// Yeni grup oluşturma (sadece adminler için)
app.post('/api/groups', authenticateToken, (req, res) => {
    const { name, description } = req.body;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok. Sadece yöneticiler yapabilir.' });
    }

    if (!name) {
        return res.status(400).json({ message: 'Grup adı gerekli.' });
    }

    const insertGroup = 'INSERT INTO groups (name, description) VALUES (?, ?)';
    db.run(insertGroup, [name, description || null], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ message: 'Bu grup adı zaten mevcut.' });
            }
            console.error("Veritabanına yeni grup ekleme hatası:", err.message);
            return res.status(500).json({ message: 'Grup oluşturulurken bir hata oluştu.' });
        }

        const groupId = this.lastID;
        db.get('SELECT id, name, description FROM groups WHERE id = ?', [groupId], (err, newGroup) => {
            if (err) { console.error("Yeni oluşturulan grubu çekerken hata:", err.message); }
            res.status(201).json(newGroup);
        });
    });
});

// Grup silme (sadece adminler için)
app.delete('/api/groups/:id', authenticateToken, (req, res) => {
    const groupId = req.params.id;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin') {
        return res.status(403).json({ message: 'Bu işlemi yapmaya yetkiniz yok. Sadece yöneticiler yapabilir.' });
    }

    if (parseInt(groupId) === 1) {
        return res.status(400).json({ message: 'Varsayılan grup silinemez.' });
    }

    const deleteGroupQuery = 'DELETE FROM groups WHERE id = ?';
    db.run(deleteGroupQuery, [groupId], function(err) {
        if (err) {
            console.error(`Grup ID ${groupId} silme hatası:`, err.message);
            return res.status(500).json({ message: 'Grup silinirken bir hata oluştu.' });
        }

        if (this.changes === 0) {
            return res.status(404).json({ message: 'Grup bulunamadı.' });
        }

        res.status(200).json({ message: 'Grup başarıyla silindi.', groupId: groupId });
    });
});

// Eşleşmeyen tüm istekler için 404 Not Found hatası oluşturur.
app.use((req, res, next) => {
    const error = new Error('Bulunamadı (Not Found)');
    error.status = 404;
    next(error); // Hatayı bir sonraki hata işleyiciye ilet
});

// Tüm hataları yakalayan ve yanıt dönen middleware.
app.use((error, req, res, next) => {
    res.status(error.status || 500); 
    res.json({
        error: {
            message: error.message || 'Beklenmeyen bir sunucu hatası oluştu!' 
        }
    });
    console.error(error.stack); 
});

app.listen(PORT, () => {
    console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Veritabanı kapatılırken hata:', err.message);
        }
        console.log('SQLite veritabanı bağlantısı kapatıldı.');
        process.exit(0); 
    });
});