export const CONTACT_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33FF", "#ff8400", "#00bfff", "#ffea00", "#278300", "#9b0000", "#00008b"];


/**
 * Picks a random color from the contact color palette.
 *
 * @returns {string} A hex color code.
 */
export function getRandomContactColor() {
    return CONTACT_COLORS[Math.floor(Math.random() * CONTACT_COLORS.length)];
}


/**
 * Validates a person's name: at least two characters, starting and ending with a letter,
 * with letters, spaces, dots, apostrophes and hyphens in between.
 *
 * @param {string} name - The name to validate.
 * @returns {boolean} True if the name is valid.
 */
export function isValidName(name) {
    return /^\p{L}[\p{L} .'-]*\p{L}$/u.test(name);
}


/**
 * Validates the email format using a regular expression. The part before the @ consists of
 * words separated by single dots or special characters, the domain parts must not start or
 * end with a hyphen, and the domain ending has 2 to 4 letters.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email format is valid.
 */
export function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}


/**
 * Validates the phone number format using a regular expression.
 *
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number format is valid.
 */
export function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9\s\-()]{6,}$/;
    return phoneRegex.test(phone);
}
