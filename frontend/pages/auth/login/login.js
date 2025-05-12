// HTML'deki form elementini id'si ile alıyoruz
const loginForm = document.getElementById('loginForm');

// Forma bir 'submit' olayı dinleyicisi ekliyoruz
loginForm.addEventListener('submit', function(event) {
    // Formun normal submit işlemini (sayfa yenileme) engelliyoruz
    event.preventDefault();

    // Input alanlarından değerleri alıyoruz
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const email = emailInput.value;
    const password = passwordInput.value;

    // Şimdilik sadece konsola yazdırıyoruz (Backend entegrasyonu sonraki adım)
    console.log('E-posta:', email);
    console.log('Şifre:', password);

    // !!! Burada normalde:
    // 1. İstemci tarafı doğrulama (örn: E-posta formatı doğru mu?)
    // 2. Backend'e bu bilgileri göndermek için fetch() veya XMLHttpRequest kullanmak
    // 3. Backend'den gelen cevaba göre (başarılı giriş, hatalı şifre vb.) kullanıcıya geri bildirimde bulunmak
    // 4. Başarılı ise kullanıcıyı dashboard sayfasına yönlendirmek
    // ... gibi işlemler yapılır.
});

// İsterseniz buraya input alanlarına odaklanıldığında veya değerleri değiştiğinde
// çalışacak başka olay dinleyicileri de ekleyebilirsiniz (örn: anlık doğrulama).