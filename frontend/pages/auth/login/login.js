// frontend/pages/auth/login/login.js

// DOM içeriği tamamen yüklendiğinde bu fonksiyon çalışır
document.addEventListener('DOMContentLoaded', function() {

    // HTML elementlerini seçiyoruz
    // Login sayfasının HTML'indeki formun id'sinin 'loginForm' olduğundan emin olun.
    const loginForm = document.getElementById('loginForm');
    // Input alanlarının id'lerinin 'email' ve 'password' olduğundan emin olun.
    const emailInput = document.getElementById('email'); // E-posta inputu
    const passwordInput = document.getElementById('password'); // Şifre inputu
    // Mesajları göstereceğimiz HTML elementini seçiyoruz (HTML'de eklenmeli)
    const errorMessageDiv = document.getElementById('errorMessage');

    // Kullanıcıya hata veya başarı mesajı göstermek için yardımcı fonksiyon
    // isError = true ise kırmızı (hata), false ise yeşil (başarı) renk kullanır
    function displayMessage(message, isError = true) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message; // Mesajı div'in içine yaz
            // Mesajın rengini türüne göre ayarla
            errorMessageDiv.style.color = isError ? 'red' : 'green';
            // Mesaj varsa div'i görünür yap (display: block), yoksa gizle (display: none)
            errorMessageDiv.style.display = message ? 'block' : 'none';
        } else {
            // Eğer errorMessageDiv HTML'de tanımlı değilse, mesajı konsola yazdır veya alert kullan (geliştirme aşaması için)
            if (message) {
                console.error(message); // Hata ise konsola error olarak yaz
                // alert(message); // Kullanıcı deneyimi için genellikle tercih edilmez
            }
        }
    }


    // loginForm elementi HTML'de bulunduysa ve inputlar mevcutsa
    if (loginForm && emailInput && passwordInput) {
        // Forma submit (gönderme) olayı dinleyicisi ekliyoruz
        // async anahtar kelimesi, içinde await kullanabileceğimizi belirtir (fetch asenkron olduğu için)
        loginForm.addEventListener('submit', async function(event) {
            // Formun varsayılan submit işlemini (sayfa yeniden yükleme) engelliyoruz
            event.preventDefault();

            // Önceki hata veya başarı mesajlarını temizle
            displayMessage('', false); // Boş mesaj göndererek div'i gizler

            // Input alanlarından güncel değerleri alıyoruz
            // value.trim() ile başındaki ve sonundaki boşlukları sileriz
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // --- 1. İstemci Tarafı Basit Doğrulama ---
            // Alanların boş olup olmadığını kontrol et
            if (!email) {
                displayMessage('Lütfen e-posta adresinizi girin.');
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            if (!password) {
                displayMessage('Lütfen şifrenizi girin.');
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // Basit e-posta format kontrolü (@ ve . içeriyor mu) - daha gelişmiş regex kullanılabilir
            if (!email.includes('@') || !email.includes('.')) {
                 displayMessage('Lütfen geçerli bir e-posta adresi girin.');
                 return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // --- İstemci Tarafı Doğrulama Sonu ---

            // Buraya bir yükleme göstergesi (spinner gibi) ekleyebilirsiniz.

            try {
                // --- 2. Backend'e Bilgileri Gönderme (fetch kullanarak) ---
                // Backend login API endpoint'inizin doğru URL'sini buraya yazın.
                // Örneğin: http://localhost:3000/api/auth/login
                const backendLoginEndpoint = 'http://localhost:3000/api/auth/login'; // << PORT'u backend portunuzla değiştirin

                // fetch fonksiyonu ile backend'e asenkron HTTP isteği gönderiyoruz.
                const response = await fetch(backendLoginEndpoint, {
                    method: 'POST', // HTTP metodu POST olacak
                    headers: {
                        // Gönderdiğimiz verinin türünü belirtiyoruz (JSON formatında).
                        'Content-Type': 'application/json',
                        // Eğer backend'iniz yetkilendirme başlığı bekliyorsa (örn: CSRF token için), buraya ekleyebilirsiniz.
                        // 'X-CSRF-Token': 'some-token',
                    },
                    // Gönderilecek veriyi JavaScript objesinden JSON formatına çeviriyoruz.
                    body: JSON.stringify({ email: email, password: password }),
                });

                // --- 3. Backend Cevabını İşleme ---
                // Backend'den gelen HTTP cevabını kontrol ediyoruz. response.ok, status kodunun 2xx aralığında olup olmadığını söyler.
                if (!response.ok) { // Eğer HTTP status kodu 200-299 aralığında değilse (örn: 400, 401, 500 hataları)
                    let errorMessage = 'Giriş başarısız oldu.'; // Varsayılan hata mesajı
                    try {
                        // Backend genellikle hata durumunda da bir JSON body gönderir ({ message: "..." } gibi). Bunu okumaya çalışıyoruz.
                        const errorData = await response.json();
                        // Backend'den gelen bir 'message' alanı varsa onu kullan, yoksa varsayılan hata mesajını kullan.
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        // Eğer backend JSON formatında bir hata body'si döndürmezse (örn: sadece 500 status kodu ve boş body)
                        console.error('Backend hata cevabını JSON olarak okunamadı:', e);
                        // Genel bir sunucu hatası mesajı göster.
                        errorMessage = `Sunucu hatası (${response.status}). Lütfen daha sonra tekrar deneyin.`;
                    }
                    // Oluşturulan hata mesajını kullanıcıya göster (kırmızı renkli).
                    displayMessage(errorMessage);

                    // İsteğe bağlı: Hata durumunda şifre alanını temizle.
                    passwordInput.value = '';


                } else { // Eğer HTTP status kodu 2xx aralığında ise (Backend işlemi başarılı)
                    // Backend'den gelen başarılı cevabı oku (genellikle JSON formatında { message: "...", token: "...", user: { ... } } gibi).
                    const successData = await response.json();
                    console.log('Giriş Başarılı:', successData);

                    // --- 4. Başarılı Giriş Sonrası Yapılacaklar ---
                    // Backend cevabında bir yetkilendirme token'ı (JWT gibi) varsa, bunu tarayıcının localStorage'ında sakla.
                    // Bu token, kullanıcının kimliğini doğrulamak için yetkilendirme gerektiren sonraki isteklere eklenecek.
                    if (successData.token) {
                         localStorage.setItem('authToken', successData.token);
                         console.log('Auth Token Local Storage\'a Kaydedildi.');
                         // İsteğe bağlı: Kullanıcı bilgilerini de saklayabilirsiniz (rolü gibi)
                         if(successData.user) {
                             localStorage.setItem('user', JSON.stringify(successData.user));
                             console.log('Kullanıcı Bilgileri Local Storage\'a Kaydedildi.');
                         }
                    }

                     // Kullanıcıyı dashboard sayfasına yönlendir.
                    // Dashboard sayfanızın doğru URL'sini buraya yazın.
                    // Örneğin: '/dashboard/index.html'
                    if (successData.user && successData.user.role === 'admin') {
                        console.log('Admin rolünde kullanıcı, adminTasks sayfasına yönlendiriliyor.');
                        window.location.href = '../../adminTeam/index.html'; // Admin için özel sayfa
                    }else {
                        console.log('Normal kullanıcı, tasks sayfasına yönlendiriliyor.');
                        window.location.href = '../../tasks/index.html'; // Normal kullanıcı için sayfa
                    }

                    // Başarı mesajı göstermek isterseniz (yönlendirme genellikle hemen olur, o yüzden çok görünmeyebilir)
                    // displayMessage('Giriş başarılı!', false); // false ile yeşil gösterir
                }

            } catch (error) {
                // fetch isteğinin kendisi sırasında bir hata oluşursa (örn: ağ bağlantısı yok, backend adresi yanlış, sunucu çökmüş)
                console.error('Giriş işlemi sırasında beklenmeyen bir hata oluştu:', error);
                // Kullanıcıya genel bir hata mesajı göster (kırmızı renkli).
                displayMessage('Giriş yapılırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
                 // İsteğe bağlı: Hata durumunda şifre alanını temizle.
                 passwordInput.value = '';
            } finally {
                // İşlem (başarılı veya hatalı) tamamlandığında yükleme göstergesini gizleyebilirsiniz (eğer kullanıyorsanız).
                // Örneğin: hideLoadingIndicator();
            }
        });

    } else {
        // Eğer form veya gerekli input elementleri sayfada bulunamazsa, konsola bir hata yaz ve kullanıcıya mesaj göster (eğer mümkünse).
        console.error("Login formu (ID='loginForm') veya gerekli inputlar (email, password) sayfada bulunamadı. Lütfen HTML'inizi kontrol edin.");
         // Kullanıcıya görünür bir mesaj gösterebilirsiniz (errorMessageDiv varsa çalışır)
         displayMessage('Form yüklenirken bir hata oluştu. Lütfen sayfa yöneticisi ile iletişime geçin.', true);
    }


    // İsterseniz buraya input alanlarına odaklanıldığında veya değerleri değiştiğinde
    // çalışacak başka olay dinleyicileri de ekleyebilirsiniz (örn: anlık doğrulama veya format kontrolü).


}); // DOMContentLoaded listener'ın sonu - Tüm JS kodu bu süslü parantezlerin içinde olmalı