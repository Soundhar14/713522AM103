const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = 9000;

app.use(cors());
app.use(express.json());

const Window = [];
const WINDOW_SIZE = 10;


app.use((req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token || !token.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided or invalid format' });
    }
    
    const bearerToken = token.split(' ')[1];
    const specCode = 'd9104c13684ce8de2eb03edc626563554c1d366218b7a61f02001734764b071c';
  
    try {
      const decoded = jwt.verify(bearerToken, specCode);
      req.token = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
});

const urlMap = {
  'p': 'http://20.244.56.144/test/primes',
  'e': 'http://20.244.56.144/test/fibo',
  'r': 'http://20.244.56.144/test/rand'
};

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  const windowPrevState = [...Window];

  const receivingUrl = urlMap[numberid];

  if (!receivingUrl) {
    return res.status(400).json({ error: 'Invalid function call. Please use "p", "e", or "r".' });
  }

  try {
    const firstReturn = await axios.get(receivingUrl, { timeout: 500 });

    const NumberIn = firstReturn.data.numbers.filter((num) => !Window.includes(num));

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
    return res.status(500).json({ error: 'error recieving the input' });
  }
});

function calculateAverage(array) {
  if (array.length === 0) return 0;
  const sum = array.reduce((acc, num) => acc + num, 0);
  return sum / array.length;
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
