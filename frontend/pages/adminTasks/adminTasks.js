document.addEventListener('DOMContentLoaded', function() {
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
    if (teamNavLink) {
    teamNavLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.location.href = '../adminTeam/index.html'; 
    });
}

if (assignTaskNavLink) {
    assignTaskNavLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        window.location.href = '../adminTasks/index.html'; 
    });
}
    
    const addTaskForm = document.getElementById('addTaskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const assignedToSelect = document.getElementById('assignedTo'); 
    const formMessage = document.getElementById('formMessage'); 

    const authToken = localStorage.getItem('authToken');
    const loggedInUserString = localStorage.getItem('user');
    let currentUser = null;

    async function checkAuthAndAdminStatus() {
        if (!authToken || !loggedInUserString) {
            console.log('Yetkilendirme token\'ı veya kullanıcı bilgisi bulunamadı. Login sayfasına yönlendiriliyor...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html'; 
            return false;
        }

        try {
            currentUser = JSON.parse(loggedInUserString);
            console.log('Admin Paneli Yüklendi. Giriş Yapılan Kullanıcı:', currentUser);

            if (currentUser.role !== 'admin') { 
                alert('Bu sayfaya erişim yetkiniz yok. Yönetici değilsiniz.');
                window.location.href = '../tasks/index.html'; 
                return false;
            }
            return true; 
        } catch (e) {
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html';
            return false;
        }
    }

    
    async function fetchTeamMembersForDropdown() {
        if (!authToken || !currentUser) return;

        const backendUsersEndpoint = 'http://localhost:3000/api/users/in-my-group';
        assignedToSelect.innerHTML = '<option value="">Yükleniyor...</option>'; 

        try {
            const response = await fetch(backendUsersEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP hata! Durum: ${response.status}`);
            }

            const users = await response.json();
            assignedToSelect.innerHTML = '<option value="">Üye Seçiniz</option>';

            const teamMembers = users.filter(user => user.group_id === currentUser.group_id && user.role !== 'admin');

            if (teamMembers.length === 0) {
                assignedToSelect.innerHTML = '<option value="">Takımınızda atanabilir üye yok.</option>';
                assignedToSelect.disabled = true; 
                return;
            }

            teamMembers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id; 
                option.textContent = `${user.username} (${user.email})`;
                assignedToSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Takım üyeleri çekilirken hata:', error);
            assignedToSelect.innerHTML = '<option value="">Üyeler yüklenemedi.</option>';
            assignedToSelect.disabled = true;
            showMessage('Üyeler yüklenemedi. Lütfen tekrar deneyin.', 'error');
        }
    }

    addTaskForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const title = taskTitleInput.value.trim();
        const description = taskDescriptionInput.value.trim();
        const dueDate = taskDueDateInput.value;
        const selectedUserId = assignedToSelect.value; 

        if (!title || !selectedUserId) {
            showMessage('Lütfen görev başlığını girin ve bir üye seçin.', 'error');
            return;
        }

        if (!authToken) {
            showMessage('Yetkilendirme hatası. Lütfen giriş yapın.', 'error');
            setTimeout(() => window.location.href = '../auth/login/index.html', 1500);
            return;
        }

        const taskData = {
            title: title,
            description: description || null, 
            due_date: dueDate || null, 
            user_id: parseInt(selectedUserId), 
            created_by: currentUser.id, 
            group_id: currentUser.group_id
        };

        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; 

        try {
            const response = await fetch(backendTasksEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    showMessage('Yetkilendirme hatası. Lütfen tekrar giriş yapın.', 'error');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    setTimeout(() => window.location.href = '../auth/login/index.html', 1500);
                    return;
                }
                throw new Error(errorData.message || `Görev eklenirken HTTP hata! Durum: ${response.status}`);
            }

            const newTask = await response.json();
            console.log('Yeni görev başarıyla atandı:', newTask);
            showMessage('Görev başarıyla atandı!', 'success');
            addTaskForm.reset(); 
            taskDescriptionInput.value = ''; 
            assignedToSelect.value = ''; 
        } catch (error) {
            console.error('Görev atarken bir hata oluştu:', error);
            showMessage(`Görev atanamadı: ${error.message}`, 'error');
        }
    });

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `message ${type}`; 
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'message';
        }, 3000); 
    }

    const gorevlerimLink = document.querySelector('nav a[href="../tasks/index.html"]');
    if (gorevlerimLink) {
        gorevlerimLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../tasks/index.html';
        });
    }

    const incompleteTasksLink = document.querySelector('nav a[href="../incomplete-tasks/index.html"]');
    if (incompleteTasksLink) {
        incompleteTasksLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../incomplete-tasks/index.html';
        });
    }
    
    const appLogo = document.querySelector('.app-logo');
    if (appLogo) {
        appLogo.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../tasks/index.html'; 
        });
    }

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Çıkış yapılıyor...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html';
        });
    }

    async function initPage() {
        const isAdmin = await checkAuthAndAdminStatus();
        if (isAdmin) {
            await fetchTeamMembersForDropdown(); 
        }
    }

    initPage(); 
});