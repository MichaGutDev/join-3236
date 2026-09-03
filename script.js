// Allgemeine, seitenübergreifende Logik (User-Menü, Logout)
import { auth } from './js/firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/**
 * Toggles the visibility of the user menu when the avatar is clicked. 
 */
function showMenu() {
    const userMenu = document.querySelector('.user-menu');
    userMenu.classList.toggle('open');
}

const avatarButton = document.querySelector('.user-avatar');
if (avatarButton) {
    avatarButton.addEventListener('click', showMenu);
}


/**
 * Disables the logout button and signs the user out via Firebase, redirecting to the login page on success.
 */
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