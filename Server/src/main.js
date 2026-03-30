const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const mainRoutes = require('./Routes/main');

dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Drone Drop!');
});

app.use('/api', mainRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});