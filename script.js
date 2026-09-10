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


/**
 * Closes the user menu when a click occurs outside of it.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function closeMenuOutside(event) {
    const wrapper = document.querySelector('.user-menu-wrapper');
    const userMenu = document.querySelector('.user-menu');
    if (userMenu && wrapper && !wrapper.contains(event.target)) {
        userMenu.classList.remove('open');
    }
}

const avatarButton = document.querySelector('.user-avatar');
if (avatarButton) {
    avatarButton.addEventListener('click', showMenu);
    document.addEventListener('click', closeMenuOutside);
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
        .catch(() => {
            logoutButton.disabled = false;

        });
}


const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', logout)
}