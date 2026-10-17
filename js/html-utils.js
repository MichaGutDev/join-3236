/**
 * Escapes special HTML characters to prevent HTML injection.
 * @param {string} text - Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHTML(text) {
    const characters = [
        ["&", "&amp;"],
        ["<", "&lt;"],
        [">", "&gt;"],
        ['"', "&quot;"],
        ["'", "&#039;"]
    ];
    characters.forEach(([character, entity]) => {
        text = text.replaceAll(character, entity);
    });

    return text;
}