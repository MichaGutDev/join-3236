export const CONTACT_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33FF", "#ff8400", "#00bfff", "#ffea00", "#278300", "#9b0000", "#00008b"];


/**
 * Picks a random color from the contact color palette.
 *
 * @returns {string} A hex color code.
 */
export function getRandomContactColor() {
    return CONTACT_COLORS[Math.floor(Math.random() * CONTACT_COLORS.length)];
}
