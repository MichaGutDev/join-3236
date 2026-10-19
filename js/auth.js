import { auth, database } from './firebase-config.js';
import { push, set, ref } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getRandomContactColor, isValidEmail } from './contact-utils.js';
import { showToast } from './toast.js';


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
            sessionStorage.setItem('showGreeting', 'true');
            window.location.href = 'html/summary.html';
        })
        .catch(() => {
            showError('login-error', ['email', 'password'], 'Check your email and password. Please try again.');
            loginSubmit.disabled = false;
        });
}


/**
 * Redirects to the login page.
 */
function redirectToLogin() {
    window.location.href = '../index.html';
}


/**
 * Handles the signup form submission.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @returns {void}
 */
function signUp(event) {
    event.preventDefault();

    const values = getSignUpValues();

    clearError('signup-error', ['password', 'confirm-password']);

    const error = getSignUpError(values);
    if (error) {
        showError('signup-error', error.fieldIds, error.message);
        return;
    }

    handleFirebaseSignUp(values.name, values.email, values.password);
}


/**
 * Checks the signup values and returns the first problem that was found.
 *
 * @param {{password: string, confirmPassword: string, privacyAccepted: boolean}} values - The form values.
 * @returns {{fieldIds: string[], message: string}|null} The error to show, or null if everything is fine.
 */
function getSignUpError(values) {
    if (values.password.length < 6) {
        return { fieldIds: ['password'], message: 'Your password must be at least 6 characters long.' };
    }
    if (values.password !== values.confirmPassword) {
        return { fieldIds: ['confirm-password'], message: "Your passwords don't match. Please try again." };
    }
    if (!values.privacyAccepted) {
        return { fieldIds: [], message: 'Please accept the Privacy policy.' };
    }
    return null;
}


/**
 * Reads the values of the signup form.
 *
 * @returns {{name: string, email: string, password: string, confirmPassword: string, privacyAccepted: boolean}} The form values.
 */
function getSignUpValues() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirm-password').value,
        privacyAccepted: document.getElementById('privacy-policy').checked
    };
}


/**
 * Creates a new user account with Firebase using email and password, and writes a corresponding contact entry to the database.
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
            showToast('You Signed Up successfully', redirectToLogin);
            const newContactRef = push(ref(database, "contacts"));
            set(newContactRef, { name, email, phone: "", color: getRandomContactColor(), userId: userCredential.user.uid });
        })
        .catch(() => {
            showError('signup-error', ['email'], 'Registration failed. Please try again.');
            signupSubmit.disabled = false;
        });
}


/**
 * Shows an error message and highlights the given fields.
 *
 * @param {string} errorId - The id of the error message element.
 * @param {string[]} fieldIds - The ids of the input fields to highlight.
 * @param {string} message - The error message to display.
 */
function showError(errorId, fieldIds, message) {
    document.getElementById(errorId).textContent = message;
    fieldIds.forEach((id) => {
        document.getElementById(id).parentElement.classList.add('field-error');
    });
}


/**
 * Clears the error message and removes highlighting from the given fields.
 *
 * @param {string} errorId - The id of the error message element.
 * @param {string[]} fieldIds - The ids of the input fields to clear.
 */
function clearError(errorId, fieldIds) {
    document.getElementById(errorId).textContent = "";
    fieldIds.forEach((id) => {
        document.getElementById(id).parentElement.classList.remove('field-error');
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
            sessionStorage.setItem('showGreeting', 'true');
            window.location.href = 'html/summary.html';
        })
        .catch(() => {
            guestButton.disabled = false;

        });
}


/**
 * Updates the password icon based on whether the field has content.
 *
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
 *
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


/**
 * Checks that all required signup fields are filled, then enables or disables the submit button accordingly.
 */
function updateSignupButtonState() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const button = document.getElementById('signup-submit');
    button.disabled = !(name && email && password && confirmPassword);
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
    privacyCheckbox.addEventListener('change', () => clearError('signup-error', ['password', 'confirm-password']));
}


const textFields = ['name', 'email', 'password', 'confirm-password'];

textFields.forEach(id => {
    const field = document.getElementById(id);
    if (field) {
        field.addEventListener('input', updateSignupButtonState);
    }
});


const guestButton = document.getElementById('guest-login');
if (guestButton) {
    guestButton.addEventListener('click', guestLogin);
}


const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', () => updatePasswordIcon('password', 'password-icon'));
    document.getElementById('password-toggle-btn').addEventListener('click', () => togglePasswordVisibility('password', 'password-icon'));
}

const confirmPasswordInput = document.getElementById('confirm-password');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => updatePasswordIcon('confirm-password', 'confirm-password-icon'));
    document.getElementById('confirm-password-toggle-btn').addEventListener('click', () => togglePasswordVisibility('confirm-password', 'confirm-password-icon'));
}

const splashScreen = document.getElementById('splash-screen');
if (splashScreen) {
    setTimeout(() => {
        splashScreen.classList.add("splash-hidden");
    }, 200);
}