// ########################## Constants.js #########################

const BASE_URL = "http://localhost:3001/api";

// ########################## Script #########################

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
  console.log('Updated content:', updatedContent);

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

function createUserMessage(content) {
  const userMessageContainer = document.createElement("div");
  userMessageContainer.className = "user-message-container";

  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.innerHTML = content;

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
    const userMessage = createUserMessage(convertMarkdownToHtml(value));
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

  fetchData(url, options = {}) {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        throw error;
      });
  }

  buildUrl(params) {
    const queryParams = new URLSearchParams(params);
    return `${this.url}?${queryParams}`;
  }

  get(id = null) {
    const params = {
      action: id ? "getById" : "read",
      sheetName: this.tableName,
      id,
    };
    const url = this.buildUrl(params);
    return this.fetchData(url);
  }

  post(data) {
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

  update(data) {
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
  }
  optionsArray.forEach((optionData) => {
    const option = new Option(optionData.name, optionData.id);
    selectElement.add(option);
  });
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
    const myModal = bootstrap.Modal.getInstance(myModalEl);
    if (myModal) {
      myModal.hide();
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
    selectElement.addEventListener("change", (event) => {
      const selectedValue = event.target.value;
      const client = getClientById(selectedValue);
      if (!client) {
        alert("Client not found with id: " + clientId);
        return;
      }
      const treatmentPlans = JSON.parse(client["treatmentplan"] || "[]");
      treatmentPlans.sort((a, b) => new Date(b.date) - new Date(a.date));
      const formattedTreatmentPlans = treatmentPlans.map((plan) => ({
        id: plan.id,
        name: plan?.name,
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

const handleDocuemntModal = () => {
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
    const documentModalLabel = document.getElementById("DocumentModalLabel").textContent.toLowerCase();
    const noteType = documentModalLabel.includes("treatment") ? "treatmentplan" : documentModalLabel.includes("intake") ? "intakenote" : "sessionnote";
    const noteId = document.getElementById("DocumentModalDocumentDiv").getAttribute("data-note-id");
    const clientId = localStorage.getItem("currentClientId");

    if (!noteId || !clientId) {
      alert("Error: Note ID or Client ID is missing.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/clients/${clientId}/notes/${noteId}?noteType=${noteType}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Note deleted successfully.");
        handleModal.close("DocumentModal");
        updateSidebar();
      } else {
        alert("Failed to delete note.");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Failed to delete note.");
    }
  });
};


// Function to build a folder with sorted files
function buildFolder(folderName, files) {
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
    fileLi.textContent = `${file.name} (${file.date})`;
    fileLi.setAttribute("data-note-id", file.id);
    fileLi.setAttribute("data-note-type", folderName.toLowerCase().replace(" ", ""));
    fileLi.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent parent folders from toggling
      document.getElementById("DocumentModalLabel").textContent = file.name.toUpperCase();
      const contentDiv = document.getElementById("DocumentModalDocumentDiv");
      contentDiv.innerHTML = "";
      contentDiv.innerHTML = convertMarkdownToHtml(file.document);
      contentDiv.setAttribute("data-note-id", file.id);
      localStorage.setItem("currentClientId", file.clientId); // Ensure client ID is stored for use in the delete function
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
      buildFolder("Treatment Plan", JSON.parse(client["treatmentplan"] || "[]"))
    );
    clientUl.appendChild(
      buildFolder("Intake Note", JSON.parse(client["intakenote"] || "[]"))
    );
    clientUl.appendChild(
      buildFolder("Session Note", JSON.parse(client["sessionnote"] || "[]"))
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
      alert("Error on fetcing clients:", message);
    }
  } catch (err) {
    alert("Failed to Fetch clients:", err);
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
  const newData = [...prevData, value];
  const updatedClient = { ...client, [key]: JSON.stringify(newData) };

  try {
    const response = await apiServices.client.update(updatedClient);
    if (response.status === 200) {
      console.log(response.message);
      updateClientLocalData(clientId, updatedClient);
      handleHideSaveButton(value.id);
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

// ########################## LOAD SCRIPT #########################

document.addEventListener("DOMContentLoaded", async function () {
  await loadData();
  document.getElementById("newButton").addEventListener("click", newChat);
  document.getElementById("sendButton").addEventListener("click", sendMessage);
  handleSessionNoteModal();
  handleSaveModal();
  handleDocuemntModal();
  updateSidebar();
  handelAddNewClient();
});
