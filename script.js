// Allgemeine, seitenübergreifende Logik (User-Menü, Logout)
import { auth } from './js/firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


function showMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('open');
}

const avatarButton = document.querySelector('.user-avatar');
if (avatarButton) {
    avatarButton.addEventListener('click', showMenu);
}


function logout() {
    const logoutButton = document.getElementById('logout-button');
    logoutButton.disabled = true;
    signOut(auth)
        .then(() => {
            window.location.replace("../index.html");
        })
        .catch((error) => {
            console.log(error);
            logoutButton.disabled = false;

        });
}


const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', logout)
}