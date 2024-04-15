import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
 
 
function App() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
 
    try {
      const res = await axios.post('http://localhost:4000/getResponse', { question });
      setResponse(res.data);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to fetch response from server');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          className='input'
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your prompt"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Content'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* {response && <p style={{ color: 'green'}}>{response}</p>} */}
      {response && <pre style={{ color: 'green' }}>{response}</pre>}
    </div>
  );
}
 
export default App;
 