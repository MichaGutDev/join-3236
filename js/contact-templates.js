import { escapeHTML } from "./html-utils.js";

const MAX_VISIBLE_CONTACTS = 3;


/**
 * Builds the initials from a contact's full name.
 *
 * @param {string} name - The contact's full name.
 * @returns {string} The uppercase initials.
 */
export function getInitials(name) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase();
}


/**
 * Builds the HTML for a single contact list item.
 *
 * @param {string} id - The Firebase key of the contact.
 * @param {object} contact - The contact data (name, email, phone, color).
 * @returns {string} The generated HTML markup.
 */
export function generateContactHTML(id, contact) {
    return `
        <div class="contact-list-item" data-id="${id}" tabindex="0" role="button">
            <div class="contact-content">
                <div class="initials-box">
                    <div class="contact-initials" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
                </div>
                <div class="contact-item">
                    <div class="contact-list-name">${contact.name}</div>
                    <div class="contact-list-email">${contact.email}</div>
                </div>
            </div>
        </div>
    `;
}


/**
 * Builds the HTML for the full contact list, inserting a letter heading before each new group.
 *
 * @param {Array} entries - Sorted [id, contact] pairs.
 * @returns {string} The generated HTML markup.
 */
export function generateContactListHTML(entries) {
    let lastLetter = "";
    return entries.map(([id, contact]) => {
        let html = "";
        const firstLetter = contact.name[0].toUpperCase();
        if (firstLetter !== lastLetter) {
            if (lastLetter !== "") {
                html += `<div class="separator"></div>`;
            }
            lastLetter = firstLetter;
            html += `<div class="contact-list-letter">${firstLetter}</div>`;
        }

        html += generateContactHTML(id, contact);
        return html;
    }).join("");
}


/**
 * Returns the HTML for assigned contact avatars and optional names. Without names only the
 * first three avatars are shown, followed by a +N avatar for the contacts that are not shown.
 *
 * @param {string[]} assignedToList - IDs of assigned contacts.
 * @param {Object[]} contacts - Available contacts.
 * @param {boolean} [showName=false] - Whether to display contact names.
 * @returns {string} Assigned contacts HTML.
 */
export function returnAssignedContactsHTML(assignedToList, contacts, showName = false) {
    if (!assignedToList || assignedToList.length === 0) {
        return "<div></div>";
    }

    const visibleList = showName ? assignedToList : assignedToList.slice(0, MAX_VISIBLE_CONTACTS);
    const hiddenCount = assignedToList.length - visibleList.length;
    const assignedToHTML = visibleList.map(contactID =>
        returnContactDisplayHTML(
            contacts.find(contact => contact.id === contactID),
            showName
        )
    );
    return assignedToHTML.join("") + (hiddenCount > 0 ? returnMoreContactsHTML(hiddenCount) : "");
}


/**
 * Returns the avatar that shows how many assigned contacts are not displayed.
 *
 * @param {number} hiddenCount - Number of contacts that are not displayed.
 * @returns {string} Avatar HTML.
 */
function returnMoreContactsHTML(hiddenCount) {
    return `<div class="contact-avatar contact-avatar-more">+${hiddenCount}</div>`;
}


/**
 * Returns a contact avatar with an optional name.
 *
 * @param {Object} contact - Contact to display.
 * @param {boolean} [showName=false] - Whether to display the name.
 * @returns {string} Contact HTML.
 */
function returnContactDisplayHTML(contact, showName = false) {
    if (!contact) {
        return "";
    }
    const escapedInitials = escapeHTML(getInitials(contact.name));
    return `
    <div class="contact-avatar" style="background: ${contact.color};">${escapedInitials}</div>
    ${showName ? returnContactNameHTML(contact.name) : ""}
    `;
}


/**
 * Returns a selectable contact with its checkbox state.
 *
 * @param {Object} contact - Contact to display.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @param {boolean} isCurrentUser - Whether the contact belongs to the logged in user.
 * @returns {string} Contact HTML.
 */
export function returnSelectableContactHTML(contact, isSelected, isCurrentUser) {
    const escapedName = escapeHTML(contact.name);
    const escapedInitials = escapeHTML(getInitials(contact.name));
    return `
    <label class="assigned-contact" data-contact-id="${contact.id}">
    <span class="contact-avatar" style="background: ${contact.color}">${escapedInitials}</span>
    <span>${escapedName}${isCurrentUser ? " (You)" : ""}</span>

    <input
        type="checkbox"
        class="assigned-contact-checkbox"
        value="${contact.id}"
        ${isSelected ? "checked" : ""}
    >
    </label>
    `
}


/**
 * Returns the escaped HTML for a contact's name.
 *
 * @param {string} name - Contact name.
 * @returns {string} Contact name HTML.
 */
function returnContactNameHTML(name) {
    const escapedName = escapeHTML(name);
    return `
        <span>${escapedName}</span>
    `;
}