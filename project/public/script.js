// CORRECT frontend/public/script.js - This file runs in the browser.
// It should NOT contain any 'require()' statements.

// --- Configuration ---
const BACKEND_URL = 'https://shopping-assistant-backend.onrender.com';

// --- DOM Elements ---
const voiceButton = document.getElementById('voice-button');
const micIcon = document.getElementById('mic-icon');
const status = document.getElementById('status');
const shoppingList = document.getElementById('shopping-list');
const emptyListMessage = document.getElementById('empty-list-message');
const suggestionsContainer = document.getElementById('suggestions');
const recipeButton = document.getElementById('recipe-button');
const suggestButton = document.getElementById('suggest-button');

const recipeModal = document.getElementById('recipe-modal');
const closeRecipeModalBtn = document.getElementById('close-recipe-modal-btn');
const recipeNameEl = document.getElementById('recipe-name');
const recipeDetailsEl = document.getElementById('recipe-details');

const searchModal = document.getElementById('search-modal');
const closeSearchModalBtn = document.getElementById('close-search-modal-btn');
const searchResultsEl = document.getElementById('search-results');


// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
} else {
    status.textContent = "Sorry, your browser doesn't support Speech Recognition.";
    voiceButton.disabled = true;
}

// --- Event Listeners ---
voiceButton.addEventListener('click', () => {
    if (!recognition) return;
    micIcon.classList.contains('fa-microphone') ? startListening() : stopListening();
});
recipeButton.addEventListener('click', getRecipe);
suggestButton.addEventListener('click', getSuggestions);
closeRecipeModalBtn.addEventListener('click', () => recipeModal.classList.add('hidden'));
recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) recipeModal.classList.add('hidden');
});
closeSearchModalBtn.addEventListener('click', () => searchModal.classList.add('hidden'));
searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.add('hidden');
});
suggestionsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-btn')) {
        const item = e.target.textContent.replace(' (Seasonal)', '').trim();
        addItem(item.toLowerCase());
    }
});

// Speech Recognition Event Handlers
if (recognition) {
    recognition.onstart = () => {
        micIcon.classList.replace('fa-microphone', 'fa-stop');
        voiceButton.classList.add('pulse', 'bg-red-600', 'hover:bg-red-700');
        status.textContent = 'Listening...';
    };
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        status.textContent = `You said: "${transcript}"`;
        processCommandWithBackend(transcript);
    };
    recognition.onerror = (event) => {
        status.textContent = 'Error: ' + event.error;
        stopListening();
    };
    recognition.onend = () => {
        stopListening();
    };
}

// --- Core Functions ---
function startListening() {
    try {
        recognition.start();
    } catch (error) {
        console.error("Recognition could not start: ", error);
        status.textContent = "Error starting listener. Check mic permissions.";
    }
}

function stopListening() {
    if (recognition) recognition.stop();
    micIcon.classList.replace('fa-stop', 'fa-microphone');
    voiceButton.classList.remove('pulse', 'bg-red-600', 'hover:bg-red-700');
    if (status.textContent === 'Listening...') status.textContent = '';
}

async function processCommandWithBackend(transcript) {
    setLoading(voiceButton, true);
    try {
        const response = await fetch(`${BACKEND_URL}/api/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript })
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const result = await response.json();
        
        switch (result.command) {
            case 'add': addItem(result.item, result.quantity); break;
            case 'remove': removeItem(result.item); break;
            case 'clear': clearList(); break;
            case 'search': handleSearch(result); break;
            default:
                status.textContent = `Sorry, I didn't understand that.`;
                speak("Sorry, I didn't understand that.");
        }
    } catch (error) {
        console.error("Error processing command:", error);
        status.textContent = "Could not process the command.";
    } finally {
        setLoading(voiceButton, false);
    }
}

function addItem(itemName, quantity = 1) {
    if (!itemName) return;
    emptyListMessage.style.display = 'none';
    itemName = itemName.toLowerCase().trim();
    const capitalizedItemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
    const existingItem = Array.from(shoppingList.children).find(li => li.dataset.itemName === itemName);

    if (existingItem) {
        const quantityEl = existingItem.querySelector('.item-quantity');
        const currentQuantity = parseInt(quantityEl.textContent.replace('x', ''), 10);
        quantityEl.textContent = `x${currentQuantity + quantity}`;
    } else {
        const li = document.createElement('li');
        li.dataset.itemName = itemName;
        li.className = 'flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg animate-fade-in';
        li.innerHTML = `
            <span class="flex-grow">
                <span class="font-medium">${capitalizedItemName}</span>
                <span class="item-quantity text-sm text-gray-500 dark:text-gray-400 ml-3">x${quantity}</span>
            </span>
            <button class="text-red-500 hover:text-red-700 ml-4 trash-btn"><i class="fas fa-trash"></i></button>`;
        li.querySelector('.trash-btn').onclick = () => removeItem(itemName);
        shoppingList.appendChild(li);
    }
    updateButtonsState();
    speak(`Added ${itemName}`);
}

function removeItem(itemName) {
    if (!itemName) return;
    itemName = itemName.toLowerCase().trim();
    const itemToRemove = Array.from(shoppingList.children).find(li => li.dataset.itemName === itemName);
    if (itemToRemove) {
        itemToRemove.classList.add('animate-fade-out');
        setTimeout(() => {
            shoppingList.removeChild(itemToRemove);
            if (shoppingList.children.length === 1) {
                emptyListMessage.style.display = 'flex';
            }
            updateButtonsState();
        }, 300);
        speak(`Removed ${itemName}`);
    } else {
        speak(`Could not find ${itemName} in your list.`);
    }
}

function clearList() {
    shoppingList.innerHTML = '';
    shoppingList.appendChild(emptyListMessage);
    emptyListMessage.style.display = 'flex';
    updateButtonsState();
    speak("Your shopping list has been cleared.");
}

async function getRecipe() {
    setLoading(recipeButton, true);
    const items = Array.from(shoppingList.children).map(li => li.dataset.itemName).filter(Boolean);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/recipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        if (!response.ok) throw new Error('Network response was not ok.');

        const recipe = await response.json();
        recipeNameEl.textContent = recipe.recipeName;
        recipeDetailsEl.innerHTML = `
            <p class="mb-4 text-gray-600 dark:text-gray-300">${recipe.description || ''}</p>
            <h4 class="font-semibold text-lg mb-2">Ingredients:</h4>
            <ul class="list-disc list-inside mb-4 pl-2 space-y-1">
                ${(recipe.ingredients || []).map(ing => `<li>${ing}</li>`).join('')}
            </ul>
            <h4 class="font-semibold text-lg mb-2">Instructions:</h4>
            <ol class="list-decimal list-inside pl-2 space-y-2">
                ${(recipe.instructions || []).map(step => `<li>${step}</li>`).join('')}
            </ol>`;
        recipeModal.classList.remove('hidden');
    } catch (e) {
        console.error("Error getting recipe:", e);
        status.textContent = "Could not generate a recipe.";
    } finally {
        setLoading(recipeButton, false);
    }
}

async function getSuggestions() {
    setLoading(suggestButton, true);
    const items = Array.from(shoppingList.children).map(li => li.dataset.itemName).filter(Boolean);
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const newSuggestions = await response.json();
        if (Array.isArray(newSuggestions)) {
            newSuggestions.forEach(item => {
                const button = document.createElement('button');
                button.className = "suggestion-btn bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-1 px-3 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors";
                button.textContent = item;
                suggestionsContainer.appendChild(button);
            });
        }
    } catch (e) {
        console.error("Error parsing suggestions:", e);
        status.textContent = "Could not get suggestions.";
    } finally {
        setLoading(suggestButton, false);
    }
}

async function handleSearch(criteria) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(criteria)
        });
        if (!response.ok) throw new Error('Search failed.');

        const results = await response.json();
        displaySearchResults(results);

    } catch (e) {
        console.error("Error during search:", e);
        searchResultsEl.innerHTML = `<p class="text-red-500">Could not perform search.</p>`;
        searchModal.classList.remove('hidden');
    }
}

function displaySearchResults(results) {
    searchResultsEl.innerHTML = '';
    if (results.length === 0) {
        searchResultsEl.innerHTML = `<p class="text-gray-500 dark:text-gray-400">No products found matching your criteria.</p>`;
    } else {
        const resultList = document.createElement('ul');
        resultList.className = 'space-y-3';
        results.forEach(product => {
            const li = document.createElement('li');
            li.className = 'flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg';
            li.innerHTML = `
                <div>
                    <p class="font-medium">${product.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${product.brand} - $${product.price.toFixed(2)}</p>
                </div>
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded-lg text-sm add-from-search-btn" data-item-name="${product.name}">Add</button>`;
            resultList.appendChild(li);
        });
        searchResultsEl.appendChild(resultList);
    }
    searchResultsEl.querySelectorAll('.add-from-search-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            addItem(e.target.dataset.itemName);
            searchModal.classList.add('hidden');
        });
    });
    searchModal.classList.remove('hidden');
}

// --- UI & Utility Functions ---
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;
    } else {
        button.disabled = false;
        if (button === voiceButton) button.innerHTML = `<i class="fas fa-microphone"></i>`;
        else if (button === recipeButton) button.textContent = '✨ Get Recipe Ideas';
        else if (button === suggestButton) button.textContent = '✨ Suggest More';
    }
}

function updateButtonsState() {
    const hasItems = shoppingList.children.length > 1; // 1 because empty message is a child
    recipeButton.disabled = !hasItems;
    suggestButton.disabled = !hasItems;
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    @keyframes fade-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }
    .animate-fade-out { animation: fade-out 0.3s ease-in forwards; }
`;
document.head.appendChild(style);

// Initial state
updateButtonsState();