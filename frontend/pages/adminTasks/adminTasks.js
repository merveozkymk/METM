// frontend/pages/admin/adminAddTasks.js

document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcı dropdown menüsü işlevselliği
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        // user-dropdown alanına (profil resmi ve ok dahil) tıklandığında dropdown menüsünü aç/kapat.
        // event.stopPropagation() tıklama olayının daha üst elementlere yayılmasını engeller, böylece menüye tıklamak menüyü hemen kapatmaz.
        userDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
            userDropdown.classList.toggle('open'); // 'open' sınıfını ekleyerek/kaldırarak CSS ile menüyü gösterir/gizler.
        });

        // menü dışında herhangi bir yere tıklandığında açık olan menüyü kapatır.
        // Bu olay dinleyici document'e eklenir (Event Bubbling kullanılır).
        document.addEventListener('click', function(event) {
            // Tıklanan elementin userDropdown içinde olup olmadığını kontrol et.
            const isClickInsideDropdown = userDropdown.contains(event.target);
            // Eğer tıklama dropdown'ın içinde değilse VE dropdown açıksa ('open' sınıfı varsa)
            if (!isClickInsideDropdown && userDropdown.classList.contains('open')) {
                userDropdown.classList.remove('open'); // Menüyü kapat ('open' sınıfını kaldır).
            }
        });
    }
    if (teamNavLink) {
    teamNavLink.addEventListener('click', (e) => {
        e.preventDefault(); // Varsayılan link davranışını engelle
        window.location.href = '../adminTeam/index.html'; // adminTeam sayfasına yönlendir
    });
}

if (assignTaskNavLink) {
    assignTaskNavLink.addEventListener('click', (e) => {
        e.preventDefault(); // Varsayılan link davranışını engelle
        window.location.href = '../adminTasks/index.html'; // adminTasks sayfasına yönlendir
    });
}
    // DOMContentLoaded olduğunda çalışır
    
    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const assignedToSelect = document.getElementById('assignedTo'); // Atanacak üyeyi seçme
    const formMessage = document.getElementById('formMessage'); // Mesaj göstermek için

    // Yetkilendirme token'ı ve kullanıcı bilgisi
    const authToken = localStorage.getItem('authToken');
    const loggedInUserString = localStorage.getItem('user');
    let currentUser = null;

    // --- Yetkilendirme ve Admin Kontrolü ---
    async function checkAuthAndAdminStatus() {
        if (!authToken || !loggedInUserString) {
            console.log('Yetkilendirme token\'ı veya kullanıcı bilgisi bulunamadı. Login sayfasına yönlendiriliyor...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html'; // Login sayfasına yönlendir
            return false;
        }

        try {
            currentUser = JSON.parse(loggedInUserString);
            console.log('Admin Paneli Yüklendi. Giriş Yapılan Kullanıcı:', currentUser);

            if (currentUser.role !== 'admin') { // Kullanıcı rolü 'admin' değilse
                alert('Bu sayfaya erişim yetkiniz yok. Yönetici değilsiniz.');
                window.location.href = '../tasks/index.html'; // Normal görev sayfasına yönlendir
                return false;
            }
            return true; // Admin ve yetkili
        } catch (e) {
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html';
            return false;
        }
    }

    // --- Kullanıcıları (Takım Üyelerini) Çekme ve Dropdown'a Doldurma ---
    async function fetchTeamMembersForDropdown() {
        if (!authToken || !currentUser) return;

        const backendUsersEndpoint = 'http://localhost:3000/api/users/in-my-group';
        assignedToSelect.innerHTML = '<option value="">Yükleniyor...</option>'; // Yükleniyor mesajı

        try {
            const response = await fetch(backendUsersEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP hata! Durum: ${response.status}`);
            }

            const users = await response.json();
            assignedToSelect.innerHTML = '<option value="">Üye Seçiniz</option>'; // İlk boş opsiyon

            // Sadece kendi grubundaki normal kullanıcıları (admin olmayanları) listele
            const teamMembers = users.filter(user => user.group_id === currentUser.group_id && user.role !== 'admin');

            if (teamMembers.length === 0) {
                assignedToSelect.innerHTML = '<option value="">Takımınızda atanabilir üye yok.</option>';
                assignedToSelect.disabled = true; // Dropdown'u devre dışı bırak
                return;
            }

            teamMembers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id; // Kullanıcı ID'si
                option.textContent = `${user.username} (${user.email})`;
                assignedToSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Takım üyeleri çekilirken hata:', error);
            assignedToSelect.innerHTML = '<option value="">Üyeler yüklenemedi.</option>';
            assignedToSelect.disabled = true;
            showMessage('Üyeler yüklenemedi. Lütfen tekrar deneyin.', 'error');
        }
    }

    // --- Görev Atama Formu Gönderme İşlevi ---
    addTaskForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Varsayılan formu gönderme davranışını engelle

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const selectedUserId = assignedToSelect.value; // Dropdown'dan seçilen kullanıcının ID'si

        if (!title || !selectedUserId) {
            showMessage('Lütfen görev başlığını girin ve bir üye seçin.', 'error');
            return;
        }

        if (!authToken) {
            showMessage('Yetkilendirme hatası. Lütfen giriş yapın.', 'error');
            setTimeout(() => window.location.href = '../auth/login/index.html', 1500);
            return;
        }

        // Gönderilecek görev verisi (user_id kullanılarak)
        const taskData = {
            title: title,
            description: description || null, // Boşsa null gönder
            due_date: dueDate || null, // Boşsa null gönder
            user_id: parseInt(selectedUserId), // BURASI DEĞİŞTİ: assigned_to yerine user_id kullanıyoruz
            created_by: currentUser.id, // Görevi oluşturan adminin ID'si
            group_id: currentUser.group_id // Görevin ait olduğu grup ID'si
        };

        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; // Backend'in görev ekleme endpoint'i

        try {
            const response = await fetch(backendTasksEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    showMessage('Yetkilendirme hatası. Lütfen tekrar giriş yapın.', 'error');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    setTimeout(() => window.location.href = '../auth/login/index.html', 1500);
                    return;
                }
                throw new Error(errorData.message || `Görev eklenirken HTTP hata! Durum: ${response.status}`);
            }

            const newTask = await response.json();
            console.log('Yeni görev başarıyla atandı:', newTask);
            showMessage('Görev başarıyla atandı!', 'success');
            addTaskForm.reset(); // Formu temizle
            taskDescriptionInput.value = ''; // Textarea'yı da temizle
            assignedToSelect.value = ''; // Seçimi sıfırla
        } catch (error) {
            console.error('Görev atarken bir hata oluştu:', error);
            showMessage(`Görev atanamadı: ${error.message}`, 'error');
        }
    });

    // --- Mesaj Gösterme Fonksiyonu ---
    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `message ${type}`; // 'success' veya 'error' sınıfını ekler
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'message';
        }, 3000); // 3 saniye sonra mesajı temizle
    }

    // --- Navbar Linkleri ve Çıkış Yap ---
    const gorevlerimLink = document.querySelector('nav a[href="../tasks/index.html"]');
    if (gorevlerimLink) {
        gorevlerimLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../tasks/index.html';
        });
    }

    const incompleteTasksLink = document.querySelector('nav a[href="../incomplete-tasks/index.html"]');
    if (incompleteTasksLink) {
        incompleteTasksLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../incomplete-tasks/index.html';
        });
    }
    
    // Logo linkini de güncelleyelim, genellikle anasayfaya veya dashboard'a gider
    const appLogo = document.querySelector('.app-logo');
    if (appLogo) {
        appLogo.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../tasks/index.html'; // Varsayılan dashboard
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Çıkış yapılıyor...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html';
        });
    }

    // Sayfa yüklendiğinde çalışacak ilk fonksiyonlar
    async function initPage() {
        const isAdmin = await checkAuthAndAdminStatus();
        if (isAdmin) {
            await fetchTeamMembersForDropdown(); // Sadece admin ise üyeleri çek
        }
    }

    initPage(); // Sayfa başlangıcını tetikle
});