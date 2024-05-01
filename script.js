document.addEventListener("DOMContentLoaded", function () {
    let db;

    const request = indexedDB.open("userDatabase", 1);

    request.onerror = function (event) {
        console.error("Ошибка при открытии базы данных:", event.target.errorCode);
    };

    request.onsuccess = function (event) {
        db = event.target.result;
        displayUsers();
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
        objectStore.createIndex("fullName", "fullName", { unique: false });
        objectStore.createIndex("description", "description", { unique: false });
    };

    function addUser(fullName, description) {
        const transaction = db.transaction(["users"], "readwrite");
        const objectStore = transaction.objectStore("users");
        const newUser = { fullName, description };

        const request = objectStore.add(newUser);
        request.onsuccess = function () {
            displayUsers();
        };
        request.onerror = function (event) {
            console.error("Ошибка при добавлении пользователя:", event.target.errorCode);
        };
    }

    function displayUsers() {
        const transaction = db.transaction(["users"], "readonly");
        const objectStore = transaction.objectStore("users");
        const userList = document.getElementById("userList");
    
        userList.innerHTML = "";
    
        objectStore.openCursor().onsuccess = function (event) {
            const cursor = event.target.result;
            if (cursor) {
                const li = document.createElement("li");
                li.textContent = `ФИО: ${cursor.value.fullName}, Описание: ${cursor.value.description}`;
    
                // Создание кнопки удаления с использованием замыкания для передачи ключа
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Удалить";
                deleteBtn.addEventListener("click", (function(key) {
                    return function() {
                        deleteUser(key);
                    };
                })(cursor.key)); // передача ключа через замыкание
    
                li.appendChild(deleteBtn);
                userList.appendChild(li);
                cursor.continue();
            }
        };
    }

    function deleteUser(id) {
        const transaction = db.transaction(["users"], "readwrite");
        const objectStore = transaction.objectStore("users");
        const request = objectStore.delete(id);
        request.onsuccess = function () {
            displayUsers();
        };
        request.onerror = function (event) {
            console.error("Ошибка при удалении пользователя:", event.target.errorCode);
        };
    }

    document.getElementById("addForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const fullName = document.getElementById("fullName").value;
        const description = document.getElementById("description").value;

        addUser(fullName, description);

        document.getElementById("fullName").value = "";
        document.getElementById("description").value = "";
    });
});