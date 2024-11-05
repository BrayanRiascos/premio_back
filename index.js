const express = require('express');
const cors = require('cors');
const pool = require('./database/mongo');
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(cors()); // Permitir todos los orígenes
app.use(express.json());

//connectToDatabase();

app.get('/', async (req, res) => {
  res.send("PocketUX");
}); 

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


