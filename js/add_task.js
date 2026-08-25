const task = [
  {
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
  }
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
  dataCreation([...formData])
};

let valueLog = [];

/**
 * creates the task object based on the data given by getValues
 * @param {array} formData - array of [key, value] from input submit
 */
function dataCreation(formData) {
  const data = {
    assignedTo: [],
    subtasks: [],
  };
  formData.forEach(([key, value]) => {
    if (key === "assignedTo" || key === "subtask") {
      data[key].push(value);
    } else {
      data[key] = value;
    }
  });
  valueLog.push(data);
}