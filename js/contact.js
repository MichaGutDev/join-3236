import { database } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


const contactsRef = ref(database, "contacts");

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

async function addContact() {

    
}

function openDialog() {
    let dialog = document.getElementById('dialog');
    dialog.showModal();
}

function closeDialog() {
    let dialog = document.getElementById('dialog');
    dialog.close();
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

function generateContactHTML(id, contact) {
    return `
        <div class="contact" data-id="${id}">
            <div class="contact-initials">${getInitials(contact.name)}</div>
            <div class="contact-name">${contact.name}</div>
            <div class="contact-email">${contact.email}</div>
            <div class="contact-phone">${contact.phone}</div>
        </div>
    `;
}


function getInitials(name) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase();
}


onValue(contactsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const entries = Object.entries(data);
    const html = entries.filter(([id, contact]) => typeof contact === "object").map(([id, contact]) => generateContactHTML(id, contact)).join("");
    document.getElementById("contact_list").innerHTML = html;
});