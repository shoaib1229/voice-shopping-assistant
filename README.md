# voice-command-shopping-assistant

My approach to the Voice Command Shopping Assistant was to build a modern, full-stack application with a clear separation between the frontend and backend.

Technologies Used:

Frontend: HTML, Tailwind CSS, and vanilla JavaScript for a clean, lightweight user interface. The Web Speech API is used for voice recognition.

Backend: A Node.js server with the Express.js framework to handle API requests securely.

AI Service: Google's Gemini API is used for all Natural Language Processing (NLP) tasks, including command parsing, recipe generation, and smart suggestions.

Architecture:
The frontend is a static site deployed on Netlify for optimal performance and scalability. The Node.js backend is hosted on Render, which manages the server environment and securely handles the Gemini API key. The frontend communicates with the backend via a RESTful API. This decoupled architecture makes the application robust and easy to maintain.
