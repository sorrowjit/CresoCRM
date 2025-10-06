const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db'); 

// Import Routes
const distributorRoutes = require('./routes/distributors');
const notesRoutes = require('./routes/notes');
const dynamicFieldsRoutes = require('./routes/dynamicFields');

const app = express();
const PORT = process.env.PORT || 3001;

// Define the exact URL where your frontend is running.
// The port 5173 is inferred from your previous error screenshot.
const FRONTEND_URL = 'http://localhost:5173'; 

// Middleware
// FIX: Configure CORS explicitly to allow the frontend URL
app.use(cors({
    origin: FRONTEND_URL, 
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());

// Database connection check
db.on('open', () => {
    console.log('Database connection is open.');
});

// Routes
app.use('/api/distributors', distributorRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/fields', dynamicFieldsRoutes);

app.get('/', (req, res) => {
    res.send('CRM Backend API is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
    console.log(`CORS is configured for frontend at: ${FRONTEND_URL}`);
});
