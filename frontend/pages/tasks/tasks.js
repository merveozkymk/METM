// frontend/pages/incomplete-tasks/incomplete-tasks.js
// Task Manager Tamamlanmamış Görevler Sayfası için JavaScript kodları.

// DOM içeriği tamamen yüklendiğinde çalışır
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

    // "Görevlerim" navigasyon linki işlevselliği
    const gorevlerimLink = document.querySelector('nav a'); // Navbar'daki ilk 'a' etiketini seçer

    if (gorevlerimLink) {
        gorevlerimLink.addEventListener('click', function(event) {
            event.preventDefault(); // Varsayılan link davranışını (sayfa yenileme/sayfa içi kaydırma) engelle
            console.log('"Görevlerim" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');
            window.location.href = 'index.html'; // Kendi dosya yapınıza göre bu yolu doğrulayın!
        });
    }

    // "Görev Ekle" navigasyon linki işlevselliği
    const gorevEkleLink = document.querySelector('.navbar-center a:nth-child(2)'); // Navbar'daki 2. 'a' etiketini seçer (sağladığınız HTML yapısına göre)

    if (gorevEkleLink) {
        gorevEkleLink.addEventListener('click', function(event) {
            event.preventDefault(); // Varsayılan link davranışını engelle
            console.log('"Görev ekle" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');
            // Eğer ayrı bir addtasks.html sayfanız varsa o sayfanın yolunu yazmalısınız.
            window.location.href = '../addTasks/index.html'; // Kendi dosya yapınıza ve hedef sayfaya göre bu yolu doğrulayın!
        });
    }

    // --- Kullanıcıları Çekme ve Listeleme Fonksiyonu (Admin/User olarak ayırma) ---
    async function fetchAndRenderUsers() {
        // Bu endpoint, kullanıcının kendi grubundaki kişileri getirir
        const backendUsersEndpoint = 'http://localhost:3000/api/users/in-my-group';
        const authToken = localStorage.getItem('authToken'); // Yetkilendirme token'ı
        const loggedInUserString = localStorage.getItem('user'); // Giriş yapmış kullanıcı bilgisi
        let currentUser = null; // Giriş yapmış kullanıcı objesi

        const adminUsersListDiv = document.getElementById('adminUsersList');
        const regularUsersListDiv = document.getElementById('regularUsersList');

        if (!adminUsersListDiv || !regularUsersListDiv) {
            console.error('Kullanıcı listeleme divleri bulunamadı!');
            return;
        }

        // HTML'deki H4 başlıklarını korumak için, sadece dinamik içerikleri (<ul> ve <p>) yöneteceğiz.
        // Önceki dinamik yüklenen elementleri temizleyelim (varsa).
        // Bu, HTML'deki <div class="user-list1"> içindeki <h4> başlıklarını etkilemeyecek.
        adminUsersListDiv.querySelector('p')?.remove(); // Önceki "Yükleniyor..." veya hata mesajını kaldır
        adminUsersListDiv.querySelector('ul')?.remove(); // Önceki listeyi kaldır
        regularUsersListDiv.querySelector('p')?.remove(); // Önceki "Yükleniyor..." veya hata mesajını kaldır
        regularUsersListDiv.querySelector('ul')?.remove(); // Önceki listeyi kaldır

        if (!loggedInUserString) {
            console.error('Giriş yapmış kullanıcı bilgisi bulunamadı!');
            // Hata mesajını H4'ün altına ekliyoruz
            adminUsersListDiv.innerHTML += '<p style="color: red;">Giriş yapmış kullanıcı bilgisi bulunamadı.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Giriş yapmış kullanıcı bilgisi bulunamadı.</p>';
            return;
        }

        try {
            currentUser = JSON.parse(loggedInUserString); // localStorage'dan alınan kullanıcı bilgisini JavaScript objesine çevir
        } catch (e) {
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
            adminUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcı bilgisi yüklenemedi.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcı bilgisi yüklenemedi.</p>';
            return;
        }

        const userGroupId = currentUser.group_id; // Giriş yapmış kullanıcının grup ID'si

        // Kullanıcıya atanmış bir grup yoksa (group_id: null veya 1 ise) API çağrısı yapmadan özel mesaj göster
        if (userGroupId === null || userGroupId === 1) { // 1'i varsayılan "grupta değil" ID'si olarak kabul ediyoruz
            adminUsersListDiv.innerHTML += '<p>Bir gruba atanmamışsınız.</p>';
            regularUsersListDiv.innerHTML += '<p>Bir gruba atanmamışsınız.</p>';
            console.log('Kullanıcı bir gruba atanmamış (group_id: null veya 1). Grup üyeleri listelenmeyecek.');
            return; // Fonksiyondan çık, API çağrısı yapma
        }

        if (!authToken) {
            console.log('Kullanıcıları çekmek için yetkilendirme token\'ı yok.');
            adminUsersListDiv.innerHTML += '<p style="color: red;">Yetkilendirme gerekli.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Yetkilendirme gerekli.</p>';
            return;
        }

        try {
            const response = await fetch(backendUsersEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}` // Token'ı gönder
                },
            });

            if (!response.ok) {
                let errorMessage = `Kullanıcıları çekerken HTTP hata! Durum: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Kullanıcı hata cevabını JSON okurken hata:', e);
                }
                throw new Error(errorMessage);
            }

            const users = await response.json(); // Backend'den gelen veri doğrudan kullanıcı dizisidir.

            console.log('--- Grup Bilgileri ---');
            console.log('Kullanıcının Grup ID\'si:', userGroupId);
            console.log('Bu Gruptaki Kullanıcılar:', users);
            console.log('------------------------');

            console.log('Grup kullanıcıları çekildi:', users);

            // Yeni <ul> elementlerini oluştur
            const adminUl = document.createElement('ul');
            const regularUl = document.createElement('ul');

            // Kullanıcı listelerini HTML'deki .user-list1 div'lerinin içine ekliyoruz.
            // Bu, H4 başlıkların yerinde kalmasını sağlar.
            const adminListContainer = adminUsersListDiv.querySelector('.user-list1');
            const regularListContainer = regularUsersListDiv.querySelector('.user-list1');

            if (adminListContainer) {
                adminListContainer.appendChild(adminUl); // ul'yi user-list1 içine ekliyoruz
            } else {
                // Eğer .user-list1 div'i bulunamazsa (beklenmedik bir durum), ana div'e ekle
                adminUsersListDiv.appendChild(adminUl);
                console.warn('.user-list1 divi adminUsersListDiv içinde bulunamadı, ul doğrudan ana div\'e eklendi.');
            }

            if (regularListContainer) {
                regularListContainer.appendChild(regularUl); // ul'yi user-list1 içine ekliyoruz
            } else {
                // Eğer .user-list1 div'i bulunamazsa, ana div'e ekle
                regularUsersListDiv.appendChild(regularUl);
                console.warn('.user-list1 divi regularUsersListDiv içinde bulunamadı, ul doğrudan ana div\'e eklendi.');
            }


            if (users.length === 0) {
                adminUl.innerHTML = '<li>Bu grupta hiç admin kullanıcı yok.</li>';
                regularUl.innerHTML = '<li>Bu grupta hiç normal kullanıcı yok.</li>';
                return;
            }

            // Backend zaten filtreleme yaptığı için burada ayrıca filtreleme yapmaya gerek yok
            users.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="username">${user.username}</span> ${user.email ? `<span>(${user.email})</span>` : ''}`;

                if (user.role === 'admin') {
                    adminUl.appendChild(li);
                } else {
                    regularUl.appendChild(li);
                }
            });

            // Eğer filtreleme sonrası Admin veya User listeleri hala boşsa, uygun mesajı göster
            // Bu durum, backend'in boş liste döndürmediği ama içindeki rollerin boş olduğu anlamına gelir.
            if (adminUl.children.length === 0) {
                adminUl.innerHTML = '<li>Bu grupta hiç admin kullanıcı yok.</li>';
            }
            if (regularUl.children.length === 0) {
                regularUl.innerHTML = '<li>Bu grupta hiç normal kullanıcı yok.</li>';
            }

        } catch (error) {
            console.error('Kullanıcıları çekerken bir hata oluştu:', error);
            // Hata durumunda, mevcut dinamik elementleri kaldır ve hata mesajını ekle
            adminUsersListDiv.querySelector('p')?.remove();
            adminUsersListDiv.querySelector('ul')?.remove();
            regularUsersListDiv.querySelector('p')?.remove();
            regularUsersListDiv.querySelector('ul')?.remove();

            adminUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcılar yüklenemedi.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcılar yüklenemedi.</p>';
        }
    }

    // Sayfa yüklendiğinde kullanıcıları çek ve listele
    fetchAndRenderUsers();

    // --- Sayfa Yüklendiğinde Yetkilendirme Kontrolü ---
    // Kullanıcının login yapmış olup olmadığını kontrol et. Token veya kullanıcı bilgisi yoksa login sayfasına yönlendir.
    const authToken = localStorage.getItem('authToken'); // localStorage'dan token'ı al
    const loggedInUserString = localStorage.getItem('user'); // localStorage'dan kullanıcı bilgisini al
    let currentUser = null; // Giriş yapmış kullanıcı objesi

    // Eğer token veya kullanıcı bilgisi yoksa (login yapılmamış veya bilgi silinmişse)
    if (!authToken || !loggedInUserString) {
        console.log('Yetkilendirme token\'ı veya kullanıcı bilgisi bulunamadı. Login sayfasına yönlendiriliyor...');
        // localStorage'ı temizle (güvenlik için)
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Kendi login sayfanızın doğru yolunu yazın (Live Server konumuna göre ayarlanmalı)
        window.location.href = '../auth/login/index.html'; // Kendi login sayfanızın doğru yolunu yazın
        return; // Kodun devam etmesini engelle
    }

    try {
        currentUser = JSON.parse(loggedInUserString); // localStorage'dan alınan kullanıcı bilgisini JavaScript objesine çevir
        console.log('Tamamlanmamış Görevler Sayfası Yüklendi. Giriş Yapılan Kullanıcı:', currentUser);

        // İsteğe bağlı: Kullanıcı adını arayüzde bir yere yazdırabilirsiniz.
        // const usernameDisplayElement = document.getElementById('loggedInUsername'); // HTML'de böyle bir element olduğunu varsayın
        // if (usernameDisplayElement) {
        //     usernameDisplayElement.textContent = currentUser.username || currentUser.email;
        // }

    } catch (e) {
        // localStorage'daki kullanıcı bilgisi bozuksa
        console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
        // Güvenlik için localStorage'ı temizle ve login sayfasına yönlendir
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '../auth/login/index.html'; // Kendi login sayfanızın doğru yolunu yazın
        return;
    }
    // --- Yetkilendirme Kontrolü Sonu ---


    // --- Çıkış Yap Butonu Logic (Navbar'da varsa) ---
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault(); // Varsayılan link davranışını engelle
            console.log('Çıkış yapılıyor...');
            // localStorage'dan token ve kullanıcı bilgisini kaldır
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            // Login sayfasına yönlendir
            window.location.href = '../auth/login/index.html'; // Kendi login sayfanızın doğru yolunu yazın
        });
    }
    // --- Çıkış Yap Butonu Logic Sonu ---


    // --- Görevleri Backendden Çekme, Filtreleme ve Listeleme ---

    // Görevleri backend API'den çeken, sadece tamamlanmamış olanları filtreleyen ve ekrana basan fonksiyon
    async function fetchAndRenderIncompleteTasks() {
        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; // Backend adresinizi ve portunuzu doğrulayın
        const incompleteTaskListDiv = document.getElementById('incompleteTaskList'); // Tamamlanmamış görevlerin listeleneceği alan

        if (!incompleteTaskListDiv) {
            console.error('incompleteTaskList elementi (ID="incompleteTaskList") sayfada bulunamadı!');
            return;
        }

        // Yükleniyor mesajını göster
        incompleteTaskListDiv.innerHTML = '<p>Tamamlanmamış görevler yükleniyor...</p>';


        try {
            console.log('Backendden tüm görevler çekiliyor (Tamamlanmamışlar için)...');
            const response = await fetch(backendTasksEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}` // localStorage'dan aldığımız token'ı kullan
                },
            });

            // Backend cevabının başarılı olup olmadığını kontrol et (HTTP status kodu 2xx aralığında mı?).
            if (!response.ok) {
                // Eğer backend 401 Unauthorized veya 403 Forbidden hatası döndürürse (token geçersiz, süresi dolmuş vb.)
                if (response.status === 401 || response.status === 403) {
                    console.log('Yetkilendirme hatası (fetch). Lütfen tekrar giriş yapın.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '../auth/login/index.html'; // Kendi login sayfanızın doğru yolunu yazın
                    return;
                }
                // Diğer HTTP hataları için genel hata fırlat
                let errorMessage = `HTTP hata! Durum: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Hata cevabını JSON okurken hata:', e);
                }
                throw new Error(errorMessage);
            }

            // Cevap başarılı ise, backend'in döndürdüğü tüm görev listesini al.
            const allTasks = await response.json();
            console.log('Backendden Tüm Görevler Çekildi:', allTasks);

            // --- SADECE TAMAMLANMAMIŞ GÖREVLERİ FİLTRELE ---
            const incompleteTasks = allTasks.filter(task => !task.completed); // task.completed true değilse (yani false ise) al
            console.log('Filtrelenmiş Tamamlanmamış Görevler:', incompleteTasks);


            // Filtrelenmiş tamamlanmamış görev listesini arayüzde göster.
            renderTasks(incompleteTasks);

        } catch (error) {
            console.error('Tamamlanmamış görevleri çekerken bir hata oluştu:', error);
            incompleteTaskListDiv.innerHTML = '<p style="color: red;">Görevler yüklenemedi. Lütfen tekrar deneyin.</p>'; // Kullanıcıya hata mesajı göster
        }
    }

    // Görev listesini arayüzde (kartlar halinde) gösteren fonksiyon
    function renderTasks(tasks) {
        const incompleteTaskListDiv = document.getElementById('incompleteTaskList');
        if (!incompleteTaskListDiv) return;


        incompleteTaskListDiv.innerHTML = ''; // Mevcut listeyi temizle.

        if (tasks.length === 0) {
            incompleteTaskListDiv.innerHTML = '<p>Hiç tamamlanmamış göreviniz yok. Harika!</p>';
            return;
        }

        // Her görev objesi için döngü yap ve kart HTML'i oluştur.
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.dataset.taskId = task.id;

            taskCard.innerHTML = `
                <div class="details">
                    <h3>${task.title}</h3> ${task.description ? `<p>${task.description}</p>` : ''} <span class="due-date">Bitiş: ${task.due_date || 'Belirtilmemiş'}</span> <span class="status">Durum: Devam Ediyor</span> </div>
                    <div class="actions">
                        <button class="complete-button">Tamamla</button>
                        <button class="delete-button">Sil</button>
                    </div>
                `;
            incompleteTaskListDiv.appendChild(taskCard);
        });

        // --- Görev Aksiyonları Logic (Tamamlama, Silme) ---
        incompleteTaskListDiv.addEventListener('click', async function(event) {
            const target = event.target;
            const taskCard = target.closest('.task-card');

            if (!taskCard) return;

            const taskId = taskCard.dataset.taskId;

            // --- Görev Tamamlama (Bu sayfada tamamlanmış olarak işaretleme) ---
            if (target.classList.contains('complete-button')) {
                console.log(`Tamamlanmamış Görev ID ${taskId} Tamamlama Butonuna Tıklandı.`);
                const backendUpdateTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`;
                const authToken = localStorage.getItem('authToken');

                if (!authToken) {
                    console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                    localStorage.removeItem('user');
                    window.location.href = '../auth/login/index.html';
                    return;
                }

                try {
                    console.log(`Görev ID ${taskId} tamamlandı olarak güncelleniyor.`);
                    const response = await fetch(backendUpdateTaskEndpoint, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            completed: true
                        }),
                    });

                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('user');
                            window.location.href = '../auth/login/index.html';
                            return;
                        }
                        let errorMessage = `HTTP hata! Durum: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                            console.error('Hata cevabını JSON okurken hata:', e);
                        }
                        throw new Error(errorMessage);
                    }

                    console.log('Görev Durumu Backendde Başarıyla Güncellendi. Arayüzden kaldırılıyor.');
                    taskCard.remove(); // Görev tamamlandığında arayüzden kaldır

                } catch (error) {
                    console.error('Görev tamamlarken (güncellerken) bir hata oluştu:', error);
                    alert('Görev durumu güncellenemedi. Lütfen tekrar deneyin.');
                }
            }

            // --- Görev Silme ---
            else if (target.classList.contains('delete-button')) {
                console.log(`Tamamlanmamış Görev ID ${taskId} Silme Butonuna Tıklandı.`);
                if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) { // Silme onayı
                    const backendDeleteTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`;
                    const authToken = localStorage.getItem('authToken');

                    if (!authToken) {
                        console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                        localStorage.removeItem('user');
                        window.location.href = '../auth/login/index.html';
                        return;
                    }

                    try {
                        console.log(`Görev ID ${taskId} backend'den siliniyor.`);
                        const response = await fetch(backendDeleteTaskEndpoint, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                            },
                        });

                        if (!response.ok) {
                            if (response.status === 401 || response.status === 403) {
                                console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('user');
                                window.location.href = '../auth/login/index.html';
                                return;
                            }
                            let errorMessage = `HTTP hata! Durum: ${response.status}`;
                            try {
                                const errorData = await response.json();
                                errorMessage = errorData.message || errorMessage;
                            } catch (e) {
                                console.error('Hata cevabını okurken hata:', e);
                            }
                            throw new Error(errorMessage);
                        }

                        console.log(`Görev ID ${taskId} arayüzden kaldırılıyor.`);
                        taskCard.remove(); // Görev silindiğinde arayüzden kaldır

                    } catch (error) {
                        console.error('Görevi silerken bir hata oluştu:', error);
                        alert('Görevi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                }
            }
            // --- Görev Silme Sonu ---

        }); // incompleteTaskListDiv click event listener sonu
    } // if incompleteTaskListDiv sonu


    // Sayfa yüklendiğinde tamamlanmamış görevleri çek ve listele
    fetchAndRenderIncompleteTasks();


}); // DOMContentLoaded listener'ın sonu