const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 9876;

app.use(cors());
app.use(express.json());


const Window = [];
const WINDOW_SIZE = 10;

const specCode =  'd9104c13684ce8de2eb03edc626563554c1d366218b7a61f02001734764b071c';

app.use((req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided or invalid format' });
    }
    
    const bearerToken = token.split(' ')[1];
  
    try {
      const decoded = jwt.verify(bearerToken, specCode);
      req.token = decoded;
      next();
    } catch (error) {
        console.log(error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
});

const urlMap = {
  'p': 'http://20.244.56.144/test/primes',
  'e': 'http://20.244.56.144/test/fibo',
  'r': 'http://20.244.56.144/test/rand'
};

// Async Error Handling Middleware Wrapper
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/numbers/:numberid', asyncHandler(async (req, res) => {
  const { numberid } = req.params;
  const windowPrevState = [...Window];

  const receivingUrl = urlMap[numberid];
  if (!receivingUrl) {
    return res.status(400).json({ error: 'Invalid function call. Please use "p", "e", or "r".' });
  }

  try {
    const response = await axios.get(receivingUrl, { timeout: 500 });
    const NumberIn = response.data.numbers.filter((num) => !Window.includes(num));

    NumberIn.forEach((num) => {
      Window.push(num);
      if (Window.length > WINDOW_SIZE) Window.shift();
    });

    const windowCurrState = [...Window];
    const avg = calculateAverage(Window);

    return res.json({
      windowPrevState,
      windowCurrState,
      numbers: NumberIn,
      avg,
    });
  } catch (error) {
    console.log('error:', error.response ? error.response.data : error.message);
    throw new Error('Error receiving the input from the external service.');
  }
}));

function calculateAverage(array) {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, num) => acc + num, 0);
  return sum / array.length;
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
