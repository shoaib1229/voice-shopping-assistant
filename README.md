# Voice Command Shopping Assistant ✨

A smart, voice-powered shopping list application built with modern web technologies. This project allows users to manage their shopping list hands-free using natural voice commands and receive intelligent suggestions and recipe ideas based on their list's contents.

**Live Demo URL:** [https://your-netlify-site-name.netlify.app](https://your-netlify-site-name.netlify.app) <!-- Replace with your live Netlify URL -->

---

## Key Features

- **Voice Command Interface**: Add, remove, clear, and search for items using natural language (e.g., "Add two loaves of bread," "remove milk," "find organic apples under 5 dollars").
- **Interactive Shopping List**: A clean, real-time display of all items, with quantities and the ability to manually remove items.
- **AI-Powered Recipe Ideas**: Get simple recipe suggestions based on the current ingredients in your shopping list.
- **Smart Suggestions**: Receive intelligent recommendations for additional items that complement what's already on your list.
- **Product Search**: A mock product search allows users to find specific items by name, brand, tags, or price, demonstrating complex command parsing.
- **Clean & Responsive UI**: A minimalist, mobile-first interface built with Tailwind CSS that provides clear visual feedback to the user.

---

## Technology Stack & Architecture

This project is a full-stack application with a decoupled architecture, ensuring security and scalability.

- **Frontend**:
  - HTML5, Tailwind CSS, Vanilla JavaScript
  - **Web Speech API**: For browser-based speech-to-text conversion.
  - **Deployment**: Hosted as a static site on **Netlify** for high performance and continuous deployment from GitHub.

- **Backend**:
  - **Node.js** with the **Express.js** framework.
  - Handles all business logic and acts as a secure proxy for the AI service.
  - **Deployment**: Hosted as a web service on **Render** for reliable, scalable server management.

- **AI Service**:
  - **Google Gemini API**: Powers all Natural Language Processing (NLP) tasks. It interprets user commands, generates structured JSON responses, and provides creative content for recipes and suggestions.

---

## Project Approach

*(This is the "Brief write-up of your approach" required by the assessment)*

My approach to the Voice Command Shopping Assistant was to build a modern, full-stack application with a clear separation between the frontend and backend.

**Technologies Used:**
- **Frontend:** HTML, Tailwind CSS, and vanilla JavaScript for a clean, lightweight user interface. The Web Speech API is used for voice recognition.
- **Backend:** A Node.js server with the Express.js framework to handle API requests securely.
- **AI Service:** Google's Gemini API is used for all Natural Language Processing (NLP) tasks, including command parsing, recipe generation, and smart suggestions.

**Architecture:**
The frontend is a static site deployed on Netlify for optimal performance and scalability. The Node.js backend is hosted on Render, which manages the server environment and securely handles the Gemini API key. The frontend communicates with the backend via a RESTful API. This decoupled architecture makes the application robust and easy to maintain.

---

## Local Setup and Installation

To run this project on your local machine, please follow these steps:

**Prerequisites:**
- [Node.js](https://nodejs.org/) (v18 or later)
- npm (included with Node.js)

**Instructions:**

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/shoaib1229/voice-shopping-assistant.git](https://github.com/shoaib1229/voice-shopping-assistant.git)
    cd voice-shopping-assistant/project 
    ```
    *(Note: The server files are inside the `project` directory).*

2.  **Install backend dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    - In the `project` folder, create a new file named `.env`.
    - Add your Google Gemini API key to this file:
      ```
      GEMINI_API_KEY="YOUR_API_KEY_HERE"
      ```

4.  **Start the server:**
    ```bash
    node server.js
    ```

5.  **Open the application:**
    - The server will now be running. You can view the application by opening a web browser and navigating to `http://localhost:3001`.
