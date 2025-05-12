// frontend/pages/dashboard/dashboard.js

// DOM içeriği tamamen yüklendiğinde bu fonksiyon çalışır
document.addEventListener('DOMContentLoaded', function() {

    // --- Dropdown Menü Fonksiyonelliği Başlangıcı ---
    // Navbar'daki profil resmi dropdown konteynerini seçer
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        // user-dropdown alanına (profil resmi ve ok dahil) tıklama olayını dinle
        userDropdown.addEventListener('click', function(event) {
            event.stopPropagation();
            userDropdown.classList.toggle('open');
        });

        // menü dışında tıklandığında menüyü kapatır.
        document.addEventListener('click', function(event) {
            const isClickInsideDropdown = userDropdown.contains(event.target);
            if (!isClickInsideDropdown && userDropdown.classList.contains('open')) {
                userDropdown.classList.remove('open');
            }
        });
    }
    // --- Dropdown Menü Fonksiyonelliği Sonu ---


    // --- Kullanıcı Bilgilerini localStorage'dan Çekme ve Konsola Yazdırma Başlangıcı ---
    // Login sayfasında başarılı girişte localStorage'a kaydettiğimiz 'user' bilgisini (JSON stringi olarak) al.
    const loggedInUserString = localStorage.getItem('user');

    // localStorage'da 'user' key'ine ait bir değer varsa (yani kullanıcı giriş yapmışsa)
    if (loggedInUserString) {
        try {
            // localStorage'dan alınan JSON stringini JavaScript objesine çevir.
            const user = JSON.parse(loggedInUserString);

            // Kullanıcı bilgilerini tarayıcının konsoluna yazdır.
            console.log('Dashboard Yüklendi. Giriş Yapılan Kullanıcı:', user);

            // İsteğe bağlı: Kullanıcının adını veya e-postasını dashboard arayüzünde bir yere (örn: navbar'daki "Merhaba, [Kullanıcı Adı]" gibi bir alana) yazdırabilirsiniz.
            // Bunun için HTML'de uygun bir elementin (örn: <span id="loggedInUsername"></span>) olması gerekir.
            // const usernameDisplayElement = document.getElementById('loggedInUsername'); // HTML'de böyle bir element olduğunu varsayalım
            // if (usernameDisplayElement) {
            //     usernameDisplayElement.textContent = user.username || user.email; // Kullanıcı adı varsa onu, yoksa e-postayı göster
            // }

        } catch (e) {
            // Eğer localStorage'daki 'user' verisi geçerli bir JSON değilse (bozuk kaydedilmişse) hata yakala.
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
            // Bu durumda güvenlik için kullanıcıyı çıkış yapmaya zorlamak iyi bir fikir olabilir.
            // localStorage.removeItem('user');
            // localStorage.removeItem('authToken'); // Token'ı da temizle
            // console.log('Bozuk kullanıcı verisi temizlendi. Login sayfasına yönlendiriliyor...');
            // window.location.href = '/auth/login/index.html'; // Login sayfasına yönlendir (kendi login sayfanızın doğru yolunu yazın)
        }
    } else {
        // localStorage'da 'user' key'ine ait bir değer yoksa (kullanıcı giriş yapmamışsa veya localStorage temizlenmişse)
        console.log('localStorage\'da giriş yapmış kullanıcı bilgisi bulunamadı. Yetkilendirme gereklidir.');
        // Gerçek bir uygulamada, bu durumda kullanıcıyı otomatik olarak login sayfasına yönlendirmelisiniz.
        // console.log('Login sayfasına yönlendiriliyor...');
        // window.location.href = '/auth/login/index.html'; // Login sayfasına yönlendir (kendi login sayfanızın doğru yolunu yazın)
    }
    // --- Kullanıcı Bilgileri Konsola Yazdırma Sonu ---


    // --- Görev Yönetimi Fonksiyonları Başlangıcı ---

    // görevlerin backendden çekilmesi
    function fetchTasks() {
        // !!! BURASI BACKEND API'NİZDEN GÖREVLERİ ÇEKECEĞİNİZ YER OLACAK !!!
        // fetch('/api/tasks') // Örnek API endpoint'i
        //     .then(response => {
        //         if (!response.ok) {
        //             // Eğer yetkilendirme hatası (401) alırsanız kullanıcıyı logine yönlendirmelisiniz
        //             if(response.status === 401) {
        //                  console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
        //                  localStorage.removeItem('authToken'); // Geçersiz token'ı temizle
        //                  localStorage.removeItem('user'); // Kullanıcı bilgisini temizle
        //                  window.location.href = '/auth/login/index.html'; // Login sayfasına yönlendir
        //             }
        //             throw new Error(`HTTP error! status: ${response.status}`);
        //         }
        //         return response.json(); // JSON olarak gelen veriyi işle
        //     })
        //     .then(tasks => {
        //         console.log('Backendden Görevler Çekildi:', tasks);
        //         renderTasks(tasks); // Gelen görev listesini ekrana bas
        //     })
        //     .catch(error => {
        //         console.error('Görevleri çekerken hata oluştu:', error);
        //         // Kullanıcıya bir hata mesajı gösterebilirsiniz
        //     });

        // NOT: Backend'e görev isteği gönderirken yetkilendirme token'ını (localStorage'dan alıp) 'Authorization: Bearer TOKEN' başlığı ile göndermeniz gerekecek.
        // Örnek:
        // const token = localStorage.getItem('authToken');
        // if (!token) {
        //     // Token yoksa logine yönlendir
        //     window.location.href = '/auth/login/index.html';
        //     return;
        // }
        // fetch('/api/tasks', {
        //     headers: {
        //         'Authorization': `Bearer ${token}` // Token'ı başlığa ekle
        //     }
        // })
        // .then(...) // Cevabı işleme


        // backend yapılana kadar örnek veri kullanımı
        console.log('örnek görevler kullanılıyor.');
        const dummyTasks = [
            { id: 1, title: 'Markete Git', description: 'Süt, ekmek, yumurta al.', due_date: '2025-05-12', completed: false },
            { id: 2, title: 'Proje Raporunu Bitir', description: 'Haftalık ilerleme raporu.', due_date: '2025-05-15', completed: false },
            { id: 3, title: 'Spor Yap', description: 'Akşam 30 dk koşu.', due_date: '2025-05-11', completed: true },
            { id: 4, title: 'Kitap Oku', description: 'En az 30 sayfa.', due_date: '2025-05-18', completed: false },
        ];
        renderTasks(dummyTasks);
    }

    // görev listesinin htmlde görünmesi
    function renderTasks(tasks) {
        const taskListDiv = document.getElementById('taskList');
        if (!taskListDiv) {
            console.error('taskList elementi bulunamadı!');
            return;
        }

        taskListDiv.innerHTML = '';

        // her görev için html oluşturma
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.taskId = task.id;

            taskItem.innerHTML = `
                <div>
                    <h3>${task.title}</h3>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                    <span class="due-date">Bitiş: ${task.due_date || 'Belirtilmemiş'}</span>
                    <span class="status">Durum: ${task.completed ? 'Tamamlandı' : 'Devam Ediyor'}</span>
                </div>
                <div class="task-actions">
                    <button class="complete-button">${task.completed ? 'Geri Al' : 'Tamamla'}</button>
                    <button class="delete-button">Sil</button>
                </div>
            `;
            taskListDiv.appendChild(taskItem);
        });
    }

    // Sayfa yüklendiğinde görevleri çekme işlemini başlat
    // Not: Gerçek backend'e geçerken, fetchTasks fonksiyonunun içinde yetkilendirme token'ını göndermeniz gerekecek.
    fetchTasks();


    // --- Yeni Görev Ekleme Formu Logic ---
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) { // addTaskForm elementi varsa
        // Formun submit olayını dinle
        addTaskForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Formun varsayılan submit işlemini (sayfa yenileme) engelle

            // Input alanlarından güncel değerleri al
            const titleInput = document.getElementById('taskTitle');
            const descriptionInput = document.getElementById('taskDescription');
            const dueDateInput = document.getElementById('taskDueDate');

            const title = titleInput.value.trim(); // Başlıktaki boşlukları temizle
            const description = descriptionInput.value.trim(); // Açıklamadaki boşlukları temizle
            const dueDate = dueDateInput.value;

            // Basit doğrulama: Başlık boş olamaz
            if (!title) {
                alert('Görev başlığı boş olamaz!'); // Kullanıcıya bilgi ver
                return; // Submit işlemini durdur
            }

            // Yeni görev objesini hazırla
            const newTask = {
                title: title,
                description: description,
                due_date: dueDate || null, // Tarih boşsa null gönder
                completed: false // Yeni görev başlangıçta tamamlanmamış
            };

            // !!! BURADA BACKEND API'NIZE POST İSTEĞİ İLE YENİ GÖREVİ GÖNDERECEĞİNİZ KOD YER ALACAK !!!
            // Bu istek de yetkilendirme token'ı gerektirecek.
            // fetch('/api/tasks', { // Örnek API endpoint'i
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         // Yetkilendirme token'ı ekle
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            //     },
            //     body: JSON.stringify(newTask), // Görev objesini JSON string'e çevir
            // })
            // .then(response => {
            //     if (!response.ok) {
            //          // Yetkilendirme hatası (401) veya diğer backend hatalarını yakala
            //          if(response.status === 401) { /* Logine yönlendir */ }
            //          return response.json().then(error => { throw new Error(error.message || `HTTP error! status: ${response.status}`); });
            //     }
            //     return response.json(); // Başarılı olursa backend'in döndürdüğü yeni görevi al
            // })
            // .then(addedTask => {
            //     console.log('Yeni Görev Backendde Eklendi:', addedTask);
            //     addTaskForm.reset(); // Formu temizle
            //     fetchTasks(); // Görev listesini yeniden çek ve ekrana bas (veya sadece yeniyi listeye ekle)
            // })
            // .catch(error => {
            //     console.error('Görev eklerken hata oluştu:', error);
            //     alert('Görev eklenirken bir hata oluştu.'); // Kullanıcıya hata mesajı göster
            // });


            // --- Backend entegrasyonu yapılana kadar Konsola Yazdırma ve Formu Temizleme ---
            console.log('Yeni Görev Hazırlandı (Backend Gönderimi Simüle Edildi):', newTask);
            addTaskForm.reset(); // Simülasyon sonrası formu temizle
            // İsteğe bağlı: Dummy data ile çalışıyorsanız listeyi yeniden çekip güncel gibi gösterebilirsiniz
            // fetchTasks();
            // --- Dummy Simülasyon Sonu ---
        });
    }


    // --- Görev Aksiyonları (Tamamlama, Düzenleme, Silme) Logic (Event Delegation Kullanılarak) ---
    const taskListDiv = document.getElementById('taskList');
    if (taskListDiv) { // Görev listesi container'ının varlığını kontrol et
         // taskListDiv elementine tıklama olayı dinleyicisi ekle (Event Delegation için)
         taskListDiv.addEventListener('click', function(event) {
            const target = event.target; // Tıklanan spesifik element
            const taskItem = target.closest('.task-item'); // Tıklanan elementin en yakın '.task-item' parent'ını bul

            if (!taskItem) return; // Eğer tıklama bir '.task-item' içinde olmadıysa işlemi durdur

            const taskId = taskItem.dataset.taskId; // Görev ID'sini data-task-id attribute'undan al

            // Hangi butona tıklandığını kontrol et (classList.contains ile)
            if (target.classList.contains('complete-button')) {
                console.log(`Görev ID ${taskId} Tamamlama/Durum Değiştirme Tıklandı`);
                // Görevin mevcut tamamlanma durumunu kontrol et
                const isCompleted = taskItem.classList.contains('completed');

                // !!! BURADA BACKEND API'NIZE GÖREVİN DURUMUNU GÜNCELLEME (PATCH/PUT) İSTEĞİ GÖNDERECEĞİNİZ KOD YER ALACAK !!!
                // Bu istek de yetkilendirme token'ı gerektirecek.
                // Örneğin: fetch(`/api/tasks/${taskId}`, { // Örnek API endpoint'i (ID ile)
                //     method: 'PATCH', // Durum güncelleme için PATCH uygun olabilir
                //     headers: {
                //          'Content-Type': 'application/json',
                //          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Yetkilendirme token'ı ekle
                //     },
                //     body: JSON.stringify({ completed: !isCompleted }), // Mevcut durumun tersini gönder
                // })
                // .then(response => {
                //     if (!response.ok) { /* Hata */ if(response.status === 401) { /* Logine yönlendir */ } }
                //     return response.json(); // Başarılı olursa güncellenmiş görevi al
                // })
                // .then(updatedTask => {
                //     console.log('Görev Durumu Güncellendi:', updatedTask);
                //     // Ekrandaki '.task-item' elementinin sınıfını ve buton yazısını güncelle
                //     taskItem.classList.toggle('completed');
                //     target.textContent = taskItem.classList.contains('completed') ? 'Geri Al' : 'Tamamla';
                // })
                // .catch(error => console.error('Durum güncellerken hata:', error));

                // --- Backend entegrasyonu yapılana kadar Ekranda Simülasyon ---
                taskItem.classList.toggle('completed'); // Ekrandaki görünümü değiştir
                target.textContent = taskItem.classList.contains('completed') ? 'Geri Al' : 'Tamamla'; // Buton yazısını değiştir
                console.log(`Simülasyon: Görev ID ${taskId} durumu ${taskItem.classList.contains('completed') ? 'Tamamlandı' : 'Devam Ediyor'} olarak ayarlandı.`);
                // --- Simülasyon Sonu ---


            } else if (target.classList.contains('delete-button')) {
                 console.log(`Görev ID ${taskId} Silme Tıklandı`);
                 // Kullanıcıya silme onayını sor
                 if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                    // !!! BURADA BACKEND API'NIZA GÖREVİ SİLME (DELETE) İSTEĞİ GÖNDERECEĞİNİZ KOD YER ALACAK !!!
                    // Bu istek de yetkilendirme token'ı gerektirecek.
                    // fetch(`/api/tasks/${taskId}`, { // Örnek API endpoint'i (ID ile)
                    //     method: 'DELETE',
                    //     headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, // Yetkilendirme token'ı ekle
                    // })
                    // .then(response => {
                    //     if (!response.ok) { /* Hata */ if(response.status === 401) { /* Logine yönlendir */ } }
                    //     // Başarılı olursa backend'in döndürdüğü cevabı kontrol et
                    //     return response.text().then(text => text ? JSON.parse(text) : {}) // Cevap JSON değilse hata vermemesi için
                    // })
                    // .then(() => {
                    //     console.log('Görev Backendde Silindi:', taskId);
                    //     taskItem.remove(); // Ekrandaki '.task-item' elementini DOM'dan kaldır
                    // })
                    // .catch(error => console.error('Görev silerken hata:', error));

                    // --- Backend entegrasyonu yapılana kadar Ekranda Simülasyon ---
                    console.log(`Simülasyon: Görev ID ${taskId} ekrandan kaldırılıyor.`);
                    taskItem.remove(); // Elementi ekrandan kaldır
                    // --- Simülasyon Sonu ---
                 }
            }
        });
    }

    // --- Görev Yönetimi Fonksiyonları Sonu ---


}); // DOMContentLoaded listener'ın sonu - Tüm JS kodu bu süslü parantezlerin içinde olmalı