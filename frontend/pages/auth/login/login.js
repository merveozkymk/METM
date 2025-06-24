document.addEventListener('DOMContentLoaded', function() {

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email'); 
    const passwordInput = document.getElementById('password'); 
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


    if (loginForm && emailInput && passwordInput) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            displayMessage('', false); 

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email) {
                displayMessage('Lütfen e-posta adresinizi girin.');
                return; 
            }
            if (!password) {
                displayMessage('Lütfen şifrenizi girin.');
                return; 
            }
            if (!email.includes('@') || !email.includes('.')) {
                 displayMessage('Lütfen geçerli bir e-posta adresi girin.');
                 return; 
            }


            try {
                const backendLoginEndpoint = 'http://localhost:3000/api/auth/login'; 

                const response = await fetch(backendLoginEndpoint, {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email, password: password }),
                });

                if (!response.ok) { 
                    let errorMessage = 'Giriş başarısız oldu.'; 
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        console.error('Backend hata cevabını JSON olarak okunamadı:', e);
                        errorMessage = `Sunucu hatası (${response.status}). Lütfen daha sonra tekrar deneyin.`;
                    }
                    displayMessage(errorMessage);

                    passwordInput.value = '';


                } else { 
                    const successData = await response.json();
                    console.log('Giriş Başarılı:', successData);

                    if (successData.token) {
                         localStorage.setItem('authToken', successData.token);
                         console.log('Auth Token Local Storage\'a Kaydedildi.');
                         if(successData.user) {
                             localStorage.setItem('user', JSON.stringify(successData.user));
                             console.log('Kullanıcı Bilgileri Local Storage\'a Kaydedildi.');
                         }
                    }

                    if (successData.user && successData.user.role === 'admin') {
                        console.log('Admin rolünde kullanıcı, adminTasks sayfasına yönlendiriliyor.');
                        window.location.href = '../../adminTeam/index.html'; 
                    }else {
                        console.log('Normal kullanıcı, tasks sayfasına yönlendiriliyor.');
                        window.location.href = '../../tasks/index.html'; 
                    }

                }

            } catch (error) {
                console.error('Giriş işlemi sırasında beklenmeyen bir hata oluştu:', error);
                displayMessage('Giriş yapılırken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
                 passwordInput.value = '';
            } finally {
            }
        });

    } else {
        console.error("Login formu (ID='loginForm') veya gerekli inputlar (email, password) sayfada bulunamadı. Lütfen HTML'inizi kontrol edin.");
         displayMessage('Form yüklenirken bir hata oluştu. Lütfen sayfa yöneticisi ile iletişime geçin.', true);
    }


}); 