import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { jsPDF } from "jspdf";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [responseArray, setResponseArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fullResponseArray, setFullResponseArray] = useState([]);
  const [sideResponse, setSideResponse] = useState("");
  const [tempFullResponseArray, setTempFullResponseArray] = useState([]);
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const modifiedQuestion = question + " table of  3 contents ";
      const res = await axios.post("http://localhost:3001/getResponse", {
        question: modifiedQuestion,
      });
      const responseArray = res.data.split("\n");
      setResponseArray(responseArray);

      let tempResponses = [];

      for (const item of responseArray) {
        const modifiedItem = item.includes(question)
          ? item
          : item + " to " + question;
        const res = await axios.post("http://localhost:3001/getResponse", {
          question: modifiedItem,
        });

        tempResponses.push({ item: item, responseData: res.data });
        if (tempResponses.length === 1) {
          setResponse(res.data);
          setSideResponse(item); // Set the sideResponse to highlight the first item
        }

        //setFullResponseArray((prevState) => [...prevState, `art ${item}\n${res.data}\n\n`]);
        setFullResponseArray((prevState) => [
          ...prevState,
          { item: item, data: res.data },
        ]);

        setTempFullResponseArray(tempResponses);
      }
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

  const reGeneRes = (item, index) => {
    if (tempFullResponseArray[index]) {
      setResponse(tempFullResponseArray[index].responseData);
      setSideResponse(item); // Set the sideResponse to highlight the clicked item
    } else {
      console.log("Error: Index not found in tempFullResponseArray");
    }
  };

  const pdfDownload = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const maxLineWidth = pageWidth - 2 * margin; // Account for the left and right margins
    const lineHeight = 7; // Reduced line height
    const itemLineHeight = 8; // Slightly larger line height for the item
    let yOffset = margin;

    const processText = (text) => {
      const lines = doc.splitTextToSize(text, maxLineWidth); // Split text into lines that fit within maxLineWidth
      return lines;
    };

    // Add the heading
    const modifiedQuestion = question.toUpperCase();
    doc.setFontSize(20); // Make the heading larger
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 128, 0); // Green color
    const textWidth = doc.getTextWidth(modifiedQuestion);
    const textX = (pageWidth - textWidth) / 2;
    doc.text(modifiedQuestion, textX, yOffset);
    yOffset += 3; // Move yOffset down by the height of the heading

    // Add a single bold horizontal line immediately after the heading
    const lineStartX = margin;
    const lineEndX = pageWidth - margin;
    doc.setDrawColor(0, 0, 0); // Black color for line
    doc.setLineWidth(1.5); // Set line width to make it bold
    doc.line(lineStartX, yOffset, lineEndX, yOffset); // Draw the line
    yOffset += 8; // Space after the line

    // Add "Table Of Contents:" string
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black color for text
    doc.text("Table Of Contents:", margin, yOffset);
    yOffset += lineHeight; // Adjust yOffset for the next content

    // Reset font settings for the content
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");

    // First, add the contents of responseArray
    responseArray.forEach((line) => {
      const lines = processText(line);
      lines.forEach((textLine) => {
        if (yOffset + lineHeight > pageHeight - margin) {
          // Check if we need to add a new page
          doc.addPage();
          yOffset = margin;
        }
        doc.text(textLine, margin, yOffset);
        yOffset += lineHeight; // Increase the yOffset for the next line
      });
    });

    // Add a small space before adding fullResponseArray contents
    yOffset += lineHeight / 2; // Reduce space

    // Then, add the contents of fullResponseArray
    fullResponseArray.forEach((entry) => {
      const { item, data } = entry;

      // Process and add the item in bold
      doc.setFont("helvetica", "bold");
      const itemLines = processText(item);
      itemLines.forEach((line) => {
        if (yOffset + itemLineHeight > pageHeight - margin) {
          // Check if we need to add a new page
          doc.addPage();
          yOffset = margin;
        }
        doc.text(line, margin, yOffset);
        yOffset += itemLineHeight; // Increase the yOffset for the next line
      });

      // Process and add the data in normal font
      doc.setFont("helvetica", "normal");
      const dataLines = processText(data);
      dataLines.forEach((line) => {
        if (yOffset + lineHeight > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        doc.text(line, margin, yOffset);
        yOffset += lineHeight;
      });

      yOffset += lineHeight / 2;
    });

    doc.save(`${modifiedQuestion}.pdf`);
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
            {/* {responseArray.map((item, index) => (
              <div
                key={index}
                className="response-item"
                onClick={() => reGeneRes(item, index)}
                style={{ backgroundColor: item === sideResponse ? 'aqua' : '' }}
              >
                <pre 
                  className="text-dark big-item"  
                  style={{ backgroundColor: '#e5e5e5'}}>
                  {item}
                </pre>
              </div>
            ))} */}
            {responseArray.map((item, index) => {
              const itemExists = tempFullResponseArray.some(
                (responseItem) => responseItem.item === item
              );
              const backgroundColor = itemExists ? "#e5e5e5" : "red";

              return (
                <div
                  key={index}
                  className="response-item"
                  onClick={() => reGeneRes(item, index)}
                  style={{
                    backgroundColor: item === sideResponse ? "aqua" : "",
                  }}
                >
                  <pre
                    className="text-dark big-item"
                    style={{ backgroundColor: backgroundColor }}
                  >
                    {item}
                  </pre>
                </div>
              );
            })}
          </div>

          <div className="col-8 min-vh-100 side-response">
            <h3>{sideResponse}</h3>
            <textarea
              className="form-control"
              readOnly
              value={response}
              rows={20}
            />
            <button onClick={pdfDownload} className="btn btn-secondary mt-3">
              Download PDF
            </button>
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
