import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { get, ref } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
import { getInitials } from './contact-templates.js';


/**
 * Checks whether the user is logged in and, if not, redirects to index.html
 */
function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateUserInitials(user);
        } else {
            window.location.href = '../index.html';
        }
    })
}


/**
 * Shows "G" for a guest or a user without a contact, or the logged in user's initials, in the header.
 *
 * @param {object} user - The Firebase Auth user object.
 */
async function updateUserInitials(user) {
    const initialsRef = document.getElementById('user-initials');
    if (!initialsRef) return;

    const contact = user.isAnonymous ? null : await findContactByUserId(user.uid);
    initialsRef.textContent = contact ? getInitials(contact.name) : 'G';
}


/**
 * Finds the contact entry belonging to the given Firebase Auth user id.
 *
 * @param {string} userId - The Firebase Auth user id.
 * @returns {Promise<object|undefined>} The matching contact, if any.
 */
export async function findContactByUserId(userId) {
    const snapshot = await get(ref(database, "contacts"));
    const contacts = snapshot.val() || {};
    return Object.values(contacts).find((contact) => contact.userId === userId);
}


checkAuth();