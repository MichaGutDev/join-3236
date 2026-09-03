const BASE_URL = "https://join-3236-default-rtdb.europe-west1.firebasedatabase.app";

async function testFetch() {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    const data = await response.json();
    const user = data.user1
    const ticker = data.userTicker
    console.log("TestFetch");
    console.log(response);
    console.log(user);
    console.log(ticker);
}

let contact = [];
let ticker = null;

async function init() {
    await testFetch();
    openDialog();
    console.log("Init");
    console.log(contact);

}

async function addContact() {

    
}

function openDialog() {
    let dialog = document.getElementById('dialog');
    dialog.showModal();
}




async function getContact() {
    const response = await fetch(`${BASE_URL}/contacts.json`);
    const data = await response.json();
    // contact.push(data.user0) = ;
}

function renderContactTopics(topics) {
    const container = document.getElementById("contact-topics");
    container.innerHTML = topics.map(generateContactTopicHTML).join("");
}

function generateContactTopicHTML(topic) {
    return `
        <div class="contact-topic">
            <h3>${topic.title}</h3>
            <p>${topic.description}</p>
        </div>
    `;
}

function generateContactHTML(contact) {
    return `
        <div class="contact">
            <div class="contact-initials">${contact.initials}</div>
            <div class="contact-name">${contact.name}</div>
            <div class="contact-email">${contact.email}</div>
            <div class="contact-phone">${contact.phone}</div>
        </div>
    `;
}