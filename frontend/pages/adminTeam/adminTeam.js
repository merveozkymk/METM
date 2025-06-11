// frontend/pages/adminTeam/adminTeam.js

document.addEventListener('DOMContentLoaded', async () => {
    const currentGroupMembersList = document.getElementById('currentGroupMembers');
    const logoutLink = document.getElementById('logoutLink');
    const usernameToAddInput = document.getElementById('usernameToAddInput'); 
    const addUserToTeamBtn = document.getElementById('addUserToTeamBtn'); 
    const addStatusMessage = document.getElementById('addStatusMessage'); 

    // Yeni eklenen navbar bağlantıları için elementleri al
    const teamNavLink = document.getElementById('teamNavLink'); // Takım bağlantısı
    const assignTaskNavLink = document.getElementById('assignTaskNavLink'); // Görev Ata bağlantısı

    // Kullanıcı dropdown menüsü işlevselliği
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function(event) {
            event.stopPropagation(); 
            userDropdown.classList.toggle('open'); 
        });
        document.addEventListener('click', function(event) {
            const isClickInsideDropdown = userDropdown.contains(event.target);
            if (!isClickInsideDropdown && userDropdown.classList.contains('open')) {
                userDropdown.classList.remove('open');
            }
        });
    }

    // Kullanıcının kimlik bilgilerini ve token'ı localStorage'dan al
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken'); 

    if (!currentUser || !token) {
        alert('Oturumunuz sona erdi veya yetkiniz yok. Lütfen tekrar giriş yapın.');
        window.location.href = '../auth/login/index.html';
        return; 
    }

    if (currentUser.role !== 'admin') {
        alert('Bu sayfaya erişim yetkiniz bulunmamaktadır.');
        window.location.href = '../dashboard/index.html'; 
        return; 
    }
    
    // Çıkış yap linkine tıklama olayı
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken'); 
            localStorage.removeItem('user'); 
            window.location.href = '../auth/login/index.html'; 
        });
    }

    // --- Yeni Navigasyon Linkleri Olay Dinleyicileri ---
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
    // --- Navigasyon Linkleri Olay Dinleyicileri Sonu ---

    /**
     * API'ye güvenli bir şekilde veri çekme/gönderme fonksiyonu.
     * Yetkilendirme token'ını otomatik olarak ekler ve hata yönetimini sağlar.
     * @param {string} url - API endpoint URL'i
     * @param {string} method - HTTP metodu (GET, POST, PUT, PATCH, DELETE)
     * @param {object} body - İstek gövdesi (POST/PUT/PATCH için)
     * @returns {Promise<object|null>} API'den gelen veri veya hata durumunda null
     */
    async function fetchData(url, method = 'GET', body = null) {
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            };

            const options = {
                method: method,
                headers: headers,
                body: body ? JSON.stringify(body) : null
            };

            const response = await fetch(url, options);

            if (response.status === 401 || response.status === 403) {
                alert('Oturum süreniz doldu veya bu işlemi yapmaya yetkiniz yok. Lütfen tekrar giriş yapın.');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = '../auth/login/index.html';
                return null; 
            }

            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(errorData.message || 'Bir hata oluştu.');
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            } else {
                return {}; 
            }
        } catch (error) {
            console.error(`Fetch hatası (${url}):`, error);
            alert(`Veri çekilirken hata: ${error.message}`);
            return null; 
        }
    }

    /**
     * Giriş yapmış admin kullanıcının kendi grubundaki üyeleri backend'den çeker ve listeler.
     */
    async function fetchCurrentGroupMembers() {
        currentGroupMembersList.innerHTML = `
            <div class="user-list-header"><h4>Takım Yöneticileri</h4></div>
            <div id="adminUsers"></div>
            <div class="user-list-header"><h4>Takım Üyeleri</h4></div>
            <div id="regularUsers"></div>
        `;
        const adminUsersDiv = document.getElementById('adminUsers');
        const regularUsersDiv = document.getElementById('regularUsers');

        const groupId = currentUser.group_id; 

        if (!groupId || groupId === 1) { 
            currentGroupMembersList.innerHTML = '<p style="padding: 10px; text-align: center; color: #555;">Yönetici olarak henüz bir takıma atanmadınız. Lütfen bir yönetici tarafından bir takıma atanın veya yeni bir takım oluşturun.</p>';
            return;
        }

        const data = await fetchData('http://localhost:3000/api/users/in-my-group'); 

        if (data && data.length > 0) {
            const admins = data.filter(user => user.role === 'admin');
            const regulars = data.filter(user => user.role === 'user');

            adminUsersDiv.innerHTML = ''; 
            if (admins.length > 0) {
                admins.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.classList.add('user-item');
                    userItem.innerHTML = `
                        <span class="user-role admin"></span> 
                        <span>${user.username} (${user.email})</span>
                    `;
                    adminUsersDiv.appendChild(userItem);
                });
            } else {
                adminUsersDiv.innerHTML = '<p>Bu grupta yönetici bulunmuyor.</p>';
            }

            regularUsersDiv.innerHTML = ''; 
            if (regulars.length > 0) {
                regulars.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.classList.add('user-item');
                    userItem.innerHTML = `
                        <span class="user-role"></span> 
                        <span>${user.username} (${user.email})</span>
                    `;
                    regularUsersDiv.appendChild(userItem);
                });
            } else {
                regularUsersDiv.innerHTML = '<p>Bu grupta üye bulunmuyor.</p>';
            }

        } else {
            currentGroupMembersList.innerHTML = '<p style="padding: 10px; text-align: center; color: #555;">Takımınızda henüz hiç üye yok veya veri çekilemedi.</p>';
        }
    }

    /**
     * Kullanıcının girdiği kullanıcı adını/e-postasını kullanarak takımsız bir kullanıcıyı bulur ve takıma atar.
     */
    async function handleAddUserToTeamByUsername() {
        const identifier = usernameToAddInput.value.trim(); 
        addStatusMessage.textContent = ''; 
        addStatusMessage.classList.remove('show'); // Mesajı gizle

        if (!identifier) {
            addStatusMessage.textContent = 'Lütfen eklenecek kullanıcının adını veya e-postasını girin.';
            addStatusMessage.style.color = 'orange';
            addStatusMessage.classList.add('show');
            return;
        }

        const currentAdminGroupId = currentUser.group_id;

        if (!currentAdminGroupId || currentAdminGroupId === 1) {
            addStatusMessage.textContent = 'Yönetici olarak bir takıma atanmadınız. Kullanıcı ekleyemezsiniz.';
            addStatusMessage.style.color = 'red';
            addStatusMessage.classList.add('show');
            return;
        }

        try {
            const searchResult = await fetchData(`http://localhost:3000/api/users/find-unassigned?identifier=${encodeURIComponent(identifier)}`);

            if (!searchResult || searchResult.length === 0) {
                addStatusMessage.textContent = `"${identifier}" adında/e-postasında takımsız bir kullanıcı bulunamadı.`;
                addStatusMessage.style.color = 'red';
                addStatusMessage.classList.add('show');
                return;
            }

            const userToAssign = searchResult[0];

            if (userToAssign.group_id !== 1) {
                addStatusMessage.textContent = `${userToAssign.username} kullanıcısı zaten bir takıma atanmış. (Mevcut Grup ID: ${userToAssign.group_id})`;
                addStatusMessage.style.color = 'orange';
                addStatusMessage.classList.add('show');
                return;
            }

            const confirmAdd = confirm(`"${userToAssign.username}" kullanıcısını kendi takımınıza eklemek istediğinizden emin misiniz?`);
            if (!confirmAdd) {
                addStatusMessage.textContent = 'Kullanıcı ekleme işlemi iptal edildi.';
                addStatusMessage.style.color = 'gray';
                addStatusMessage.classList.add('show');
                return; 
            }

            const assignResult = await fetchData(
                `http://localhost:3000/api/users/${userToAssign.id}/group`, 
                'PATCH', 
                { group_id: currentAdminGroupId }
            );

            if (assignResult) {
                addStatusMessage.textContent = `${userToAssign.username} kullanıcısı başarıyla takımınıza eklendi!`;
                addStatusMessage.style.color = 'green';
                addStatusMessage.classList.add('show');
                usernameToAddInput.value = ''; 
                fetchCurrentGroupMembers(); 
            } else {
                addStatusMessage.textContent = `Kullanıcı takıma eklenirken bir hata oluştu.`;
                addStatusMessage.style.color = 'red';
                addStatusMessage.classList.add('show');
            }

        } catch (error) {
            console.error('Kullanıcı ekleme işlemi sırasında hata:', error);
            addStatusMessage.textContent = `Hata: ${error.message}`;
            addStatusMessage.style.color = 'red';
            addStatusMessage.classList.add('show');
        } finally {
            // Mesajı belli bir süre sonra gizle
            setTimeout(() => {
                addStatusMessage.classList.remove('show');
                addStatusMessage.textContent = '';
            }, 5000); // 5 saniye sonra gizle
        }
    }

    // Olay dinleyicileri
    addUserToTeamBtn.addEventListener('click', handleAddUserToTeamByUsername);

    // Sayfa yüklendiğinde mevcut takım üyelerini getir
    fetchCurrentGroupMembers();
});