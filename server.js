const express = require('express');
const axios = require('axios');
const cors = require('cors');
const port = 8080;


const app = express();

app.use(cors());
app.use(express.json());

app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
});
