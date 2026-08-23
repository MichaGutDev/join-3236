const toDoContainerRef = document.getElementById('to_do');
const inProgressContainerRef = document.getElementById('in_progress');
const awaitFeedbackContainerRef = document.getElementById('await_feedback');
const doneContainerRef = document.getElementById('done');

// function displayTasks() {
//     html = "";
//     task.forEach(task => {
//         html += returnTaskHTML(task)
//     });
//     toDoContainerRef.innerHTML += html;
// }

// function returnTaskHTML(task) { // takes full object
//     return `
//         <section>
//             <h3>${task.category}</h3>
//             <h4>${task.title}</h4>
//             <p>${task.preview}</p>
//             <div>
//                 <span>${task.subtasks[0].title}</span>
//                 <span>${task.subtasks[1].title}</span>
//             </div>
//             <div>
//                 <div>
//                     <div>${task.collaborators[0].name}</div>
//                     <div>MG</div>
//                     <div>SO</div>
//                 </div>
//                 <div>${task.urgency}</div>
//             </div>

//         </section>
//     `
// }

const task = [
  {
    toDo: {
      id: 1,
      title: "Create login page",
      description: "Build the basic structure and styling for the login page.",
      dueDate: "2026-08-25",
      prio: "urgent",
      category: "User Story",
      assignedTo: ["contactId1", "contactId2"],
      status: "To Do",
      subtasks: [
        { subtask: "Create HTML structure", completion: true },
        { subtask: "Add responsive styling", completion: false },
      ],
    },
  },
];

const formRef = document.querySelector('#todo-form');

formRef.addEventListener("submit", (event) => {
  event.preventDefault();

  console.log("Form submitted!");
  getValues();
});


function getValues() {
  const formData = new FormData(formRef);
  console.log([...formData]);
};