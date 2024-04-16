import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import { faPlusCircle, faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';



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
    <div className="App d-flex flex-column min-vh-100">
      <header className="bg-dark text-white py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <img src="https://ldtech.in/wp-content/uploads/2024/03/logo_ldtech.png" alt="Logo" className="logo" />
            </div>
            <div className="col">
              <h1 className="text-center">ConGen</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 py-5">
        <div className="container">
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="input-group">
              <input
                className="form-control"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your prompt"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Loading...' : <FontAwesomeIcon icon={faArrowAltCircleRight} />}
              </button>
            </div>
          </form>

          {error && <p className="text-danger">{error}</p>}
          {response && <pre className="text-success">{response}</pre>}
        </div>
      </main>

      <footer className="bg-dark text-white py-3 mt-auto">
  <div className="container">
    <div className="row">
      <div className="col">
        <button type="button" className="btn btn-outline-light me-2">
          <FontAwesomeIcon icon={faPlusCircle} /> Add To Doc
        </button>
        <button type="button" className="btn btn-outline-light me-2">
          <FontAwesomeIcon icon={faArrowCircleDown} /> Download Doc
        </button>
      </div>
    </div>
  </div>
</footer>

    </div>
  );
}

export default App;
