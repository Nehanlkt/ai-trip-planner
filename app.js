// Wait for the DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {

    // --- SELECTORS ---
    // Get all the HTML elements we need to interact with
    const loginBtn = document.getElementById('login-btn');
    const loginPrompt = document.getElementById('login-prompt');
    const plannerTools = document.getElementById('planner-tools');

    const newTripForm = document.getElementById('new-trip-form');
    const searchForm = document.getElementById('search-form');
    
    const itineraryTitle = document.getElementById('itinerary-title');
    const itineraryContainer = document.getElementById('itinerary-days-container');
    const searchResultsContainer = document.getElementById('search-results');

    // --- APP STATE ---
    // In a real app, this would be in a database (like Firebase)
    let state = {
        isLoggedIn: false,
        currentTrip: null, // Will hold { destination, numDays }
        itinerary: {} // Will hold { day1: [], day2: [], ... }
    };

    // --- EVENT LISTENERS ---

    // 1. Login Button
    loginBtn.addEventListener('click', toggleLogin);

    // 2. New Trip Form
    newTripForm.addEventListener('submit', createNewTrip);
    
    // 3. Search Form
    searchForm.addEventListener('submit', searchPlaces);

    // --- FUNCTIONS ---

    /**
     * Toggles the user's login state.
     * In a real app, this would show a modal and call an authentication service.
     */
    function toggleLogin() {
        state.isLoggedIn = !state.isLoggedIn;
        
        if (state.isLoggedIn) {
            // Show planner tools, hide login prompt
            plannerTools.classList.remove('hidden');
            loginPrompt.classList.add('hidden');
            loginBtn.textContent = 'Logout';
            loginBtn.style.backgroundColor = '#dc3545'; // Red for logout
        } else {
            // Hide planner tools, show login prompt
            plannerTools.classList.add('hidden');
            loginPrompt.classList.remove('hidden');
            loginBtn.textContent = 'Login';
            loginBtn.style.backgroundColor = '#28a745'; // Green for login
            
            // Reset the app state
            state.currentTrip = null;
            state.itinerary = {};
            renderItinerary(); // Clear the UI
        }
    }

    /**
     * Handles the "New Trip" form submission.
     */
    function createNewTrip(event) {
        event.preventDefault(); // Stop the form from reloading the page

        const destination = document.getElementById('destination').value;
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);

        // Basic validation
        if (!destination || !startDate || !endDate || endDate < startDate) {
            alert('Please fill out all fields correctly. End date must be after start date.');
            return;
        }

        // Calculate number of days
        const timeDiff = endDate.getTime() - startDate.getTime();
        const numDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include start day

        // Update the app state
        state.currentTrip = { destination, numDays };
        state.itinerary = {};
        for (let i = 1; i <= numDays; i++) {
            state.itinerary[`day${i}`] = []; // Initialize empty array for each day
        }

        // Update the UI
        renderItinerary();
    }
    
    /**
     * Updates the Itinerary section in the HTML based on the current state.
     */
    function renderItinerary() {
        // Clear existing content
        itineraryContainer.innerHTML = '';
        
        if (!state.currentTrip) {
            itineraryTitle.textContent = 'Your Itinerary';
            itineraryContainer.innerHTML = '<p>Your itinerary is empty. Create a new trip to begin!</p>';
            return;
        }

        // Set the main title
        itineraryTitle.textContent = `Your Itinerary: ${state.currentTrip.destination}`;

        // Create HTML for each day
        for (let i = 1; i <= state.currentTrip.numDays; i++) {
            const dayKey = `day${i}`;
            
            // Create the container for the day
            const dayArticle = document.createElement('article');
            dayArticle.className = 'itinerary-day';
            
            // Create the day title
            const dayTitle = document.createElement('h3');
            dayTitle.textContent = `Day ${i}`;
            
            // Create the list for the day's items
            const dayList = document.createElement('ul');
            dayList.className = 'day-list';
            dayList.id = `day-${i}-list`;

            // Add items from the state to the list
            const items = state.itinerary[dayKey];
            if (items.length === 0) {
                dayList.innerHTML = '<li>No items added for this day yet.</li>';
            } else {
                items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${item.name}</span>
                        <button class="remove-item" data-day="${dayKey}" data-index="${index}">Remove</button>
                    `;
                    dayList.appendChild(li);
                });
            }
            
            // Assemble the day's HTML
            dayArticle.appendChild(dayTitle);
            dayArticle.appendChild(dayList);
            itineraryContainer.appendChild(dayArticle);
        }
        
        // Add event listeners to all new "Remove" buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', removeItemFromItinerary);
        });
    }

    /**
     * Handles the "Search" form submission.
     */
    function searchPlaces(event) {
        event.preventDefault();
        
        if (!state.currentTrip) {
            alert('Please create a trip before searching for places.');
            return;
        }

        const query = document.getElementById('search-input').value;
        if (!query) return;

        // --- FAKE API CALL ---
        // In a real app, you would use fetch() to call the Google Places API.
        // Here, we just simulate the results.
        const fakeResults = [
            { id: 'place1', name: `${query} Example 1 (Tokyo Tower)` },
            { id: 'place2', name: `${query} Example 2 (Sushi Joint)` },
            { id: 'place3', name: `${query} Example 3 (Shinjuku Garden)` }
        ];

        // Clear previous results
        searchResultsContainer.innerHTML = '';

        // Display new results
        fakeResults.forEach(place => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            
            // We need to add buttons for each day of the trip
            let buttonsHTML = '';
            for (let i = 1; i <= state.currentTrip.numDays; i++) {
                // We add data attributes to store the place info on the button
                buttonsHTML += `<button class="add-to-day" 
                                    data-day="day${i}" 
                                    data-place-id="${place.id}" 
                                    data-place-name="${place.name}">
                                    Add to Day ${i}
                                </button>`;
            }
            
            resultDiv.innerHTML = `
                <h4>${place.name}</h4>
                <div>${buttonsHTML}</div>
            `;
            searchResultsContainer.appendChild(resultDiv);
        });

        // Add event listeners to all the new "Add" buttons
        document.querySelectorAll('.add-to-day').forEach(button => {
            button.addEventListener('click', addItemToItinerary);
        });
    }

    /**
     * Adds a clicked item to the itinerary state.
     */
    function addItemToItinerary(event) {
        const button = event.target;
        const day = button.dataset.day; // "day1"
        const placeId = button.dataset.placeId;
        const placeName = button.dataset.placeName;

        const newItem = { id: placeId, name: placeName };

        // Add to our state
        state.itinerary[day].push(newItem);

        // Re-render the itinerary to show the new item
        renderItinerary();
    }
    
    /**
     * Removes an item from the itinerary state.
     */
    function removeItemFromItinerary(event) {
        const button = event.target;
        const day = button.dataset.day;     // "day1"
        const index = button.dataset.index; // 0, 1, 2...
        
        // Remove the item from the array in our state
        state.itinerary[day].splice(index, 1);
        
        // Re-render the entire itinerary
        renderItinerary();
    }

});