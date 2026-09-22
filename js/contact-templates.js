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
