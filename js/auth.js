import { auth, database } from './firebase-config.js';
import { push, set, ref } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


/**
 * Validates the email format using a regular expression.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email format is valid.
 */
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}


/**
 * Handles the login form submission.
 * 
 * @param {SubmitEvent} event - The form submit event.
 * @returns {void}
 */
function login(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    clearError('login-error', ['email', 'password']);

    if (!isValidEmail(email)) {
        showError('login-error', ['email', 'password'], 'Check your email and password. Please try again.');
        return;
    }

    handleFirebaseLogin(email, password);
}


/**
 * Signs in the user with Firebase using email and password.
 * 
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
function handleFirebaseLogin(email, password) {
    const loginSubmit = document.getElementById('login-submit');
    loginSubmit.disabled = true;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            window.location.href = 'html/summary.html';
        })
        .catch((error) => {
            console.log(error);
            showError('login-error', ['email', 'password'], 'Check your email and password. Please try again.');
            loginSubmit.disabled = false;
        });
}


/**
 *Shows the success toast and redirects to the login page after a short delay. 
 */
function showToast() {
    const toast = document.getElementById('toast');
    toast.style.display = 'flex';

    setTimeout(() => {
        window.location.href = '../index.html';
    }, 800);
}


/**
 * Handles the signup form submission.
 * 
 * @param {SubmitEvent} event - The form submit event.
 * @returns {void}
 */
function signUp(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    clearError('signup-error', ['confirm-password']);

    if (password !== confirmPassword) {
        showError('signup-error', ['confirm-password'], "Your passwords don't match. Please try again.");
        return;
    }

    handleFirebaseSignUp(name, email, password);
}


/**
 * Creates a new user account with Firebase using email and password.
 * 
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
function handleFirebaseSignUp(name, email, password) {
    const signupSubmit = document.getElementById('signup-submit');
    signupSubmit.disabled = true;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showToast();
            const newContactRef = push(ref(database, "contacts"));
            set(newContactRef, { name, email, phone: "", color: "#000000", userId: userCredential.user.uid });
        })
        .catch((error) => {
            console.log(error);
            showError('signup-error', ['email'], 'Registration failed. Please try again.');
            signupSubmit.disabled = false;
        });
}


/**
 * Shows an error message and highlights the given fields.
 * @param {string} errorId - The id of the error message element.
 * @param {string[]} fieldIds - The ids of the input fields to highlight.
 * @param {string} message - The error message to display.
 */
function showError(errorId, fieldIds, message) {
    document.getElementById(errorId).textContent = message;
    fieldIds.forEach((id) => {
        document.getElementById(id).parentElement.classList.add('auth-field--error');
    });
}


/**
 * Clears the error message and removes highlighting from the given fields.
 * @param {string} errorId - The id of the error message element.
 * @param {string[]} fieldIds - The ids of the input fields to clear.
 */
function clearError(errorId, fieldIds) {
    document.getElementById(errorId).textContent = "";
    fieldIds.forEach((id) => {
        document.getElementById(id).parentElement.classList.remove('auth-field--error');
    });
}


/**
 * Signs in as a guest using Firebase anonymous authentication.
 */
function guestLogin() {
    const guestButton = document.getElementById('guest-login');
    guestButton.disabled = true;

    signInAnonymously(auth)
        .then(() => {
            window.location.href = 'html/summary.html';
        })
        .catch((error) => {
            console.log(error);
            guestButton.disabled = false;

        });
}


/**
 * Updates the password icon based on whether the field has content.
 * @param {string} inputId - The id of the password input field.
 * @param {string} iconId - The id of the icon to update.
 */
function updatePasswordIcon(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    icon.src = input.value ? '../assets/icons/visibility-off.svg' : '../assets/icons/visibility.svg';
}


/**
 * Toggles the visibility of a password field between hidden and visible.
 * @param {string} inputId - The id of the password input field.
 * @param {string} iconId - The id of the icon to update.
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';
    icon.src = isHidden ? '../assets/icons/visibility.svg' : '../assets/icons/visibility-off.svg';
}


function togglePrivacyCheckbox() {
    const checkbox = document.getElementById('privacy-policy');
    const button = document.getElementById('signup-submit')
    button.disabled = !checkbox.checked;
}


const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', login);
}


const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', signUp);
}


const privacyCheckbox = document.getElementById('privacy-policy');
if (privacyCheckbox) {
    privacyCheckbox.addEventListener('change', togglePrivacyCheckbox);
}


const guestButton = document.getElementById('guest-login');
if (guestButton) {
    guestButton.addEventListener('click', guestLogin);
}


const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', () => updatePasswordIcon('password', 'password-icon'));
    document.getElementById('password-icon').addEventListener('click', () => togglePasswordVisibility('password', 'password-icon'));
}

const confirmPasswordInput = document.getElementById('confirm-password');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => updatePasswordIcon('confirm-password', 'confirm-password-icon'));
    document.getElementById('confirm-password-icon').addEventListener('click', () => togglePasswordVisibility('confirm-password', 'confirm-password-icon'));
}





















































