import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [responseArray, setResponseArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullResponseArray, setFullResponseArray] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const modifiedQuestion = question + " table of contents ";
      const res = await axios.post("http://localhost:3001/getResponse", {
        question: modifiedQuestion,
      });
      const responseArray = res.data.split("\n");
      setResponseArray(responseArray);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to fetch response from server");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fullRes = async () => {
    try {
      setFetching(true); 
      let tempFullResponseArray = [];

      for (const item of responseArray) {
        const modifiedItem = item.includes(question) ? item : item + ' to ' + question;
        const res = await axios.post("http://localhost:3001/getResponse", {
          question: modifiedItem,
        });
        
        const toBoldItalicText = (text) => {
          const boldItalicCharacters = {
            a: "𝗮",
            b: "𝗯",
            c: "𝗰",
            d: "𝗱",
            e: "𝗲",
            f: "𝗳",
            g: "𝗴",
            h: "𝗵",
            i: "𝗶",
            j: "𝗷",
            k: "𝗸",
            l: "𝗹",
            m: "𝗺",
            n: "𝗻",
            o: "𝗼",
            p: "𝗽",
            q: "𝗾",
            r: "𝗿",
            s: "𝘀",
            t: "𝘁",
            u: "𝘂",
            v: "𝘃",
            w: "𝘄",
            x: "𝘅",
            y: "𝘆",
            z: "𝘇",
            A: "𝗔",
            B: "𝗕",
            C: "𝗖",
            D: "𝗗",
            E: "𝗘",
            F: "𝗙",
            G: "𝗚",
            H: "𝗛",
            I: "𝗜",
            J: "𝗝",
            K: "𝗞",
            L: "𝗟",
            M: "𝗠",
            N: "𝗡",
            O: "𝗢",
            P: "𝗣",
            Q: "𝗤",
            R: "𝗥",
            S: "𝗦",
            T: "𝗧",
            U: "𝗨",
            V: "𝗩",
            W: "𝗪",
            X: "𝗫",
            Y: "𝗬",
            Z: "𝗭",
            " ": " ",
          };

          return [...text].map(char => boldItalicCharacters[char] || char).join('');
        };

        tempFullResponseArray.push({ item: toBoldItalicText(item), responseData: res.data });

        setFullResponseArray(prevState => prevState + `${toBoldItalicText(item)}\n${res.data}\n\n`);
      }
    } catch (error) {
      console.error("Error fetching responses from server:", error);
    } finally {
      setFetching(false);
    }
  };

  const addToDocument = async (question, responseArray, fullResponseArray) => {
    try {
      await axios.post('http://localhost:3001/addToDocument', { question, responseArray, fullResponseArray });
      console.log('Content added to document successfully');
    } catch (error) {
      console.error('Error adding content to document:', error);
    }
  };

  const fetchDocumentContent = async () => {
    try {
      const response = await axios.get('http://localhost:3001/getDocumentContent');
      return response.data;
    } catch (error) {
      console.error('Error fetching document content:', error);
      return null;
    }
  };

  const saveDocument = async () => {
    try {
      await addToDocument(question, responseArray, fullResponseArray);

      const documentContent = await fetchDocumentContent();
      if (!documentContent) {
        console.error('Document content not found.');
        return;
      }

      const response = await axios.get('http://localhost:3001/generate-document', {
        params: { documentContent },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'document.docx';
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating or downloading document:', error);
    }
  };

  return (
    <div className="App d-flex flex-column min-vh-100 overflow-x-hidden">
      <header className="bg-dark text-white py-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-auto">
              <img
                src="https://ldtech.in/wp-content/uploads/2024/03/logo_ldtech.png"
                alt="Logo"
                className="logo"
              />
            </div>
            <div className="col text-end">
              <h3>
                <span style={{ color: "#E30045" }}>CONT</span>
                <span style={{ color: "#731F73" }}>GEN</span>
              </h3>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 py-5 mx-2">
        <div className="row">
          <div className="col-4 min-vh-100">
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    "Loading..."
                  ) : (
                    <FontAwesomeIcon icon={faRightToBracket} />
                  )}
                </button>
              </div>
              <br />
            </form>
            {error && <p className="text-danger">{error}</p>}
            {responseArray.map((item, index) => (
              <div
                key={index}
                className="response-item"
              >
                <pre className="text-dark big-item">{item}</pre>
              </div>
            ))}
            <button className="get" onClick={fullRes} disabled={fetching}>
              {fetching ? "Getting..." : "Get"}
            </button>
          </div>
          <div className="col-8  min-vh-100 side-response">
            <textarea
              className="form-control"
              readOnly
              value={fullResponseArray}
              rows={20}
            />
            <button onClick={saveDocument}>Save the document</button>
          </div>
        </div>
      </main>

      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start">
              <div className="d-inline-flex align-items-center">
                <span className="me-3">
                  <i className="fab fa-facebook"></i>
                </span>
                <span className="me-3">
                  <i className="fab fa-twitter"></i>
                </span>
                <span>
                  <i className="fab fa-instagram"></i>
                </span>
                <p className="mb-0 ms-3 copyright-text">
                  Copyright &copy; {new Date().getFullYear()} ldtech All Rights
                  Reserved
                </p>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <span className="me-3">
                <i className="fas fa-print"></i>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
