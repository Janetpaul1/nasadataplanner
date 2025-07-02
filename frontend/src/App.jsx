import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Lightbox } from 'react-modal-image';
import './App.css';

function App() {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [showLightbox, setShowLightbox] = useState(false);

  const fetchApod = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = date ? date.toISOString().split('T')[0] : '';
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/apod`, {
        params: { date: formattedDate }
      });
      setApod(response.data);
      if (response.data.url) {
        setHistory((prev) => [...new Set([response.data, ...prev])].slice(0, 5));
      }
    } catch (err) {
      setError('Failed to load APOD data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApod();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchApod(date);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-6">NASA Astronomy Picture of the Day</h1>

      <div className="mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          maxDate={new Date()}
          className="p-2 rounded bg-gray-800 text-white"
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {apod && (
        <div className="max-w-4xl w-full">
          <h2 className="text-2xl font-semibold">{apod.title}</h2>
          <p className="text-gray-400 mb-4">{apod.date}</p>
          {apod.media_type === 'image' ? (
            <img
              src={apod.url}
              alt={apod.title}
              className="w-full rounded-lg cursor-pointer"
              onClick={() => setShowLightbox(true)}
            />
          ) : (
            <iframe src={apod.url} className="w-full h-96 rounded-lg" title={apod.title}></iframe>
          )}
          <p className="mt-4">{apod.explanation}</p>
        </div>
      )}

      {showLightbox && apod.media_type === 'image' && (
        <Lightbox
          medium={apod.url}
          large={apod.hdurl || apod.url}
          alt={apod.title}
          onClose={() => setShowLightbox(false)}
        />
      )}

      {history.length > 0 && (
        <div className="mt-8 w-full">
          <h3 className="text-xl font-semibold mb-4">Recently Viewed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {history.map((item, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => {
                    setApod(item);
                    setSelectedDate(new Date(item.date));
                  }}
                />
                <p className="text-sm mt-2">{item.title}</p>
                <p className="text-xs text-gray-400">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;