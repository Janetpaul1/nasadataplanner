const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const cors = require('cors');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours
const PORT = process.env.PORT || 5000;
const NASA_API_KEY = process.env.NASA_API_KEY;

app.use(cors());
app.use(express.json());

app.get('/api/apod', async (req, res) => {
  const date = req.query.date || '';
  const cacheKey = `apod_${date || 'today'}`;

  // Check cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const url = date
      ? `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&date=${date}`
      : `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    
    const response = await axios.get(url);
    const data = response.data;

    // Cache the response
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching APOD:', error.message);
    res.status(500).json({ error: 'Failed to fetch APOD data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});