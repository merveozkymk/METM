// register.js

// HTML'deki form elementini id'si ile alıyoruz
// Kayıt formunun ID'si 'registerForm' olarak değiştirildi
const registerForm = document.getElementById('registerForm');

// Forma bir 'submit' olayı dinleyicisi ekliyoruz
registerForm.addEventListener('submit', function(event) {
    // Formun normal submit işlemini (sayfa yenileme) engelliyoruz
    event.preventDefault();

    // Input alanlarından değerleri alıyoruz
    // Kayıt sayfasında eklenen 'username' inputunu alıyoruz
    const usernameInput = document.getElementById('username');
    // E-posta inputunu alıyoruz (HTML'de ID'si email olmalı)
    const emailInput = document.getElementById('email');
    // Şifre inputunu alıyoruz
    const passwordInput = document.getElementById('password');
    // Kayıt sayfasında eklenen 'confirm-password' inputunu alıyoruz
    const confirmPasswordInput = document.getElementById('confirm-password'); // YENİ


    // Input değerlerini değişkenlere atıyoruz
    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value; // YENİ: Şifre tekrar değeri


    // Şimdilik sadece konsola yazdırıyoruz (Backend entegrasyonu ve doğrulama sonraki adım)
    console.log('Kayıt Bilgileri:');
    console.log('Kullanıcı Adı:', username);
    console.log('E-posta:', email);
    console.log('Şifre:', password);
    console.log('Şifre Tekrar:', confirmPassword); // YENİ: Şifre tekrarını da logla


    // !!! Burada normalde:
    // 1. İstemci tarafı doğrulama (örn: Alanlar boş mu? E-posta formatı doğru mu? Şifre yeterince güçlü mü?)
    // 2. **En önemlisi: Şifre (password) ve Şifre Tekrarı (confirmPassword) alanlarının değerlerinin BİRBİRİYLE EŞLEŞTİĞİNİ KONTROL ETMEK.** Eğer eşleşmiyorsa kullanıcıya bir hata mesajı göstermeli ve formu göndermeyi durdurmalısınız.
    // 3. Backend'e bu bilgileri (kullanıcı adı, e-posta, şifre) göndermek için fetch() veya XMLHttpRequest kullanmak
    // 4. Backend'den gelen cevaba göre (başarılı kayıt, kullanıcı adı/e-posta zaten alınmış gibi hatalar) kullanıcıya geri bildirimde bulunmak
    // 5. Başarılı kayıt sonrası kullanıcıyı login sayfasına veya başka bir sayfaya yönlendirmek
    // ... gibi işlemler yapılır.
});

// İsterseniz buraya input alanlarına odaklanıldığında veya değerleri değiştiğinde
// çalışacak başka olay dinleyicileri de ekleyebilirsiniz (örn: anlık doğrulama veya şifre eşleşme kontrolü).