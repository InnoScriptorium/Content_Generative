import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";
import {
  faPlusCircle,
  faArrowCircleDown,
  faPrint,
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [responseArray, setResponseArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sideResponse, setSideResponse] = useState("");

  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const modifiedQuestion = question + " table of contents";
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

  const reGeneRes = async (question,para) => {
    try {
      const res = await axios.post("http://localhost:3001/getResponse", {
        question,
      });
      setSideResponse(para);
      setResponse(res.data);

    } catch (error) {
      console.error("Error fetching response from server:", error);
      setResponse("Error fetching response from server");

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
                onClick={() => reGeneRes(item.includes(question) ? item : item + ' to ' + question,item)}
                style={{ backgroundColor: item === sideResponse ? 'aqua' : '' }}
              >
                <pre className="text-dark">{item}</pre>
              </div>
            ))}

          </div>
          <div className="col-8  min-vh-100 side-response">
            <h3>{sideResponse}</h3>
            <textarea
              className="form-control"
              readOnly
              value={response}
              rows={20}
            />
          </div>
        </div>
      </main>

      {/*  <footer className=" py-1">
        <div className="container ">
        <FontAwesomeIcon
              icon={faArrowAltCircleRight}
              className="btn btn-primary button-wrapper float-center mt-3"
              onClick={handleSubmit}
            />
        </div>
      </footer> */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start">
              {/* Social media icons and copyright text */}
              <div className="d-inline-flex align-items-center">
                {/* Social media icons */}
                <span className="me-3">
                  <i class="fa-brands fa-facebook"></i>
                </span>
                <span className="me-3">
                  <i class="fa-brands fa-twitter"></i>
                </span>
                <span>
                  <i class="fa-brands fa-instagram"></i>
                </span>
                {/* Copyright text */}
                <p className="mb-0 ms-3 copyright-text">
                  Copyright &copy; {new Date().getFullYear()} ldtech All Rights
                  Reserved
                </p>
              </div>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              {/* Print button */}
              {/* <button className="btn btn-light me-3" onClick={() => window.print()}>
        <i class="fa-solid fa-print"></i>
        
        </button> */}
              <span className="me-3">
                <i class="fa-solid fa-print"></i>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
{
  /* <button type="button" className="btn btn-outline-light me-2">
          <FontAwesomeIcon icon={faPlusCircle} /> Add To Doc
        </button>
        <button type="button" className="btn btn-outline-light me-2">
          <FontAwesomeIcon icon={faArrowCircleDown} /> Download Doc
        </button> 
        
        <FontAwesomeIcon
              icon={faArrowAltCircleRight}
              className="btn btn-primary button-wrapper float-end mt-3"
              onClick={handleSubmit}
            />
        */
}
