const BASE_URL = "http://localhost:3001/api";

const callApi = async (url, props) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...props,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const responseBody = isJson ? await response.json() : null;

    if (!response.ok) {
      console.error('API Error:', responseBody);
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${JSON.stringify(responseBody)}`);
    }
    return { ...responseBody, ok: true };
  } catch (error) {
    console.error('Network or other error:', error);
    return { ok: false };
  }
};

const postMessages = async ({ threadId, input }) => {
  const response = await callApi(`/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });
  if (response.ok) {
    return { ...response, status: 200 };
  } else {
    console.error('postMessages Error:', response);
  }
  return { status: 404 };
};

const getMessages = async ({ threadId }) => {
  const response = await callApi(`/threads/${threadId}/messages`, {
    method: "GET",
  });
  if (response.ok) {
    return { ...response, status: 200 };
  } else {
    console.error('getMessages Error:', response);
  }
  return { status: 404 };
};

const runThread = async ({ threadId, assistant_id }) => {
  const response = await callApi(`/threads/${threadId}/runs`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assistant_id }),
  });
  if (response.ok) {
    return { ...response, status: 200 };
  } else {
    console.error('runThread Error:', response);
  }
  return { status: 404 };
};

const createThread = async () => {
  const response = await callApi(`/threads`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tool_resources: {
        file_search: { vector_store_ids: [] },
        code_interpreter: { file_ids: [] },
      },
    }),
  });
  if (response.ok) {
    return { id: response.id, status: 200 };
  } else {
    console.error('createThread Error:', response);
  }
  return { status: 404 };
};

const getThread = async (threadId) => {
  const response = await callApi(`/threads/${threadId}`, {
    method: "GET",
  });
  if (response.ok) {
    return { ...response, status: 200 };
  } else {
    console.error('getThread Error:', response);
  }
  return { status: 404 };
};

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function copyText(button, divId) {
  const div = document.getElementById(divId);
  const htmlToCopy = div.innerHTML;
  const textToCopy = div.innerText;
  navigator.clipboard
    .write([
      new ClipboardItem({
        "text/html": new Blob([htmlToCopy], { type: "text/html" }),
        "text/plain": new Blob([textToCopy], { type: "text/plain" }),
      }),
    ])
    .then(() => {
      button.textContent = "Copied!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => console.error("Error copying text: ", err));
}

function createAssistantMessage(content, divId) {
  const messageContainer = document.createElement("div");
  messageContainer.className = "assistant-message-container";

  const messageDiv = document.createElement("div");
  messageDiv.className = "message assistant-message";

  const copyBtnContainer = document.createElement("div");
  copyBtnContainer.className = "copy-btn-container";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", function () {
    copyText(this, divId);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "save-btn";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", function () {
    handleSaveBtn(this, content, divId);
  });

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", function () {
    handleEditBtn(this, divId);
  });

  const messageContent = document.createElement("div");
  messageContent.id = divId;
  messageContent.innerHTML = convertMarkdownToHtml(content);

  messageDiv.appendChild(copyBtnContainer);
  copyBtnContainer.appendChild(copyBtn);
  copyBtnContainer.appendChild(saveBtn);
  copyBtnContainer.appendChild(editBtn);
  messageDiv.appendChild(messageContent);
  messageContainer.appendChild(messageDiv);

  return messageContainer;
}

function handleEditBtn(editButton, divId) {
  const messageContent = document.getElementById(divId);
  if (!messageContent) return;

  // Set contenteditable to true to allow in-place editing
  messageContent.contentEditable = "true";
  messageContent.style.border = "1px solid #ccc";
  messageContent.style.padding = "10px";
  messageContent.style.borderRadius = "5px";
  messageContent.focus();

  // Change the edit button to save button
  editButton.textContent = "Save";
  editButton.onclick = function () {
    saveEditedContent(editButton, divId);
  };
}

function saveEditedContent(editButton, divId) {
  const messageContent = document.getElementById(divId);
  if (!messageContent) return;

  // Get the updated content from the contenteditable div
  const updatedContent = messageContent.innerText.trim();
  // Convert the updated content back to HTML
  const updatedHtmlContent = convertMarkdownToHtml(updatedContent);

  // Set the innerHTML with the updated HTML content
  messageContent.innerHTML = updatedHtmlContent;

  // Reset contenteditable to false
  messageContent.contentEditable = "false";
  messageContent.style.border = "none";
  messageContent.style.padding = "0";

  // Reset the save button to edit button
  editButton.textContent = "Edit";
  editButton.onclick = function () {
    handleEditBtn(editButton, divId);
  };
}

function convertMarkdownToHtml(markdown) {
  const converter = new showdown.Converter();
  return converter.makeHtml(markdown);
}

function convertHtmlToMarkdown(html) {
  const converter = new showdown.Converter();
  return converter.makeMarkdown(html);
}

function editMessage(button, content, divId) {
  const div = document.getElementById(divId);
  const inputArea = document.getElementById("message-input");
  inputArea.value = div.innerText;  // Populates the input field with the message content for editing.
  inputArea.focus(); // Focuses the input field for immediate editing.
}

function createUserMessage(content, divId) {
  const userMessageContainer = document.createElement("div");
  userMessageContainer.className = "user-message-container";

  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";

  const copyBtnContainer = document.createElement("div");
  copyBtnContainer.className = "copy-btn-container";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", function () {
    copyText(this, divId);
  });

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", function () {
    handleEditBtn(this, divId);
  });

  const messageContent = document.createElement("div");
  messageContent.id = divId;
  messageContent.innerHTML = content;

  userMessage.appendChild(copyBtnContainer);
  copyBtnContainer.appendChild(copyBtn);
  copyBtnContainer.appendChild(editBtn);
  userMessage.appendChild(messageContent);
  userMessageContainer.appendChild(userMessage);

  return userMessageContainer;
}


const setDisabled = (value) => {
  const input = document.getElementById("message-input");
  const sendButton = document.getElementById("sendButton");
  const newButton = document.getElementById("newButton");
  const newSessionButton = document.getElementById("openSessionNoteModal");
  const loader = document.getElementById("loader");
  loader.style.display = value ? "flex" : "none";
  input.disabled = value;
  sendButton.disabled = value;
  newButton.disabled = value;
  newSessionButton.disabled = value;
};

async function sendMessage() {
  const input = document.getElementById("message-input");
  const value = input.value.trim();
  input.value = "";
  setDisabled(true);

  if (value !== "") {
    const messageId = generateUniqueId(); // Generate a unique ID for the message
    const userMessage = createUserMessage(convertMarkdownToHtml(value), messageId);
    document.getElementById("chat-box").appendChild(userMessage);

    let threadId = localStorage.getItem("threadId");
    if (!threadId || threadId === "undefined") {
      const { id, status } = await createThread();
      if (status === 404) {
        alert("Something went wrong during creating the thread");
        setDisabled(false);
        return;
      }
      threadId = id;
      localStorage.setItem("threadId", id);
    }

    const postMessagesResponse = await postMessages({ threadId, input: value });
    if (postMessagesResponse.status === 200) {
      const runThreadResponse = await runThread({
        threadId,
        assistant_id: "asst_LdAem8sJLT0P7wA0Br5XkG3q",
      });
      if (runThreadResponse.status === 200) {
        while (true) {
          await sleep(2000);
          const messagesResponse = await getMessages({ threadId });
          if (messagesResponse.status === 200) {
            const data = messagesResponse.data[0];
            if (data.role === "assistant" && data.content.length > 0) {
              const msg = messagesResponse.data.find((item) => item.id === messagesResponse.first_id);
              const text = msg.content[0].text.value;
              const assistantMessage = createAssistantMessage(text, msg.id);
              document.getElementById("chat-box").appendChild(assistantMessage);
              document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
              break;
            }
          } else {
            alert("Something went wrong during getting response from API");
            setDisabled(false);
            return;
          }
        }
      } else {
        alert("Something went wrong during running the thread");
        setDisabled(false);
        return;
      }
    } else {
      alert("Something went wrong during posting message.");
      setDisabled(false);
      return;
    }
  }
  setDisabled(false);
}


async function newChat() {
  handleLoader.show();
  const response = await createThread();
  if (response.status === 200) {
    localStorage.setItem("threadId", response.id);
  } else {
    alert("Something went Wrong During New Thread. May Be Your API KEY OR Assistant ID Is Invalid.");
  }
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
  handleLoader.hide();
}

// ########################## Api Services  #########################

class ApiService {
  constructor(url, tableName) {
    this.url = url;
    this.tableName = tableName;
  }

  async fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  }

  buildUrl(params) {
    const queryParams = new URLSearchParams(params);
    return `${this.url}?${queryParams}`;
  }

  async get(id = null) {
    const params = {
      action: id ? "getById" : "read",
      sheetName: this.tableName,
      id,
    };
    const url = this.buildUrl(params);
    return this.fetchData(url);
  }

  async post(data) {
    const params = {
      action: "write",
      sheetName: this.tableName,
    };
    const url = this.buildUrl(params);
    return this.fetchData(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async update(data) {
    const params = {
      action: "update",
      sheetName: this.tableName,
    };
    const url = this.buildUrl(params);
    return this.fetchData(url, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}

const apiServices = {
  client: new ApiService("http://localhost:3001/api", "Client"),
};



// ########################## Handlers #########################

function populateSelect(selectElement, optionsArray, placeholder = true) {
  selectElement.innerHTML = "";

  if (optionsArray.length === 0) {
    const noOption = new Option("No Option Available", "");
    noOption.disabled = true;
    selectElement.add(noOption);
  } else {
    if (placeholder) {
      const noOption = new Option("Select One", "");
      selectElement.add(noOption);
    }
    optionsArray.forEach((optionData) => {
      const option = new Option(optionData.name, optionData.id);
      selectElement.add(option);
    });
  }
}


const handleAddClientBtn = (btnId, firstElementId, secondElementId) => {
  const btn = document.getElementById(btnId);
  const selectElement = document.getElementById(firstElementId);
  const inputField = document.getElementById(secondElementId);
  if (selectElement.style.display !== "none") {
    btn.textContent = "Select";
    selectElement.style.display = "none";
    inputField.style.display = "block";
    inputField.required = true;
    selectElement.required = false;
  } else {
    btn.textContent = "+ Add";
    selectElement.style.display = "block";
    inputField.style.display = "none";
    inputField.required = false;
    inputField.value = "";
    selectElement.required = true;
  }
};

const handleModal = {
  open: (modalId) => {
    const myModal = new bootstrap.Modal(document.getElementById(modalId));
    myModal.show();
  },
  close: (modalId) => {
    const myModalEl = document.getElementById(modalId);
    // Directly hide the modal using Bootstrap method
    const modalInstance = bootstrap.Modal.getInstance(myModalEl);
    if (modalInstance) {
      modalInstance.hide();
    } else {
      // Fallback for older versions of Bootstrap or if getInstance is unavailable
      const modal = new bootstrap.Modal(myModalEl);
      modal.hide();
    }
  },
};

const handleLoader = {
  show: () => {
    document.getElementById("loader").style.display = "flex";
  },
  hide: () => {
    document.getElementById("loader").style.display = "none";
  },
};

const handleSaveBtn = (button, content, divId) => {
  document.getElementById("SaveModalPlanId").value = divId;
  document.getElementById("SaveModalDocument").value = content;
  const clientinfo = extractClientInfo();
  const selectElement = document.getElementById("SaveModalClientNameSelect");
  populateSelect(selectElement, clientinfo);
  handleModal.open("SaveModal");
};

const handleSaveModal = () => {
  document.getElementById("SaveModalAddClientBtn").addEventListener("click", () =>
    handleAddClientBtn(
      "SaveModalAddClientBtn",
      "SaveModalClientNameSelect",
      "SaveModalClientNameInput"
    )
  );
  const form = document.getElementById("SaveModalForm");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
      clientName: formData.get("clientName"),
      clientId: formData.get("clientId"),
      planId: formData.get("planId"),
      planName: formData.get("planName"),
      planType: formData.get("planType"),
      date: formData.get("date"),
      document: formData.get("document"),
    };
    await saveClient(data);
    handleModal.close("SaveModal");
    form.reset();
  });
};

const handleSessionNoteModal = () => {
  document.getElementById("openSessionNoteModal").addEventListener("click", () => {
    const clientinfo = extractClientInfo();
    const selectElement = document.getElementById("SessionNoteModalClientNameSelect");
    populateSelect(selectElement, clientinfo);

    // Add an event listener to populate treatment plans when a client is selected
    selectElement.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      const client = getClientById(selectedValue);
      if (!client) {
        alert("Client not found with id: " + selectedValue);
        return;
      }
      
      const treatmentPlans = JSON.parse(client["treatmentplan"] || "[]");
      treatmentPlans.sort((a, b) => new Date(b.date) - new Date(a.date));
      const formattedTreatmentPlans = treatmentPlans.map((plan) => ({
        id: plan.id,
        name: plan.name,
      }));

      const selectTreatmentPlan = document.getElementById("SessionNoteModalTreatmentPlanSelect");
      populateSelect(selectTreatmentPlan, formattedTreatmentPlans);
    });

    handleModal.open("SessionNoteModal");
  });

  const form = document.getElementById("SessionNoteModalForm");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const data = {
      clientId: formData.get("clientId"),
      treatmentPlans: formData.get("treatmentPlans"),
      comments: formData.get("comments"),
    };

    const message = createNewSessionNote(data);
    handleModal.close("SessionNoteModal");
    form.reset();
    document.getElementById("message-input").value = message;
  });
};


const updateSidebar = () => {
  const clientsData = getDataFromLocalStorage("clients") || [];
  const sidebarElement = document.getElementById("sidebar");
  sidebarElement.innerHTML = "";
  createDirectoryStructure(sidebarElement, clientsData);
};

const handleHideSaveButton = (divId) => {
  const targetDiv = document.getElementById(divId);
  const parentDiv = targetDiv?.previousElementSibling;
  const button = parentDiv.querySelector(".save-btn");
  if (button) {
    button.style.display = "none";
  }
};

const handelAddNewClient = () => {
  const conatiner = document.getElementById("sidebarAddNewClientContainer");

  const addBtn = document.getElementById("sidebarAddNewClientBtn");
  addBtn.addEventListener("click", () => {
    const btnText = addBtn.textContent;
    if (btnText === "Close") {
      addBtn.textContent = "+ Add";
    } else {
      addBtn.textContent = "Close";
    }
    conatiner.classList.toggle("d-none");
  });

  const saveBtn = document.getElementById("sidebarNewClientNameSaveBtn");
  saveBtn.addEventListener("click", async () => {
    const clinetNameInput = document.getElementById("sidebarNewClientName");
    await addClientName(clinetNameInput?.value);
    conatiner.classList.toggle("d-none");
    addBtn.textContent = "+ Add";
    clinetNameInput.value = "";
  });
};

// ########################## Sidebar #########################
function sortByDate(a, b) {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateB - dateA; // Sort from latest to oldest
}

function handleDocumentModal() {
  document.getElementById("DocumentModalInsertBtn").addEventListener("click", () => {
    const message = document.getElementById("DocumentModalDocumentDiv").textContent;
    handleModal.close("DocumentModal");

    const input = document.getElementById("message-input");
    const cursorPos = input.selectionStart;
    const textBeforeCursor = input.value.substring(0, cursorPos);
    const textAfterCursor = input.value.substring(cursorPos);

    // Insert the message at the cursor position
    input.value = textBeforeCursor + message + textAfterCursor;

    // Move the cursor to the end of the inserted text
    input.selectionStart = input.selectionEnd = cursorPos + message.length;
    input.focus();
  });

  document.getElementById("DocumentModalDeleteBtn").addEventListener("click", async () => {
    const noteId = document.getElementById("DocumentModalDocumentDiv").getAttribute("data-note-id");
    const clientId = localStorage.getItem("currentClientId");
    const noteType = document.getElementById("DocumentModalDocumentDiv").getAttribute("data-note-type");

    if (!noteId || !clientId || !noteType) {
      alert("Error: Note ID, Client ID, or Note Type is missing.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/clients/${clientId}/notes/${noteId}?noteType=${noteType}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Note deleted successfully.");
        handleModal.close("DocumentModal");
        removeNoteFromSidebar(noteId); // Call the function to remove the note from the sidebar
        updateSidebar();
      } else {
        alert("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  });

  document.getElementById("DocumentModalEditBtn").addEventListener("click", async function () {
    const contentDiv = document.getElementById("DocumentModalDocumentDiv");
    const editButton = this;

    if (editButton.textContent === "Edit") {
      contentDiv.contentEditable = "true";
      contentDiv.style.border = "1px solid #ccc";
      contentDiv.style.padding = "10px";
      contentDiv.style.borderRadius = "5px";
      contentDiv.focus();
      editButton.textContent = "Save";
    } else {
      const noteId = contentDiv.getAttribute("data-note-id");
      const clientId = localStorage.getItem("currentClientId");
      const noteType = contentDiv.getAttribute("data-note-type");
      const updatedContent = contentDiv.innerText.trim();

      try {
        const client = getClientById(clientId);
        const notes = JSON.parse(client[noteType] || '[]');
        const noteIndex = notes.findIndex(note => note.id === noteId);
        if (noteIndex !== -1) {
          notes[noteIndex].document = updatedContent;
        }
        client[noteType] = JSON.stringify(notes);

        const response = await apiServices.client.update(client);
        if (response.status === 200) {
          updateClientLocalData(clientId, client);
          alert("Note updated successfully.");

          // Update the UI dynamically
          updateSidebar();
          updateDocumentModalContent(noteId, updatedContent);
        } else {
          alert(`Error: ${response.message}`);
        }
      } catch (error) {
        console.error("Error updating note:", error);
        alert("Failed to update note.");
      }

      contentDiv.contentEditable = "false";
      contentDiv.style.border = "none";
      contentDiv.style.padding = "0";
      editButton.textContent = "Edit";
    }
  });
}


function removeNoteFromSidebar(noteId) {
  const noteElement = document.querySelector(`.file[data-note-id="${noteId}"]`);
  if (noteElement) {
    noteElement.parentElement.removeChild(noteElement);
  }
}

// Function to build a folder with sorted files
function buildFolder(folderName, files, clientId) {
  const folderLi = document.createElement("li");
  folderLi.classList.add("folder");
  folderLi.textContent = folderName;

  const folderUl = document.createElement("ul");
  folderUl.classList.add("dotted");
  folderUl.classList.add("hidden");

  // Sort the files by date
  files.sort(sortByDate).forEach((file) => {
    const fileLi = document.createElement("li");
    fileLi.classList.add("file");
    fileLi.textContent = `${file.name} (${file.date})`; // Ensure this displays the date and name correctly
    fileLi.setAttribute("data-note-id", file.id);
    fileLi.setAttribute("data-note-type", folderName.toLowerCase().replace(" ", ""));
    fileLi.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent parent folders from toggling
      document.getElementById("DocumentModalLabel").textContent = file.name.toUpperCase();
      const contentDiv = document.getElementById("DocumentModalDocumentDiv");
      contentDiv.innerHTML = "";
      contentDiv.innerHTML = convertMarkdownToHtml(file.document);
      contentDiv.setAttribute("data-note-id", file.id);
      contentDiv.setAttribute("data-note-type", folderName.toLowerCase().replace(" ", ""));
      localStorage.setItem("currentClientId", clientId); // Set clientId in local storage

      const copyBtn = document.getElementById("DocumentModalCoptBtn");
      copyBtn.addEventListener("click", function () {
        copyText(this, "DocumentModalDocumentDiv");
      });
      handleModal.open("DocumentModal");
    });
    folderUl.appendChild(fileLi);
  });

  folderLi.appendChild(folderUl);
  return folderLi;
}


function updateDocumentModalContent(noteId, updatedContent) {
  const noteElement = document.querySelector(`.file[data-note-id="${noteId}"]`);
  if (noteElement) {
      noteElement.textContent = updatedContent;
  }
}


// Function to create the directory structure for multiple clients
function createDirectoryStructure(rootElement, clientsData) {
  const root = document.createElement("ul");
  root.classList.add("empty-dotted");

  clientsData.forEach((client) => {
    const clientLi = document.createElement("li");
    clientLi.classList.add("folder");
    clientLi.textContent = client.clientname;

    const clientUl = document.createElement("ul");
    clientUl.classList.add("arrow");
    clientUl.classList.add("hidden");

    // Create subfolders for treatment plans, intake notes, and session notes
    clientUl.appendChild(
      buildFolder("Treatment Plan", JSON.parse(client["treatmentplan"] || "[]"), client.id)  // Pass client.id to buildFolder
    );
    clientUl.appendChild(
      buildFolder("Intake Note", JSON.parse(client["intakenote"] || "[]"), client.id)  // Pass client.id to buildFolder
    );
    clientUl.appendChild(
      buildFolder("Session Note", JSON.parse(client["sessionnote"] || "[]"), client.id)  // Pass client.id to buildFolder
    );

    clientLi.appendChild(clientUl);
    root.appendChild(clientLi);
  });

  rootElement.appendChild(root);

  // Add click event listeners for toggle functionality
  const folders = document.querySelectorAll(".folder");
  folders.forEach((folder) => {
    folder.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent bubbling to parent folders
      const nestedList = folder.querySelector("ul");
      if (nestedList) {
        nestedList.classList.toggle("hidden"); // Show or hide the list
      }
    });
  });
}
// ########################## Utils #########################

function generateUniqueId() {
  const date = new Date();
  const timestamp = date.getTime();
  const randomPortion = Math.random().toString(36).substring(2, 15);
  const uniqueId = `client_${timestamp}_${randomPortion}`;
  return uniqueId;
}

const loadData = async () => {
  handleLoader.show();
  localStorage.clear();
  try {
    const response = await apiServices.client.get();
    const { status, data, message } = response;
    if (status === 200) {
      localStorage.setItem("clients", JSON.stringify(data));
    } else {
      alert(`Error fetching clients: ${message}`);
    }
  } catch (err) {
    console.error('Error Fetching Clients:', err); // Log the error for debugging
    alert(`Failed to Fetch clients: ${err.message}`);
  } finally {
    handleLoader.hide();
  }
};


const getDataFromLocalStorage = (key) => {
  const data = localStorage.getItem(key);
  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
};

const manageLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const addClientLocalData = (newClient) => {
  const clients = getDataFromLocalStorage("clients") || [];
  manageLocalStorage("clients", [...clients, newClient]);
};

const updateClientLocalData = (clientId, updatedClient) => {
  const clients = getDataFromLocalStorage("clients") || [];
  const filteredClients = clients.filter((entry) => entry.id !== clientId);
  manageLocalStorage("clients", [...filteredClients, updatedClient]);
};

const getClientById = (clientId) => {
  const clients = getDataFromLocalStorage("clients") || [];
  return clients.find((entry) => entry.id === clientId);
};

const saveClient = async (data) => {
  const { planType, clientName, clientId, planName, planId, date, document } =
    data;
  const key = planType.toLowerCase();
  const value = { id: planId, name: planName, document, date };
  handleLoader.show();
  if (clientName) {
    await addClient(clientName, key, value);
  } else {
    await updateClient(clientId, key, value);
  }
  handleLoader.hide();
};

const addClient = async (clientName, key, value) => {
  const cleanData = {
    id: generateUniqueId(),
    clientname: clientName,
    [key]: JSON.stringify([value]),
  };
  try {
    const response = await apiServices.client.post(cleanData);
    if (response.status === 200) {
      console.log(response.message);
      addClientLocalData(cleanData);
      handleHideSaveButton(value.id);
      updateSidebar();
    } else {
      alert(`Error: ${response.message}`);
    }
  } catch (err) {
    alert(`Failed to save client: ${err}`);
  }
};

const updateClient = async (clientId, key, value) => {
  const client = getClientById(clientId);
  if (!client) {
    alert("Client not found with id: " + clientId);
    return;
  }
  const prevData = JSON.parse(client[key] || "[]");
  const noteIndex = prevData.findIndex(note => note.id === value.id);

  if (noteIndex !== -1) {
    prevData[noteIndex] = value;
  } else {
    prevData.push(value);
  }

  const updatedClient = { ...client, [key]: JSON.stringify(prevData) };

  try {
    const response = await apiServices.client.update(updatedClient);
    if (response.status === 200) {
      updateClientLocalData(clientId, updatedClient);
      alert("Client updated successfully.");
      updateSidebar();
    } else {
      alert(`Error: ${response.message}`);
    }
  } catch (err) {
    alert(`Failed to update client: ${err}`);
  }
};



const addClientName = async (clientName) => {
  const cleanData = {
    id: generateUniqueId(),
    clientname: clientName,
  };
  handleLoader.show();
  try {
    const response = await apiServices.client.post(cleanData);
    if (response.status === 200) {
      console.log(response.message);
      addClientLocalData(cleanData);
      updateSidebar();
    } else {
      alert(`Error: ${response.message}`);
    }
  } catch (err) {
    alert(`Failed to save client: ${err}`);
  }
  handleLoader.hide();
};

const extractClientInfo = () => {
  const clients = getDataFromLocalStorage("clients") || [];
  return clients.map((client) => ({
    id: client.id,
    name: client.clientname,
  }));
};

const createNewSessionNote = (data) => {
  const { clientId, comments, treatmentPlans } = data;
  const client = getClientById(clientId);
  if (!client) {
    alert("Client not found with id: " + clientId);
    return;
  }
  const allTreatmentPlans = JSON.parse(client["treatmentplan"] || "[]");
  const selectedTreatmentPlans = allTreatmentPlans.find(
    (plan) => plan.id === treatmentPlans
  );
  if (!client) {
    alert("Treatment Plan not found with id: " + treatmentPlans);
    return;
  }
  const message = `Create new session note

Here is the client current treatment plan:
${selectedTreatmentPlans.document}

Session details:
${comments}
`;

  return message;
};

function handleExpandButton() {
  const expandButton = document.getElementById("expandButton");
  const messageInput = document.getElementById("message-input");
  const expandIcon = document.getElementById("expandIcon");

  expandButton.addEventListener("click", () => {
      messageInput.classList.toggle("expanded");

      if (messageInput.classList.contains("expanded")) {
          expandIcon.innerHTML = `
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.16"></g>
          <g id="SVGRepo_iconCarrier">
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="Dribbble-Light-Preview" transform="translate(-220.000000, -6684.000000)" fill="#ffff">
                      <g id="icons" transform="translate(56.000000, 160.000000)">
                          <path d="M164.292308,6524.36583 L164.292308,6524.36583 C163.902564,6524.77071 163.902564,6525.42619 164.292308,6525.83004 L172.555873,6534.39267 C173.33636,6535.20244 174.602528,6535.20244 175.383014,6534.39267 L183.70754,6525.76791 C184.093286,6525.36716 184.098283,6524.71997 183.717533,6524.31405 C183.328789,6523.89985 182.68821,6523.89467 182.29347,6524.30266 L174.676479,6532.19636 C174.285736,6532.60124 173.653152,6532.60124 173.262409,6532.19636 L165.705379,6524.36583 C165.315635,6523.96094 164.683051,6523.96094 164.292308,6524.36583" id="arrow_down-[#338]"></path>
                      </g>
                  </g>
              </g>
          </g>
          `;
      } else {
          expandIcon.innerHTML = `
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                          <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -6683.000000)" fill="#ffffff">
                              <g id="icons" transform="translate(56.000000, 160.000000)">
                                  <path d="M84,6532.61035 L85.4053672,6534 L94.0131154,6525.73862 L94.9311945,6526.61986 L94.9261501,6526.61502 L102.573446,6533.95545 L104,6532.58614 C101.8864,6530.55736 95.9854722,6524.89321 94.0131154,6523 C92.5472155,6524.40611 93.9757869,6523.03486 84,6532.61035" id="arrow_up[#340]"></path>
                              </g>
                          </g>
                      </g>
                  </g>
          `;
      }
  });
}

// ########################## LOAD SCRIPT #########################

document.addEventListener("DOMContentLoaded", async function () {
  await loadData();
  document.getElementById("newButton").addEventListener("click", newChat);
  document.getElementById("sendButton").addEventListener("click", sendMessage);
  handleSessionNoteModal();
  handleSaveModal();
  handleDocumentModal();
  updateSidebar();
  handelAddNewClient();
  handleExpandButton();
});