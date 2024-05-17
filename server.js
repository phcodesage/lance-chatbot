const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3001;

// Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

app.use('/vendor', express.static(path.join(__dirname, 'vendor')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname)));

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwnJFuqpiR8pApAFcZRfRI3t7E6z75acdMBIQfL8G93cS_om-sid5GU6EMjMWvJFcQ9iw/exec';
const OPENAI_API_KEY = 'sk-proj-6SMswAuVWSNo7RGUITliT3BlbkFJp8KJNZdeYLpc5ilqIrSz';
const BASE_URL = 'https://api.openai.com/v1';

const HEADERS = {
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v2',
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
  
app.post('/api', async (req, res) => {
  const { action, sheetName } = req.query;
  const data = req.body;

  if (action === 'write') {
    try {
      const response = await axios.post(`${GOOGLE_SHEET_URL}?action=write&sheetName=${sheetName}`, data);
      res.status(200).json(response.data);
    } catch (error) {
      console.error('googleSheets Write Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// Endpoint to create a new thread
app.post('/api/threads', async (req, res) => {
  try {
    const response = await axios.post(`${BASE_URL}/threads`, {}, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('createThread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to retrieve a thread
app.get('/api/threads/:threadId', async (req, res) => {
  const { threadId } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/threads/${threadId}`, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('getThread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to modify a thread
app.post('/api/threads/:threadId', async (req, res) => {
  const { threadId } = req.params;
  const { metadata } = req.body;
  try {
    const response = await axios.post(`${BASE_URL}/threads/${threadId}`, { metadata }, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('modifyThread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to delete a thread
app.delete('/api/threads/:threadId', async (req, res) => {
  const { threadId } = req.params;
  try {
    const response = await axios.delete(`${BASE_URL}/threads/${threadId}`, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('deleteThread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to post messages to a thread
app.post('/api/threads/:threadId/messages', async (req, res) => {
  const { threadId } = req.params;
  const { input } = req.body;
  try {
    const response = await axios.post(`${BASE_URL}/threads/${threadId}/messages`, {
      role: 'user',
      content: input,
    }, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('postMessages Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to get messages from a thread
app.get('/api/threads/:threadId/messages', async (req, res) => {
  const { threadId } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/threads/${threadId}/messages`, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('getMessages Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Endpoint to run a thread
app.post('/api/threads/:threadId/runs', async (req, res) => {
  const { threadId } = req.params;
  const { assistant_id } = req.body;
  try {
    const response = await axios.post(`${BASE_URL}/threads/${threadId}/runs`, { assistant_id }, { headers: HEADERS });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('runThread Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

// Example endpoint to interact with Google Sheets API
app.get('/api/google-sheets', async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SHEET_URL);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('googleSheets Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.response ? error.response.data : error.message });
  }
});

app.get('/api', async (req, res) => {
    const { action, sheetName, id } = req.query;
    try {
      const response = await axios.get(GOOGLE_SHEET_URL, {
        params: { action, sheetName, id }
      });
      res.status(200).json(response.data);
    } catch (error) {
      console.error('googleSheets Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
  });

  app.delete('/api/clients/:clientId/notes/:noteId', async (req, res) => {
    const { clientId, noteId } = req.params;
    const { noteType } = req.query; // Expecting noteType as query param (e.g., 'treatmentplan', 'intakenote', 'sessionnote')
  
    try {
      // Fetch the client data
      const clientResponse = await axios.get(`${GOOGLE_SHEET_URL}?action=getById&sheetName=Client&id=${clientId}`);
      const clientData = clientResponse.data.data;
  
      if (!clientData) {
        return res.status(404).json({ error: 'Client data not found.' });
      }
  
      if (!clientData[noteType]) {
        return res.status(400).json({ error: `Note type ${noteType} not found in client data.` });
      }
  
      // Find and remove the note
      let notes = JSON.parse(clientData[noteType] || '[]');
      notes = notes.filter(note => note.id !== noteId);
  
      // Update the client data
      clientData[noteType] = JSON.stringify(notes);
      const updateResponse = await axios.post(`${GOOGLE_SHEET_URL}?action=update&sheetName=Client`, {
        ...clientData,
        id: clientId // Make sure to include the client ID in the update payload
      });
  
      res.status(200).json(updateResponse.data);
    } catch (error) {
      console.error('deleteNote Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
  });
  
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});