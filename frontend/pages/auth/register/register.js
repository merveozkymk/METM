// frontend/pages/auth/register/register.js

// DOM içeriği tamamen yüklendığında bu fonksiyon çalışır
document.addEventListener('DOMContentLoaded', function() {

    // HTML elementlerini seçiyoruz
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    // Mesajları göstereceğimiz HTML elementini seçiyoruz (HTML'de eklenmeli)
    const errorMessageDiv = document.getElementById('errorMessage');

    // Kullanıcıya hata veya başarı mesajı göstermek için yardımcı fonksiyon
    function displayMessage(message, isError = true) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message; // Mesajı div'in içine yaz
            // Mesajın rengini türüne göre ayarla (Hata için kırmızı, başarı için yeşil)
            errorMessageDiv.style.color = isError ? 'red' : 'green';
            // Mesaj varsa div'i görünür yap (display: block), yoksa gizle (display: none)
            errorMessageDiv.style.display = message ? 'block' : 'none';
        } else {
            // Eğer errorMessageDiv HTML'de tanımlı değilse, mesajı konsola yazdır veya alert kullan (geliştirme aşaması için)
            if (message) {
                console.error(message); // Hata ise konsola error olarak yaz
                // Eğer isterseniz alert() de kullanabilirsiniz, ancak alert kullanıcı deneyimi için iyi değildir
                // alert(message);
            }
        }
    }

    // registerForm elementi sayfada bulunduysa (HTML'in doğru olduğundan emin ol)
    // Diğer input elementlerinin de varlığını kontrol etmek iyi pratiktir
    if (registerForm && usernameInput && emailInput && passwordInput && confirmPasswordInput) {
        // Forma submit (gönderme) olayı dinleyicisi ekliyoruz
        // async anahtar kelimesi, içinde await kullanabileceğimizi belirtir (fetch asenkron olduğu için)
        registerForm.addEventListener('submit', async function(event) {
            // Formun normal submit işlemini (sayfa yeniden yükleme) engelliyoruz
            event.preventDefault();

            // Önceki hata veya başarı mesajlarını temizle
            displayMessage('', false); // Boş mesaj göndererek div'i gizler

            // Input alanlarından güncel değerleri alıyoruz
            // value.trim() ile başındaki ve sonundaki boşlukları sileriz
            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim(); // Şifre tekrar değeri

            // --- 1. İstemci Tarafı Doğrulama ---
            // Alanların boş olup olmadığını kontrol et
            if (!username) {
                displayMessage('Lütfen bir kullanıcı adı girin.');
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            if (!email) {
                displayMessage('Lütfen bir e-posta adresi girin.');
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // Basit e-posta format kontrolü (@ ve . içeriyor mu) - daha gelişmiş regex kullanılabilir
            if (!email.includes('@') || !email.includes('.')) {
                 displayMessage('Lütfen geçerli bir e-posta adresi girin.');
                 return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            if (!password) {
                displayMessage('Lütfen bir şifre belirleyin.');
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            if (!confirmPassword) {
                 displayMessage('Lütfen şifrenizi tekrar girin.');
                 return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // **En Önemlisi: Şifre ve Şifre Tekrar alanlarının değerlerinin BİRBİRİYLE EŞLEŞTİĞİNİ KONTROL ETMEK.**
            if (password !== confirmPassword) {
                displayMessage('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
                // Şifre inputlarını temizleyerek kullanıcının tekrar girmesini sağlamak iyi pratiktir
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // İsteğe bağlı: Parola gücü kontrolü (minimum uzunluk, karakter türleri vb.) eklenebilir
            if (password.length < 6) { // Örnek: Minimum 6 karakter uzunluğu
                 displayMessage('Şifre en az 6 karakter olmalıdır.');
                 return; // Doğrulama başarısız, fonksiyonu burada durdur
            }
            // --- İstemci Tarafı Doğrulama Sonu ---

            // Buraya bir yükleme göstergesi (spinner gibi) ekleyebilirsiniz.

            try {
                // --- 3. Backend'e Bilgileri Gönderme (fetch kullanarak) ---
                // Backend register API endpoint'inizin doğru URL'sini buraya yazın.
                // Örneğin: http://localhost:3000/api/auth/register
                const backendRegisterEndpoint = 'http://localhost:3000/api/auth/register'; // << PORT'u backend portunuzla değiştirin

                // fetch fonksiyonu ile backend'e asenkron HTTP isteği gönderiyoruz.
                const response = await fetch(backendRegisterEndpoint, {
                    method: 'POST', // HTTP metodu POST olacak
                    headers: {
                        // Gönderdiğimiz verinin türünü belirtiyoruz (JSON formatında).
                        'Content-Type': 'application/json',
                        // Eğer backend'iniz yetkilendirme başlığı bekliyorsa (örn: CSRF token için), buraya ekleyebilirsiniz.
                        // 'X-CSRF-Token': 'some-token',
                    },
                    // Gönderilecek veriyi JavaScript objesinden JSON formatına çeviriyoruz.
                    // Dikkat: confirmPassword backend'e gönderilmez, sadece frontend doğrulaması içindir.
                    body: JSON.stringify({ username: username, email: email, password: password }),
                });

                // --- 4. Backend Cevabını İşleme ---
                // Backend'den gelen HTTP cevabını kontrol ediyoruz. response.ok, status kodunun 2xx aralığında olup olmadığını söyler.
                if (!response.ok) { // Eğer HTTP status kodu 200-299 aralığında değilse (örn: 400, 409, 500 hataları)
                    let errorMessage = 'Kayıt başarısız oldu.'; // Varsayılan hata mesajı
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
                    // Oluşturulan hata mesajını kullanıcıya göster.
                    displayMessage(errorMessage);

                    // İsteğe bağlı: Hata durumunda şifre alanlarını tekrar temizle.
                    passwordInput.value = '';
                    confirmPasswordInput.value = '';

                } else { // Eğer HTTP status kodu 2xx aralığında ise (Backend işlemi başarılı)
                    // Backend'den gelen başarılı cevabı oku (genellikle JSON formatında { message: "...", userId: ... } gibi).
                    const successData = await response.json();
                    console.log('Kayıt Başarılı:', successData);

                    // --- 5. Başarılı Kayıt Sonrası Kullanıcıya Bilgi Verme ve Yönlendirme ---
                    // Kullanıcıya kayıt işleminin başarılı olduğunu belirten yeşil bir mesaj göster.
                    displayMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.', false); // İkinci parametre false olduğu için renk yeşil olur

                    // Genellikle başarılı kayıttan sonra kullanıcı giriş sayfasına yönlendirilir.
                    // Kullanıcının mesajı görmesi için kısa bir bekleme süresi ekleyebiliriz (örn: 2 saniye).
                    setTimeout(() => {
                        // Login sayfanızın doğru URL'sini buraya yazın.
                        // Örneğin: '/auth/login/index.html'
                         window.location.href = '/auth/login/index.html';
                    }, 2000); // 2000 milisaniye (2 saniye) sonra yönlendir

                }

            } catch (error) {
                // fetch isteğinin kendisi sırasında bir hata oluşursa (örn: ağ bağlantısı yok, backend adresi yanlış)
                console.error('Kayıt işlemi sırasında beklenmeyen bir hata oluştu:', error);
                // Kullanıcıya genel bir hata mesajı göster.
                displayMessage('Kayıt yapılırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
                // İsteğe bağlı: Hata durumunda şifre alanlarını temizle.
                 passwordInput.value = '';
                 confirmPasswordInput.value = '';
            } finally {
                // İşlem (başarılı veya hatalı) tamamlandığında yükleme göstergesini gizleyebilirsiniz (eğer kullanıyorsanız).
                // Örneğin: hideLoadingIndicator();
            }
        });

    } else {
        // Eğer form veya gerekli input elementleri sayfada bulunamazsa, konsola bir hata yaz ve kullanıcıya mesaj göster (eğer mümkünse).
        console.error("Kayıt formu (ID='registerForm') veya gerekli inputlar (username, email, password, confirm-password) sayfada bulunamadı. Lütfen HTML'inizi kontrol edin.");
         // Kullanıcıya görünür bir mesaj gösterebilirsiniz (errorMessageDiv varsa çalışır)
         displayMessage('Form yüklenirken bir hata oluştu. Lütfen sayfa yöneticisi ile iletişime geçin.', true);
    }


    // İsterseniz buraya input alanlarına odaklanıldığında veya değerleri değiştiğinde
    // çalışacak başka olay dinleyicileri de ekleyebilirsiniz (örn: anlık doğrulama veya şifre eşleşme kontrolü).


}); // DOMContentLoaded listener'ın sonu - Tüm JS kodu bu süslü parantezlerin içinde olmalı