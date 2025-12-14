import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import callGemini from "./ai.js";

function App() {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Example schema for structured output
  const exampleSchema = {
    type: "object",
    properties: {
      syllables: {
        type: "array",
        description: "Put the syllables of the word into an array",
        items: {
          type: "string",
        },
      },
    },
    required: ["syllables"],
  };

  const handleCallGemini = async () => {
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await callGemini(
        "Turn this word into an array of syllables: Functional",
        exampleSchema
      );
      setResponse(result);
    } catch (err) {
      setError(err.message || "Failed to call Gemini API");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Gemini API Test</h1>
      <button
        onClick={handleCallGemini}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        {loading ? "Loading..." : "Call Gemini API"}
      </button>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "5px",
            marginBottom: "20px",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "5px",
            whiteSpace: "pre-wrap",
          }}
        >
          <strong>Response:</strong>
          <pre
            style={{
              marginTop: "10px",
              backgroundColor: "#f8f9fa",
              padding: "10px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {typeof response === "object"
              ? JSON.stringify(response, null, 2)
              : response}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
