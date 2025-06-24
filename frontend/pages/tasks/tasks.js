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

    const gorevlerimLink = document.querySelector('nav a');

    if (gorevlerimLink) {
        gorevlerimLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            console.log('"Görevlerim" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');
            window.location.href = 'index.html'; 
        });
    }

    
    const gorevEkleLink = document.querySelector('.navbar-center a:nth-child(2)'); 

    if (gorevEkleLink) {
        gorevEkleLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            console.log('"Görev ekle" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');
            window.location.href = '../addTasks/index.html'; 
        });
    }

    async function fetchAndRenderUsers() {
        const backendUsersEndpoint = 'http://localhost:3000/api/users/in-my-group';
        const authToken = localStorage.getItem('authToken'); 
        const loggedInUserString = localStorage.getItem('user'); 
        let currentUser = null; 

        const adminUsersListDiv = document.getElementById('adminUsersList');
        const regularUsersListDiv = document.getElementById('regularUsersList');

        if (!adminUsersListDiv || !regularUsersListDiv) {
            console.error('Kullanıcı listeleme divleri bulunamadı!');
            return;
        }

        adminUsersListDiv.querySelector('p')?.remove();
        adminUsersListDiv.querySelector('ul')?.remove(); 
        regularUsersListDiv.querySelector('p')?.remove(); 
        regularUsersListDiv.querySelector('ul')?.remove(); 

        if (!loggedInUserString) {
            console.error('Giriş yapmış kullanıcı bilgisi bulunamadı!');
            adminUsersListDiv.innerHTML += '<p style="color: red;">Giriş yapmış kullanıcı bilgisi bulunamadı.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Giriş yapmış kullanıcı bilgisi bulunamadı.</p>';
            return;
        }

        try {
            currentUser = JSON.parse(loggedInUserString); 
        } catch (e) {
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
            adminUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcı bilgisi yüklenemedi.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcı bilgisi yüklenemedi.</p>';
            return;
        }

        const userGroupId = currentUser.group_id; 

        if (userGroupId === null || userGroupId === 1) { 
            adminUsersListDiv.innerHTML += '<p>Bir gruba atanmamışsınız.</p>';
            regularUsersListDiv.innerHTML += '<p>Bir gruba atanmamışsınız.</p>';
            console.log('Kullanıcı bir gruba atanmamış (group_id: null veya 1). Grup üyeleri listelenmeyecek.');
            return; 
        }

        if (!authToken) {
            console.log('Kullanıcıları çekmek için yetkilendirme token\'ı yok.');
            adminUsersListDiv.innerHTML += '<p style="color: red;">Yetkilendirme gerekli.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Yetkilendirme gerekli.</p>';
            return;
        }

        try {
            const response = await fetch(backendUsersEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}` 
                },
            });

            if (!response.ok) {
                let errorMessage = `Kullanıcıları çekerken HTTP hata! Durum: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Kullanıcı hata cevabını JSON okurken hata:', e);
                }
                throw new Error(errorMessage);
            }

            const users = await response.json(); 

            console.log('--- Grup Bilgileri ---');
            console.log('Kullanıcının Grup ID\'si:', userGroupId);
            console.log('Bu Gruptaki Kullanıcılar:', users);
            console.log('------------------------');

            console.log('Grup kullanıcıları çekildi:', users);

            const adminUl = document.createElement('ul');
            const regularUl = document.createElement('ul');

            const adminListContainer = adminUsersListDiv.querySelector('.user-list1');
            const regularListContainer = regularUsersListDiv.querySelector('.user-list1');

            if (adminListContainer) {
                adminListContainer.appendChild(adminUl); 
            } else {
                adminUsersListDiv.appendChild(adminUl);
                console.warn('.user-list1 divi adminUsersListDiv içinde bulunamadı, ul doğrudan ana div\'e eklendi.');
            }

            if (regularListContainer) {
                regularListContainer.appendChild(regularUl); 
            } else {
                regularUsersListDiv.appendChild(regularUl);
                console.warn('.user-list1 divi regularUsersListDiv içinde bulunamadı, ul doğrudan ana div\'e eklendi.');
            }


            if (users.length === 0) {
                adminUl.innerHTML = '<li>Bu grupta hiç admin kullanıcı yok.</li>';
                regularUl.innerHTML = '<li>Bu grupta hiç normal kullanıcı yok.</li>';
                return;
            }

            users.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `<span class="username">${user.username}</span> ${user.email ? `<span>(${user.email})</span>` : ''}`;

                if (user.role === 'admin') {
                    adminUl.appendChild(li);
                } else {
                    regularUl.appendChild(li);
                }
            });

            if (adminUl.children.length === 0) {
                adminUl.innerHTML = '<li>Bu grupta hiç admin kullanıcı yok.</li>';
            }
            if (regularUl.children.length === 0) {
                regularUl.innerHTML = '<li>Bu grupta hiç normal kullanıcı yok.</li>';
            }

        } catch (error) {
            console.error('Kullanıcıları çekerken bir hata oluştu:', error);
            adminUsersListDiv.querySelector('p')?.remove();
            adminUsersListDiv.querySelector('ul')?.remove();
            regularUsersListDiv.querySelector('p')?.remove();
            regularUsersListDiv.querySelector('ul')?.remove();

            adminUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcılar yüklenemedi.</p>';
            regularUsersListDiv.innerHTML += '<p style="color: red;">Kullanıcılar yüklenemedi.</p>';
        }
    }

    fetchAndRenderUsers();

    const authToken = localStorage.getItem('authToken'); 
    const loggedInUserString = localStorage.getItem('user'); 
    let currentUser = null; 
    if (!authToken || !loggedInUserString) {
        console.log('Yetkilendirme token\'ı veya kullanıcı bilgisi bulunamadı. Login sayfasına yönlendiriliyor...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '../auth/login/index.html'; 

    try {
        currentUser = JSON.parse(loggedInUserString); // localStorage'dan alınan kullanıcı bilgisini JavaScript objesine çevir
        console.log('Tamamlanmamış Görevler Sayfası Yüklendi. Giriş Yapılan Kullanıcı:', currentUser);


    } catch (e) {
        console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '../auth/login/index.html'; 
        return;
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



    async function fetchAndRenderIncompleteTasks() {
        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; 
        const incompleteTaskListDiv = document.getElementById('incompleteTaskList'); 

        if (!incompleteTaskListDiv) {
            console.error('incompleteTaskList elementi (ID="incompleteTaskList") sayfada bulunamadı!');
            return;
        }

        incompleteTaskListDiv.innerHTML = '<p>Tamamlanmamış görevler yükleniyor...</p>';


        try {
            console.log('Backendden tüm görevler çekiliyor (Tamamlanmamışlar için)...');
            const response = await fetch(backendTasksEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}` 
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.log('Yetkilendirme hatası (fetch). Lütfen tekrar giriş yapın.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '../auth/login/index.html'; 
                    return;
                }
                let errorMessage = `HTTP hata! Durum: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Hata cevabını JSON okurken hata:', e);
                }
                throw new Error(errorMessage);
            }

            const allTasks = await response.json();
            console.log('Backendden Tüm Görevler Çekildi:', allTasks);

            const incompleteTasks = allTasks.filter(task => !task.completed); 
            console.log('Filtrelenmiş Tamamlanmamış Görevler:', incompleteTasks);


            renderTasks(incompleteTasks);

        } catch (error) {
            console.error('Tamamlanmamış görevleri çekerken bir hata oluştu:', error);
            incompleteTaskListDiv.innerHTML = '<p style="color: red;">Görevler yüklenemedi. Lütfen tekrar deneyin.</p>'; // Kullanıcıya hata mesajı göster
        }
    }

    function renderTasks(tasks) {
        const incompleteTaskListDiv = document.getElementById('incompleteTaskList');
        if (!incompleteTaskListDiv) return;


        incompleteTaskListDiv.innerHTML = ''; 

        if (tasks.length === 0) {
            incompleteTaskListDiv.innerHTML = '<p>Hiç tamamlanmamış göreviniz yok. Harika!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card');
            taskCard.dataset.taskId = task.id;

            taskCard.innerHTML = `
                <div class="details">
                    <h3>${task.title}</h3> ${task.description ? `<p>${task.description}</p>` : ''} <span class="due-date">Bitiş: ${task.due_date || 'Belirtilmemiş'}</span> <span class="status">Durum: Devam Ediyor</span> </div>
                    <div class="actions">
                        <button class="complete-button">Tamamla</button>
                        <button class="delete-button">Sil</button>
                    </div>
                `;
            incompleteTaskListDiv.appendChild(taskCard);
        });

        incompleteTaskListDiv.addEventListener('click', async function(event) {
            const target = event.target;
            const taskCard = target.closest('.task-card');

            if (!taskCard) return;

            const taskId = taskCard.dataset.taskId;

            if (target.classList.contains('complete-button')) {
                console.log(`Tamamlanmamış Görev ID ${taskId} Tamamlama Butonuna Tıklandı.`);
                const backendUpdateTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`;
                const authToken = localStorage.getItem('authToken');

                if (!authToken) {
                    console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                    localStorage.removeItem('user');
                    window.location.href = '../auth/login/index.html';
                    return;
                }

                try {
                    console.log(`Görev ID ${taskId} tamamlandı olarak güncelleniyor.`);
                    const response = await fetch(backendUpdateTaskEndpoint, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            completed: true
                        }),
                    });

                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                            localStorage.removeItem('authToken');
                            localStorage.removeItem('user');
                            window.location.href = '../auth/login/index.html';
                            return;
                        }
                        let errorMessage = `HTTP hata! Durum: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.message || errorMessage;
                        } catch (e) {
                            console.error('Hata cevabını JSON okurken hata:', e);
                        }
                        throw new Error(errorMessage);
                    }

                    console.log('Görev Durumu Backendde Başarıyla Güncellendi. Arayüzden kaldırılıyor.');
                    taskCard.remove(); 

                } catch (error) {
                    console.error('Görev tamamlarken (güncellerken) bir hata oluştu:', error);
                    alert('Görev durumu güncellenemedi. Lütfen tekrar deneyin.');
                }
            }

         
            else if (target.classList.contains('delete-button')) {
                console.log(`Tamamlanmamış Görev ID ${taskId} Silme Butonuna Tıklandı.`);
                if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) { // Silme onayı
                    const backendDeleteTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`;
                    const authToken = localStorage.getItem('authToken');

                    if (!authToken) {
                        console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                        localStorage.removeItem('user');
                        window.location.href = '../auth/login/index.html';
                        return;
                    }

                    try {
                        console.log(`Görev ID ${taskId} backend'den siliniyor.`);
                        const response = await fetch(backendDeleteTaskEndpoint, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                            },
                        });

                        if (!response.ok) {
                            if (response.status === 401 || response.status === 403) {
                                console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('user');
                                window.location.href = '../auth/login/index.html';
                                return;
                            }
                            let errorMessage = `HTTP hata! Durum: ${response.status}`;
                            try {
                                const errorData = await response.json();
                                errorMessage = errorData.message || errorMessage;
                            } catch (e) {
                                console.error('Hata cevabını okurken hata:', e);
                            }
                            throw new Error(errorMessage);
                        }

                        console.log(`Görev ID ${taskId} arayüzden kaldırılıyor.`);
                        taskCard.remove(); 

                    } catch (error) {
                        console.error('Görevi silerken bir hata oluştu:', error);
                        alert('Görevi silinirken bir hata oluştu. Lütfen tekrar deneyin.');
                    }
                }
            }
           

        }); 
    } 


   
    fetchAndRenderIncompleteTasks();


}});
 