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

            window.location.href = '../tasks/index.html'; 
        });
    }

    const gorevEkleLink = document.querySelector('.navbar-center a:nth-child(2)'); 
    if (gorevEkleLink) {
        gorevEkleLink.addEventListener('click', function(event) {
            event.preventDefault(); 

            console.log('"Görev ekle" linkine tıklandı. Tüm Görevler sayfasına yönlendiriliyor...');

            window.location.href = 'index.html'; 

        });
    }

    const loggedInUserString = localStorage.getItem('user');

    if (loggedInUserString) {
        try {
            const user = JSON.parse(loggedInUserString);

            console.log('Dashboard Yüklendi. Giriş Yapılan Kullanıcı:', user);

        } catch (e) {
            console.error('localStorage\'dan kullanıcı bilgisi okunurken veya parse edilirken hata oluştu:', e);
        }
    } else {
        console.log('localStorage\'da giriş yapmış kullanıcı bilgisi bulunamadı. Yetkilendirme gereklidir.');
        console.log('Login sayfasına yönlendiriliyor...');
        window.location.href = '../../auth/login/index.html';
    }

    async function fetchTasks() { 
        const backendTasksEndpoint = 'http://localhost:3000/api/tasks'; 

        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
             localStorage.removeItem('user');
            window.location.href = '../../auth/login/index.html'; 
            return; 
        }

        try {
            console.log('Backendden görevler çekiliyor...');
            const response = await fetch(backendTasksEndpoint, {
                method: 'GET', 
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
            });

            if (!response.ok) {
                if(response.status === 401 || response.status === 403) {
                    console.log('Yetkilendirme hatası. Token geçersiz veya süresi dolmuş. Lütfen tekrar giriş yapın.');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    window.location.href = '../../auth/login/index.html';
                    return; 
                }

                let errorMessage = `HTTP hata! Durum: ${response.status}`;
                try {
                    
                     const errorData = await response.json();
                     errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    
                     console.error('Hata cevabını JSON olarak okunamadı:', e);
                }
                throw new Error(errorMessage);
            }

            const tasks = await response.json();

            console.log('Backendden Görevler Başarıyla Çekildi:', tasks);

            renderTasks(tasks);

        } catch (error) {
            console.error('Görevleri çekerken bir hata oluştu:', error);
        }
    }

    function renderTasks(tasks) {
        const taskListDiv = document.getElementById('taskList');
        if (!taskListDiv) {
            console.error('taskList elementi (ID="taskList") sayfada bulunamadı!');
            return; 
        }

        taskListDiv.innerHTML = ''; 

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item'); 

            if (task.completed) {
                taskItem.classList.add('completed');
            }
            taskItem.dataset.taskId = task.id;

            taskItem.innerHTML = `
                <div>
                    <h3>${task.title}</h3> ${task.description ? `<p>${task.description}</p>` : ''} <span class="due-date">Bitiş: ${task.due_date || 'Belirtilmemiş'}</span> <span class="status">Durum: ${task.completed ? 'Tamamlandı' : 'Devam Ediyor'}</span> </div>
                <div class="task-actions">
                    <button class="complete-button">${task.completed ? 'Geri Al' : 'Tamamla'}</button>
                    <button class="delete-button">Sil</button>
                     </div>
            `;
            taskListDiv.appendChild(taskItem);
        });
    }

    fetchTasks();


const addTaskForm = document.getElementById('addTaskForm'); 

if (addTaskForm) { 
    addTaskForm.addEventListener('submit', async function(event) { 
        event.preventDefault(); 

        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const dueDateInput = document.getElementById('taskDueDate');

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const dueDate = dueDateInput.value; 
        if (!title) {
            alert('Görev başlığı boş olamaz!'); 
            return; 
        }

        const currentUser = JSON.parse(localStorage.getItem('user'));
        
        if (!currentUser || !currentUser.id || !currentUser.group_id) {
            console.error('Kullanıcı bilgileri eksik veya geçersiz. Lütfen tekrar giriş yapın.');
            alert('Kullanıcı bilgileri bulunamadı. Lütfen tekrar giriş yapın.');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html'; 
            return;
        }

        const newTask = {
            title: title,
            description: description,
            due_date: dueDate || null, 
            user_id: currentUser.id,     
            created_by: currentUser.id,   
            group_id: currentUser.group_id 
        };

        const backendAddTaskEndpoint = 'http://localhost:3000/api/tasks';

        const authToken = localStorage.getItem('authToken'); 

        if (!authToken) {
            console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
            localStorage.removeItem('user');
            window.location.href = '../auth/login/index.html';
            return;
        }

        try {
            console.log('Yeni görev backend\'e gönderiliyor:', newTask);
            
            const response = await fetch(backendAddTaskEndpoint, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(newTask), 
            });

            if (!response.ok) {
                if(response.status === 401 || response.status === 403) {
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
                    errorMessage = `Sunucudan hata alındı ancak detay okunamadı. Durum: ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const addedTask = await response.json();
            console.log('Yeni Görev Backendde Başarıyla Eklendi:', addedTask);

            addTaskForm.reset();
            alert('Görev başarıyla eklendi!'); 
            if (typeof fetchTasks === 'function') {
                fetchTasks(); 
            } else {
                console.warn('fetchTasks fonksiyonu bulunamadı. Görev listesini manuel yenilemeniz gerekebilir.');
            }

        } catch (error) {
            console.error('Görev eklerken bir hata oluştu:', error);
            alert('Görev eklenirken bir hata oluştu: ' + error.message); 
        } finally {
        }
    });
}


    
    const taskListDiv = document.getElementById('taskList'); 
    if (taskListDiv) { 
         taskListDiv.addEventListener('click', async function(event) { 
            const target = event.target; 

            const taskItem = target.closest('.task-item');

            if (!taskItem) return;

            const taskId = taskItem.dataset.taskId;


            if (target.classList.contains('complete-button')) {
                console.log(`Görev ID ${taskId} Tamamlama/Durum Değiştirme Butonuna Tıklandı.`);
                const isCompleted = taskItem.classList.contains('completed');

                const backendUpdateTaskEndpoint = `http://localhost:3000/api/tasks/${taskId}`; // ID URL'e eklenir

                const authToken = localStorage.getItem('authToken');

                 if (!authToken) {
                     console.log('Yetkilendirme token\'ı bulunamadı. Login sayfasına yönlendiriliyor...');
                     localStorage.removeItem('user');
                     window.location.href = '../auth/login/index.html'; // <<< Kendi login sayfanızın doğru yolunu yazın
                     return;
                 }

                try {
                     console.log(`Görev ID ${taskId} durumu güncelleniyor. Yeni durum: ${!isCompleted}`);
                    const response = await fetch(backendUpdateTaskEndpoint, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`, 
                        },
                        body: JSON.stringify({ completed: !isCompleted }), 
                    });

                    if (!response.ok) {
                         if(response.status === 401 || response.status === 403) {
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
                         } catch (e) { console.error('Hata cevabını JSON okurken hata:', e); }
                         throw new Error(errorMessage);
                    }

                    const updatedTask = await response.json();
                    console.log('Görev Durumu Backendde Başarıyla Güncellendi:', updatedTask);

                    taskItem.classList.toggle('completed');
                    target.textContent = taskItem.classList.contains('completed') ? 'Geri Al' : 'Tamamla';

                    const statusElement = taskItem.querySelector('.status');
                    if (statusElement) {
                        statusElement.textContent = `Durum: ${updatedTask.completed ? 'Tamamlandı' : 'Devam Ediyor'}`;
                    }


                } catch (error) {
                    console.error('Görev durumunu güncellerken bir hata oluştu:', error);
                    alert('Görev durumu güncellenemedi. Lütfen tekrar deneyin.'); 
                }
            }

            else if (target.classList.contains('delete-button')) {
                 console.log(`Görev ID ${taskId} Silme Butonuna Tıklandı.`);
                 if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
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
                             if(response.status === 401 || response.status === 403) {
                                 console.log('Yetkilendirme hatası. Lütfen tekrar giriş yapın.');
                                 localStorage.removeItem('authToken');
                                 localStorage.removeItem('user');
                                 window.location.href = '../../auth/login/index.html'; 
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
                        taskItem.remove(); 


                    } catch (error) {
                        console.error('Görevi silerken bir hata oluştu:', error);
                        alert('Görev silinirken bir hata oluştu. Lütfen tekrar deneyin.'); 
                    }
                 }
            }
        });
    }   
}); 