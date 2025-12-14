/**
 * Calls the Gemini API and requests structured or unstructured output
 * @param {string} prompt - The text prompt to send to Gemini
 * @param {Object} schema - Optional JSON schema for structured output
 * @returns {Promise<Object|string>} - The structured JSON response or text response from Gemini
 */
export default async function callGemini(prompt, schema = null) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set in environment variables");
  }

  try {
    // Build the request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    // Add structured output configuration if schema is provided
    if (schema) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
        responseSchema: schema,
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} ${
          response.statusText
        }. ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();

    // Extract the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;

      // If schema was provided, parse as JSON
      if (schema) {
        try {
          return JSON.parse(text);
        } catch (parseError) {
          throw new Error(
            `Failed to parse structured output: ${parseError.message}. Response: ${text}`
          );
        }
      }

      return text;
    } else {
      throw new Error("Unexpected response format from Gemini API");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
