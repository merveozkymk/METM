// frontend/pages/dashboard/dashboard.js
// Task Manager Dashboard Sayfası için JavaScript kodları.

// DOM içeriği tamamen yüklendiğinde bu fonksiyon çalışır.
// Bu, sayfa HTML'i tamamen yüzenerek erişilebilir hale geldiğinde kodumuzun çalışmasını sağlar.
document.addEventListener('DOMContentLoaded', function() {

    // --- Dropdown Menü Fonksiyonelliği Başlangıcı ---
    // Navbar'daki profil resmi ve dropdown menüsünü yöneten kısım.
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
    const gorevlerimLink = document.querySelector('nav a'); // Navbar'daki ilk 'a' etiketini seçer

    if (gorevlerimLink) {
        // Linke tıklama olayı dinleyicisi ekle
        gorevlerimLink.addEventListener('click', function(event) {
            event.preventDefault(); // Varsayılan link davranışını (sayfa yenileme/sayfa içi kaydırma) engelle

            console.log('"Görevlerim" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');

            // Tüm Görevler sayfasının adresine yönlendir.
            // Bu yol, incomplete-tasks/index.html dosyasından tasks/index.html dosyasına giden göreceli yoldur.
            window.location.href = '../tasks/index.html'; // <<< Kendi dosya yapınıza göre bu yolu doğrulayın!
        });
    }

    const gorevEkleLink = document.querySelector('.navbar-center a:nth-child(2)'); // Navbar'daki 2. 'a' etiketini seçer (sağladığınız HTML yapısına göre)

    if (gorevEkleLink) {
        // Linke tıklama olayı dinleyicisi ekle
        gorevEkleLink.addEventListener('click', function(event) {
            event.preventDefault(); // Varsayılan link davranışını engelle

            console.log('"Görev ekle" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');

            // Görev ekleme formunun bulunduğu sayfanın adresine yönlendir.
            // Genellikle bu sayfa 'Tüm Görevler' sayfasıdır (tasks/index.html).
            // Bu yol, içinde bulunduğunuz HTML dosyasından tasks/index.html dosyasına giden göreceli yoldur.
            // Eğer bu kod incomplete-tasks.js içindeyse yol '../tasks/index.html' olmalı.
            // Eğer bu kod tasks.js içindeyse yol './index.html' olmalı (kendine yönlendirecek).
            // Eğer ayrı bir addtasks.html sayfanız varsa o sayfanın yolunu yazmalısınız.
            window.location.href = 'index.html'; // <<< Kendi dosya yapınıza ve hedef sayfaya göre bu yolu doğrulayın!

            // İsteğe bağlı: Eğer görev ekleme formuna doğrudan gitmek isterseniz ve formun bir ID'si varsa,
            // URL'ye #formID ekleyebilirsiniz (örn: '../tasks/index.html#addTaskForm').
        });
    }
    // --- Dropdown Menü Fonksiyonelliği Sonu ---


    // --- Kullanıcı Bilgilerini localStorage'dan Çekme ve Konsola Yazdırma Başlangıcı ---
    // Login sayfasında başarılı girişte localStorage'a kaydettiğimiz 'user' bilgisini (JSON stringi olarak) al.
    // Bu bilgi, kullanıcının ID'si, kullanıcı adı, e-postası ve rolü gibi bilgileri içerir.
    const loggedInUserString = localStorage.getItem('user');

    // localStorage'da 'user' key'ine ait bir değer varsa (yani kullanıcı giriş yapmışsa ve bilgi kaydedilmişse)
    if (loggedInUserString) {
        try {
            // localStorage'dan alınan JSON stringini JavaScript objesine çevir.
            const user = JSON.parse(loggedInUserString);

            // Kullanıcı bilgilerini tarayıcının konsoluna yazdır. Bu, dashboard'ın doğru kullanıcı için yüklendiğini doğrulamaya yardımcı olur.
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
            // Veri bozuksa güvenlik için kullanıcıyı çıkış yapmaya zorlamak iyi bir fikir olabilir.
            // localStorage.removeItem('user'); // Bozulan kullanıcı bilgisini temizle
            // localStorage.removeItem('authToken'); // İlişkili token'ı da temizle
            // console.log('Bozuk kullanıcı verisi temizlendi. Login sayfasına yönlendiriliyor...');
            // // Kullanıcıyı login sayfasına yönlendir (kendi login sayfanızın doğru yolunu yazın).
            // window.location.href = '../../auth/login/index.html'; // <<< Live Server login/index.html'den başlıyorsa bu yol
        }
    } else {
        // localStorage'da 'user' key'ine ait bir değer yoksa (kullanıcı giriş yapmamışsa veya localStorage temizlenmişse)
        console.log('localStorage\'da giriş yapmış kullanıcı bilgisi bulunamadı. Yetkilendirme gereklidir.');
        // Gerçek bir uygulamada, bu durumda kullanıcıyı otomatik olarak login sayfasına yönlendirmelisiniz.
        console.log('Login sayfasına yönlendiriliyor...');
        // Kullanıcıyı login sayfasına yönlendir (kendi login sayfanızın doğru yolunu yazın).
        // Buradaki yönlendirme, fetchTasks fonksiyonundaki yetkilendirme kontrolüyle aynı olmalıdır.
        window.location.href = '../../auth/login/index.html'; // <<< Live Server login/index.html'den başlıyorsa bu yol
    }
    // --- Kullanıcı Bilgileri Konsola Yazdırma Sonu ---


    // --- Görev Yönetimi Fonksiyonları Başlangıcı ---

    // görevlerin backendden çekilmesi (Güncellenmiş Hali)
    // Bu fonksiyon artık backend API'ye yetkilendirme token'ı ile istek göndererek kullanıcının görevlerini çekecek.
    async function fetchTasks() { // async anahtar kelimesi, await kullanabilmemizi sağlar
        // Görevleri çekeceğimiz backend API endpoint URL'si. Kendi backend adresinizi ve portunuzu doğrulayın.
        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; // << Backend adresinizi ve portunuzu doğrulayın

        // localStorage'dan yetkilendirme token'ını al. Bu token login sırasında backend tarafından verilmişti.
        const authToken = localStorage.getItem('authToken');

        // Eğer token yoksa, kullanıcı giriş yapmamış demektir veya token temizlenmiştir. Login sayfasına yönlendir.
        // Bu kontrol, backend'in 401/403 dönmesini beklemeden frontend'de hızlıca yönlendirme yapar.
        if (!authToken) {
            console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
            // Kullanıcı bilgisi de localStorage'dan temizlenmeli (eğer varsa)
             localStorage.removeItem('user');
            // Kendi login sayfanızın doğru yolunu yazın.
            window.location.href = '../../auth/login/index.html'; // <<< Live Server login/index.html'den başlıyorsa bu yol
            return; // Fonksiyonu burada sonlandır, fetch isteği göndermez.
        }

        try {
            console.log('Backendden görevler çekiliyor...');
            // Backend API'ye GET isteği gönderiyoruz. Yetkilendirme için token'ı başlığa ekliyoruz.
            const response = await fetch(backendTasksEndpoint, {
                method: 'GET', // Görevleri çekmek için GET metodu kullanılır.
                headers: {
                    // 'Authorization' başlığına "Bearer " öneki ile token'ı ekliyoruz. Bu, backend middleware'imizin beklediği formattır.
                    'Authorization': `Bearer ${authToken}`
                    // GET isteğinde genellikle bir body göndermediğimiz için 'Content-Type': 'application/json' gerekli değildir.
                },
            });

            // Backend cevabının başarılı olup olmadığını kontrol et (HTTP status kodu 2xx aralığında mı?).
            if (!response.ok) {
                // Eğer backend 401 Unauthorized veya 403 Forbidden hatası döndürürse (token geçersiz, süresi dolmuş vb.)
                if(response.status === 401 || response.status === 403) {
                    console.log('Yetkilendirme hatası. Token geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.');
                    // Geçersiz token ve kullanıcı bilgisini localStorage'dan temizle.
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    // Kullanıcıyı login sayfasına yönlendir.
                    window.location.href = '../../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                    return; // Fonksiyonu sonlandır.
                }

                // Diğer HTTP hataları için (örn: 500 Internal Server Error, 404 Not Found vb.) genel bir hata fırlat.
                let errorMessage = `HTTP hata! Durum: ${response.status}`;
                try {
                     // Backend'in hata durumunda JSON formatında bir mesaj döndürüp döndürmediğini kontrol et.
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage; // Backend mesajını kullan veya varsayılanı.
                } catch (e) {
                     // Backend JSON hata mesajı döndürmezse (örn: boş body veya HTML sayfası)
                     console.error('Hata cevabını JSON olarak okunamadı:', e);
                }
                // Oluşturulan hata mesajıyla yeni bir Error fırlat.
                throw new Error(errorMessage);
            }

            // Cevap başarılı ise, backend'in döndürdüğü JSON formatındaki body'yi oku.
            // Backend'imiz başarılı durumda kullanıcının görev listesini JSON dizisi olarak döndürecek.
            const tasks = await response.json();

            // Çekilen görev listesini konsola yazdır (debugging için).
            console.log('Backendden Görevler Başarıyla Çekildi:', tasks);

            // Çekilen görev listesini arayüzde göstermek için renderTasks fonksiyonunu çağır.
            renderTasks(tasks);

        } catch (error) {
            // fetch işlemi sırasında veya sonraki .then bloklarında bir hata oluşursa (örn: ağ bağlantısı yok, backend çalışmıyor, URL yanlış, JSON parse hatası)
            console.error('Görevleri çekerken bir hata oluştu:', error);
            // Kullanıcıya konsolda veya arayüzde bir hata mesajı gösterebilirsiniz.
            // Örneğin: alert('Görevler yüklenemedi. Lütfen internet bağlantınızı veya sunucuyu kontrol edin.');
        }
         // finally bloğu (opsiyonel): try veya catch çalıştıktan sonra her zaman çalışır (örn: yükleme göstergesini kapatma)
    }

    // --- Görev Listesini Arayüzde Gösterme Fonksiyonu ---
    // Bu fonksiyon, kendisine verilen görevler dizisini alır ve HTML'deki task listesini günceller.
    function renderTasks(tasks) {
        const taskListDiv = document.getElementById('taskList'); // Görevlerin ekleneceği HTML elementini (container) seç.
        if (!taskListDiv) {
            console.error('taskList elementi (ID="taskList") sayfada bulunamadı!');
            return; // Element yoksa fonksiyondan çık.
        }

        taskListDiv.innerHTML = ''; // Mevcut görev listesini temizle (dummy data veya eski listeden kalanları sil).

        // Her görev objesi için döngü yap.
        tasks.forEach(task => {
            // Her görev için yeni bir div elementi oluştur.
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item'); // CSS sınıfını ekle (stil için).

            // Görevin tamamlanma durumuna göre ek CSS sınıfı ekle (örn: üzeri çizili göstermek için).
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            // Görev ID'sini HTML elementinin data-attribute'ı olarak sakla. Bu, daha sonra silme veya tamamlama gibi işlemleri yaparken hangi göreve tıklandığını bilmemizi sağlar.
            taskItem.dataset.taskId = task.id;

            // Görev elementinin iç HTML yapısını oluştur (Başlık, Açıklama, Bitiş Tarihi, Durum, Aksiyon Butonları).
            taskItem.innerHTML = `
                <div>
                    <h3>${task.title}</h3> ${task.description ? `<p>${task.description}</p>` : ''} <span class="due-date">Bitiş: ${task.due_date || 'Belirtilmemiş'}</span> <span class="status">Durum: ${task.completed ? 'Tamamlandı' : 'Devam Ediyor'}</span> </div>
                <div class="task-actions">
                    <button class="complete-button">${task.completed ? 'Geri Al' : 'Tamamla'}</button>
                    <button class="delete-button">Sil</button>
                     </div>
            `;
            // Oluşturulan görev elementini task listesi container'ına ekle.
            taskListDiv.appendChild(taskItem);
        });
    }

    // Sayfa yüklendiğinde (DOMContentLoaded eventi tetiklendiğinde) görevleri çekme işlemini başlatmak için fetchTasks fonksiyonunu çağır.
    // Bu, kullanıcının giriş yaptıktan sonra dashboard'a geldiğinde görevlerinin otomatik olarak yüklenmesini sağlar.
    // NOT: fetchTasks fonksiyonu zaten yetkilendirme token'ını kontrol ettiği için, eğer kullanıcı login yapmamışsa buradan login sayfasına yönlendirilecektir.
    fetchTasks();


    // --- Yeni Görev Ekleme Formu Logic ---
// Kullanıcının yeni görev eklemesini sağlayan formun submit olayını yönetir.
const addTaskForm = document.getElementById('addTaskForm'); // Form elementini ID'si ile seç.

if (addTaskForm) { // addTaskForm elementi sayfada varsa
    // Formun submit (gönderme) olayını dinle.
    addTaskForm.addEventListener('submit', async function(event) { // async ekleyelim çünkü fetch kullanacağız
        event.preventDefault(); // Formun varsayılan submit işlemini (sayfa yenileme) engelle.

        // Input alanlarından güncel değerleri al (trim() ile başındaki ve sonundaki boşlukları temizle).
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const dueDateInput = document.getElementById('taskDueDate');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value; // HTML date inputundan YYYY-MM-DD formatında gelir.

        // Basit istemci tarafı doğrulama: Görev başlığı boş olamaz.
        if (!title) {
            alert('Görev başlığı boş olamaz!'); // Kullanıcıya bir uyarı göster.
            return; // Form gönderme işlemini burada durdur.
        }

        // --- Kullanıcı Bilgilerini Al ---
        // Görevi atayan (yani kendi) kullanıcının ID'sini ve grup ID'sini localStorage'dan al.
        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!currentUser || !currentUser.id || !currentUser.group_id) {
            console.error('Kullanıcı bilgileri eksik veya geçersiz. Lütfen tekrar giriş yapın.');
            alert('Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
            return;
        }

        // Yeni görev objesini hazırla. Bu obje, backend'e POST isteği ile gönderilecek veriyi temsil eder.
        const newTask = {
            title: title,
            description: description,
            due_date: dueDate || null, // Eğer bitiş tarihi boşsa, backend'e null olarak gönder.
            // Bu kısım ÖNEMLİ: Kendi görevini eklediği için user_id, created_by ve group_id kendi bilgileri olacak.
            user_id: currentUser.id,      // Görevin atanacağı kullanıcı ID'si (kendi ID'si)
            created_by: currentUser.id,   // Görevi oluşturan kullanıcı ID'si (kendi ID'si)
            group_id: currentUser.group_id // Görevin ait olduğu grup ID'si (kendi grubu)
        };

        // --- Backend API'ye Yeni Görev Oluşturma İsteği Gönderme ---
        const backendAddTaskEndpoint = 'http://localhost:3000/api/tasks';

        // localStorage'dan yetkilendirme token'ını al. Bu istek yetkilendirme gerektirir.
        const authToken = localStorage.getItem('authToken'); // 'authToken' yerine 'token' kullanılıyorsa

        // Token yoksa logine yönlendir.
        if (!authToken) {
            console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
            return;
        }

        try {
            console.log('Yeni görev backend\'e gönderiliyor:', newTask);
            
            // Backend API'ye POST isteği gönder. Body kısmında yeni görev verisini JSON formatında gönder.
            const response = await fetch(backendAddTaskEndpoint, {
                method: 'POST', // Yeni kaynak oluşturmak için POST metodu kullanılır.
                headers: {
                    'Content-Type': 'application/json', // Gönderilen verinin türünü belirtir.
                    'Authorization': `Bearer ${authToken}`, // Yetkilendirme token'ını başlığa ekle.
                },
                body: JSON.stringify(newTask), // JavaScript objesini JSON stringine çevir ve body olarak gönder.
            });

            // Backend cevabını kontrol et.
            if (!response.ok) {
                // Backend 401/403 döndürdüyse logine yönlendir.
                if(response.status === 401 || response.status === 403) {
                    console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                    localStorage.removeItem('authToken'); // 'authToken' yerine 'token' kullanılıyorsa
                    localStorage.removeItem('user');
                    window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                    return;
                }
                // Diğer HTTP hataları için hata fırlat.
                let errorMessage = `HTTP hata! Durum: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) { 
                    console.error('Hata cevabını JSON okurken hata:', e); 
                    errorMessage = `Sunucudan hata alındı ancak detay okunamadı. Durum: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            // Cevap başarılı ise, backend'in döndürdüğü yeni oluşturulmuş görevi al.
            const addedTask = await response.json();
            console.log('Yeni Görev Backendde Başarıyla Eklendi:', addedTask);

            // Formu temizle.
            addTaskForm.reset();
            alert('Görev başarıyla eklendi!'); // Kullanıcıya başarılı olduğunu bildir

            // Görev listesini yeniden çek ve ekrana basarak listeyi güncelle.
            // Bu fonksiyonun (fetchTasks) bu kapsamda erişilebilir olduğundan emin olun.
            // Eğer fetchTasks başka bir dosyadaysa veya global değilse, buraya import etmeniz/çağırmanız gerekir.
            // Örneğin: window.location.href = '../tasks/index.html'; ile görevler sayfasına yönlendirme yapabilirsiniz.
            if (typeof fetchTasks === 'function') {
                fetchTasks(); 
            } else {
                console.warn('fetchTasks fonksiyonu bulunamadı. Görev listesini manuel yenilemeniz gerekebilir.');
                // Alternatif olarak, görevin eklendiğini görmek için tasks sayfasına yönlendirebilirsiniz.
                // window.location.href = '../tasks/index.html'; 
            }

        } catch (error) {
            // fetch işlemi veya sonraki bloklarda bir hata olursa.
            console.error('Görev eklerken bir hata oluştu:', error);
            alert('Görev eklenirken bir hata oluştu: ' + error.message); // Kullanıcıya basit bir hata mesajı göster.
        } finally {
            // İşlem bittiğinde (başarılı veya hatalı) yapılacaklar.
            // Örneğin: loadingIndicator'ı gizleme.
        }
    });
}


    // --- Görev Aksiyonları (Tamamlama, Düzenleme, Silme) Logic (Event Delegation Kullanılarak) ---
    // Görev listesi container'ına tıklama olayı dinleyicisi eklenerek, listedeki herhangi bir görev elementindeki
    // aksiyon butonlarına (tamamla, sil) tıklanmaları yönetilir. Bu yöntem, her bir buton için ayrı dinleyici eklemekten daha verimlidir.
    const taskListDiv = document.getElementById('taskList'); // Görev listesi container'ının ID'si.
    if (taskListDiv) { // Görev listesi container'ı sayfada varsa
         // taskListDiv elementine tıklama olayı dinleyicisi ekle (Event Delegation).
         taskListDiv.addEventListener('click', async function(event) { // async ekleyelim çünkü fetch kullanacağız
            const target = event.target; // Tıklanan spesifik HTML elementini (örn: <button>) al.

            // Tıklanan elementin veya üst elementlerinin arasında '.task-item' sınıfına sahip en yakın parent elementini bul.
            // Bu, hangi göreve ait bir aksiyona tıklandığını belirlememizi sağlar.
            const taskItem = target.closest('.task-item');

            // Eğer tıklama bir '.task-item' elementi içinde olmadıysa (örneğin boş alana tıklandıysa) işlemi durdur.
            if (!taskItem) return;

            // '.task-item' elementinin data-task-id attribute'unda sakladığımız görev ID'sini al.
            const taskId = taskItem.dataset.taskId;

            // Hangi aksiyon butonuna tıklandığını kontrol et (classList.contains ile).

            // --- Görev Tamamlama/Durum Değiştirme ---
            if (target.classList.contains('complete-button')) {
                console.log(`Görev ID ${taskId} Tamamlama/Durum Değiştirme Butonuna Tıklandı.`);
                // Tıklanan '.task-item' elementinin şu anki 'completed' sınıfına sahip olup olmadığını kontrol ederek
                // görevin mevcut tamamlanma durumunu belirle.
                const isCompleted = taskItem.classList.contains('completed');

                // !!! BACKEND API'ye Görevin Durumunu Güncelleme (PATCH/PUT) İsteği Gönderme !!!
                // Backend'in görevin durumunu güncelleme endpoint URL'si. Kendi adresinizi, portunuzu ve endpoint yapısını doğrulayın.
                const backendUpdateTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`; // ID URL'e eklenir

                // localStorage'dan yetkilendirme token'ını al. Bu istek yetkilendirme gerektirir.
                const authToken = localStorage.getItem('authToken');

                 // Token yoksa logine yönlendir.
                 if (!authToken) {
                     console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                     localStorage.removeItem('user');
                     window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                     return;
                 }

                try {
                     console.log(`Görev ID ${taskId} durumu güncelleniyor. Yeni durum: ${!isCompleted}`);
                     // Backend API'ye PATCH isteği gönder. Body kısmında yeni tamamlanma durumunu gönder.
                    const response = await fetch(backendUpdateTaskEndpoint, {
                        method: 'PATCH', // Kaynağın bir kısmını güncellemek için PATCH metodu uygundur. PUT tüm kaynağı güncelleyebilir.
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`, // Yetkilendirme token'ı ekle.
                        },
                        body: JSON.stringify({ completed: !isCompleted }), // Mevcut durumun tersini gönder (true ise false, false ise true).
                    });

                    // Backend cevabını kontrol et.
                    if (!response.ok) {
                        // Backend 401/403 döndürdüyse logine yönlendir.
                         if(response.status === 401 || response.status === 403) {
                             console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                             localStorage.removeItem('authToken');
                             localStorage.removeItem('user');
                             window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                             return;
                        }
                         // Diğer HTTP hataları için hata fırlat.
                         let errorMessage = `HTTP hata! Durum: ${response.status}`;
                         try {
                             const errorData = await response.json();
                             errorMessage = errorData.message || errorMessage;
                         } catch (e) { console.error('Hata cevabını JSON okurken hata:', e); }
                         throw new Error(errorMessage);
                    }

                    // Cevap başarılı ise, backend'in döndürdüğü güncellenmiş görev bilgisini al (isteğe bağlı).
                    const updatedTask = await response.json();
                    console.log('Görev Durumu Backendde Başarıyla Güncellendi:', updatedTask);

                    // Arayüzdeki '.task-item' elementinin 'completed' sınıfını değiştir (görsel durumu güncelle).
                    taskItem.classList.toggle('completed');
                    // Butonun yazısını da tamamlanma durumuna göre değiştir.
                    target.textContent = taskItem.classList.contains('completed') ? 'Geri Al' : 'Tamamla';

                    // İsteğe bağlı: UpdatedTask objesinden gelen diğer bilgileri de ekranda güncelleyebilirsiniz (örn: 'Durum:' metni).
                    const statusElement = taskItem.querySelector('.status');
                    if (statusElement) {
                        statusElement.textContent = `Durum: ${updatedTask.completed ? 'Tamamlandı' : 'Devam Ediyor'}`;
                    }


                } catch (error) {
                    // fetch işlemi veya sonraki bloklarda bir hata olursa.
                    console.error('Görev durumunu güncellerken bir hata oluştu:', error);
                    alert('Görev durumu güncellenemedi. Lütfen tekrar deneyin.'); // Kullanıcıya hata mesajı göster.
                }
            }

            // --- Görev Silme ---
            else if (target.classList.contains('delete-button')) {
                 console.log(`Görev ID ${taskId} Silme Butonuna Tıklandı.`);
                 // Kullanıcıya silme işlemini onaylatmak için bir onay penceresi göster.
                 if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                    // !!! BACKEND API'ye Görevi Silme (DELETE) İsteği Gönderme !!!
                    // Backend'in görev silme (DELETE) endpoint URL'si. Kendi adresinizi, portunuzu ve endpoint yapısını doğrulayın.
                    const backendDeleteTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`; // ID URL'e eklenir

                     // localStorage'dan yetkilendirme token'ını al. Bu istek yetkilendirme gerektirir.
                    const authToken = localStorage.getItem('authToken');

                     // Token yoksa logine yönlendir.
                     if (!authToken) {
                         console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                         localStorage.removeItem('user');
                         window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                         return;
                     }

                    try {
                        console.log(`Görev ID ${taskId} backend'den siliniyor.`);
                         // Backend API'ye DELETE isteği gönder.
                        const response = await fetch(backendDeleteTaskEndpoint, {
                            method: 'DELETE', // Kaynağı silmek için DELETE metodu kullanılır.
                            headers: {
                                 // Yetkilendirme token'ı ekle.
                                'Authorization': `Bearer ${authToken}`,
                            },
                            // DELETE isteğinde genellikle body olmaz.
                        });

                        // Backend cevabını kontrol et.
                        if (!response.ok) {
                            // Backend 401/403 döndürdüyse logine yönlendir.
                             if(response.status === 401 || response.status === 403) {
                                 console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                                 localStorage.removeItem('authToken');
                                 localStorage.removeItem('user');
                                 window.location.href = '../../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                                 return;
                            }
                             // Diğer HTTP hataları için hata fırlat.
                             let errorMessage = `HTTP hata! Durum: ${response.status}`;
                             // Silme endpointleri genellikle body döndürmez veya sadece başarı mesajı döner. JSON parse etmeden hatayı almayı deneyelim.
                             try {
                                 const errorData = await response.json(); // JSON dönerse okuyalım
                                 errorMessage = errorData.message || errorMessage;
                             } catch (e) {
                                 // Eğer JSON hatası gelmezse response body'sini text olarak oku veya genel hata mesajı kullan
                                 // const textError = await response.text(); console.error('Hata cevabı:', textError);
                                 console.error('Hata cevabını okurken hata:', e);
                             }
                             throw new Error(errorMessage);
                        }

                        // Cevap başarılı ise, görevi arayüzden kaldır.
                        console.log(`Görev ID ${taskId} arayüzden kaldırılıyor.`);
                        taskItem.remove(); // Görev elementini DOM'dan kaldır.

                        // İsteğe bağlı: Backend'den silme onayı veya silinen görevin ID'si gibi bilgileri alabilirsiniz (eğer backend dönüyorsa).
                        // const deleteConfirmation = await response.json();
                        // console.log('Silme Onayı:', deleteConfirmation);

                    } catch (error) {
                        // fetch işlemi veya sonraki bloklarda bir hata olursa.
                        console.error('Görevi silerken bir hata oluştu:', error);
                        alert('Görev silinirken bir hata oluştu. Lütfen tekrar deneyin.'); // Kullanıcıya basit bir hata mesajı göster.
                    }
                 }
            }
            // --- Görev Silme Sonu ---

            // --- Görev Düzenleme (İsteğe bağlı olarak eklenecekse buraya logic yazılır) ---
            // else if (target.classList.contains('edit-button')) {
            //     console.log(`Görev ID ${taskId} Düzenleme Butonuna Tıklandı`);
            //     // Düzenleme formu gösterme, mevcut veriyi doldurma, kaydetme/iptal etme logicleri burada yer alır.
            //     // Güncelleme işlemi tamamlandığında PUT/PATCH isteği gönderecek kod da buraya veya ayrı bir fonksiyona yazılır.
            // }
            // --- Görev Düzenleme Sonu ---

        }); // taskListDiv click event listener sonu
    } // if taskListDiv sonu

    // --- Görev Yönetimi Fonksiyonları Sonu ---


}); // DOMContentLoaded listener'ın sonu - Tüm JS kodunuz bu süslü parantezlerin içinde olmalı