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
    // openDialog();
    console.log("Init");
    console.log(contact);

}

function editContact() {
    document.getElementById('dialog_topic_area').innerHTML = "";
    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Edit Contact</h2>
        <div class="dialog-topic-underline"></div>
    `;

    openDialog();
}

function createContact() {
    document.getElementById('dialog_topic_area').innerHTML = "";
    document.getElementById('dialog_topic_area').innerHTML = `
        <img class="dialog-join-logo" src="../assets/imgs/dialog-join-logo.svg" alt="">
        <h2 class="dialog-topic-title">Add contact</h2>
        <p class="dialog-topic-slogan">Tasks are better with a team</p>
        <div class="dialog-topic-underline"></div>
    `;
    openDialog();
}

// dialog_topic_area -> innerHTML
// dialog_input_name -> value
// dialog_input_mail -> value
// dialog_input_phone -> value
// dialog_button_area -> innerHTML

function openDialog() {
    let dialog = document.getElementById('dialog');
    dialog.showModal();
}

function closeDialog() {
    let dialog = document.getElementById('dialog');
    dialog.close();
}

function stopBubbleling(event) {
    event.stopPropagation();
}



async function addContact() {

    
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

