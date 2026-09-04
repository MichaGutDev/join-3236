/**
 * Filters tasks by title and description based on the current search input value, and displays the matching results.
 */
function filterTasks() {
    const searchInput = document.getElementById('search-task');
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm)
    );
    displayTasks(filteredTasks);
    const noResultsMessage = document.getElementById('no-results-message');
    noResultsMessage.hidden = filteredTasks.length !== 0;
}


const searchInput = document.getElementById('search-task');
if (searchInput) {
    searchInput.addEventListener('input', filterTasks);
}