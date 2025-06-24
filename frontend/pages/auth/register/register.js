document.addEventListener('DOMContentLoaded', function() {

    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessageDiv = document.getElementById('errorMessage'); 

    function displayMessage(message, isError = true) {
        if (errorMessageDiv) {
            errorMessageDiv.textContent = message; 
            errorMessageDiv.style.color = isError ? 'red' : 'green';
            errorMessageDiv.style.display = message ? 'block' : 'none';
        } else {
            if (message) {
                console.error(message); 
            }
        }
    }

    if (registerForm && usernameInput && emailInput && passwordInput && confirmPasswordInput) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            displayMessage('', false); 

            const username = usernameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (!username) {
                displayMessage('Lütfen bir kullanıcı adı girin.');
                return; 
            }
            if (!email) {
                displayMessage('Lütfen bir e-posta adresi girin.');
                return; 
            }
             if (!email.includes('@') || !email.includes('.')) {
                 displayMessage('Lütfen geçerli bir e-posta adresi girin.');
                 return; 
             }
            if (!password) {
                displayMessage('Lütfen bir şifre belirleyin.');
                return; 
            }
             if (!confirmPassword) {
                 displayMessage('Lütfen şifrenizi tekrar girin.');
                 return; 
             }
            if (password !== confirmPassword) {
                displayMessage('Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.');
                passwordInput.value = '';
                confirmPasswordInput.value = '';
                return; 
            }
             if (password.length < 6) { 
                 displayMessage('Şifre en az 6 karakter olmalıdır.');
                 return; 
             }

            try {
                const backendRegisterEndpoint = 'http://localhost:3000/api/auth/register'; 

                const response = await fetch(backendRegisterEndpoint, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: username, email: email, password: password }),
                });

                if (!response.ok) { 
                    let errorMessage = 'Kayıt başarısız oldu.'; 
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        console.error('Backend hata cevabını JSON olarak okunamadı veya parse hatası:', e);
                        errorMessage = `Sunucu hatası (${response.status}). Lütfen daha sonra tekrar deneyin.`;
                    }
                    displayMessage(errorMessage);

                     passwordInput.value = '';
                     confirmPasswordInput.value = '';

                } else { 
                    const successData = await response.json(); 
                    console.log('Kayıt Başarılı:', successData);

                    displayMessage('Kayıt başarılı!', false); 

                    setTimeout(() => {
                        window.location.reload();
                    }, 50000000000000000000); 

                }

            } catch (error) {
                console.error('Kayıt işlemi sırasında beklenmeyen bir hata oluştu:', error);
                displayMessage('Kayıt yapılırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
                 passwordInput.value = '';
                 confirmPasswordInput.value = '';
            } finally {
            }
        });

    } else {

        console.error("Kayıt formu (ID='registerForm') veya gerekli inputlar (username, email, password, confirm-password) sayfada bulunamadı. Lütfen HTML'inizi kontrol edin.");
         displayMessage('Form yüklenirken bir hata oluştu. Lütfen sayfa yöneticisi ile iletişime geçin.', true);
    }




}); 