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
 * Validates the email format using a regular expression.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email format is valid.
 */
export function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
