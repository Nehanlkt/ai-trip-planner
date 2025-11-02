const tripForm = document.getElementById("tripForm");
const tripList = document.getElementById("tripList");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackList = document.getElementById("feedbackList");
const attractionsList = document.getElementById("attractionsList");

// ====== STATIC TOP ATTRACTIONS ======
const attractions = {
  Paris: ["Eiffel Tower", "Louvre Museum", "Notre Dame Cathedral"],
  London: ["Big Ben", "London Eye", "Buckingham Palace"],
  Tokyo: ["Tokyo Tower", "Shibuya Crossing", "Senso-ji Temple"],
  Delhi: ["Red Fort", "Qutub Minar", "India Gate"]
};

// ====== LOAD TOP ATTRACTIONS ======
document.getElementById("destination").addEventListener("input", (e) => {
  const city = e.target.value.trim();
  const list = attractions[city] || [];
  attractionsList.innerHTML = list.length
    ? list.map(a => `<li>${a}</li>`).join("")
    : "<li>No data for this city.</li>";
});

// ====== ADD TRIP ======
const addTripHandler = (e) => {
  e.preventDefault();
  const destination = document.getElementById("destination").value;
  const days = Number(document.getElementById("days").value);
  const notes = document.getElementById("notes").value;
  const budget = Number(document.getElementById("budget").value);
  const fileInput = document.getElementById("image");

  const trips = JSON.parse(localStorage.getItem("trips") || "[]");

  const saveTrip = (image = "") => {
    trips.push({ destination, days, notes, budget, image, visited: false });
    localStorage.setItem("trips", JSON.stringify(trips));
    loadTrips();
    tripForm.reset();
  };

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => saveTrip(reader.result);
    reader.readAsDataURL(file);
  } else {
    saveTrip();
  }
};


// Attach main handler
tripForm.addEventListener("submit", addTripHandler);



// ====== LOAD TRIPS ======
function loadTrips() {
  let trips = JSON.parse(localStorage.getItem("trips") || "[]");

  // ====== Search and Filter ======
  const searchQuery = document.getElementById("searchBox")?.value.toLowerCase() || "";
  const filterType = document.getElementById("dayFilter")?.value || "all";

  trips = trips.filter((t) => {
    const matchSearch = t.destination.toLowerCase().includes(searchQuery);
    let matchFilter = true;
    if (filterType === "short") matchFilter = t.days <= 3;
    else if (filterType === "medium") matchFilter = t.days >= 4 && t.days <= 7;
    else if (filterType === "long") matchFilter = t.days >= 8;
    return matchSearch && matchFilter;
  });
document.getElementById("sortSelect").addEventListener("change", loadTrips);

  // ====== Sorting ======
  const sortValue = document.getElementById("sortSelect")?.value || "none";
  if (sortValue === "name") {
    trips.sort((a, b) => a.destination.localeCompare(b.destination));
  } else if (sortValue === "days") {
    trips.sort((a, b) => a.days - b.days);
  }

  // ====== Summary ======
  const totalTrips = trips.length;
  const totalDays = trips.reduce((sum, t) => sum + Number(t.days), 0);
  document.getElementById("tripSummary").textContent = `Total trips: ${totalTrips} | Total days: ${totalDays}`;

  // ====== Render Trips ======
  tripList.innerHTML = trips.length
    ? trips.map(
        (t, index) => `
        <li class="${t.visited ? "visited" : ""}">
          <strong>${t.destination}</strong> - ${t.days} days
          ${t.image ? `<br><img src="${t.image}" alt="${t.destination}">` : ""}
          <p>${t.notes || ""}</p>
          <p><strong>Estimated Budget:</strong> ₹${t.days * (t.budget || 0)}</p>
          <button onclick="toggleVisited(${index})">${t.visited ? "✅ Visited" : "Mark as Visited"}</button>
          <button onclick="editTrip(${index})">✏️ Edit</button>
          <button onclick="deleteTrip(${index})">🗑️ Delete</button>
        </li>`
      ).join("")
    : "<p>No matching trips found.</p>";
}


  // Apply search + filter logic
  const filteredTrips = trips.filter((t) => {
    const matchSearch = t.destination.toLowerCase().includes(searchQuery);

    let matchFilter = true;
    if (filterType === "short") matchFilter = t.days <= 3;
    else if (filterType === "medium") matchFilter = t.days >= 4 && t.days <= 7;
    else if (filterType === "long") matchFilter = t.days >= 8;

    return matchSearch && matchFilter;
  });

  // Render filtered trips
  tripList.innerHTML = filteredTrips.length
    ? filteredTrips.map(
        (t, index) => `
        <li>
          <strong>${t.destination}</strong> - ${t.days} days
          ${t.image ? `<br><img src="${t.image}" alt="${t.destination}">` : ""}
          <p>${t.notes || ""}</p>
          <button onclick="editTrip(${index})">✏️ Edit</button>
          <button onclick="deleteTrip(${index})">🗑️ Delete</button>
        </li>`
      ).join("")
    : "<p>No matching trips found.</p>";



// ====== DELETE TRIP ======
function deleteTrip(index) {
  if (confirm("Are you sure you want to delete this trip?")) {
    const trips = JSON.parse(localStorage.getItem("trips") || "[]");
    trips.splice(index, 1);
    localStorage.setItem("trips", JSON.stringify(trips));
    loadTrips();
  }
}

function toggleVisited(index) {
  const trips = JSON.parse(localStorage.getItem("trips") || "[]");
  trips[index].visited = !trips[index].visited;
  localStorage.setItem("trips", JSON.stringify(trips));
  loadTrips();
}

// ====== EDIT TRIP ======
function editTrip(index) {
  const trips = JSON.parse(localStorage.getItem("trips") || "[]");
  const trip = trips[index];

  // Fill form with current values
  document.getElementById("destination").value = trip.destination;
  document.getElementById("days").value = trip.days;
  document.getElementById("notes").value = trip.notes;

  // Scroll to top where form is
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Temporarily change form button text
  const button = tripForm.querySelector("button[type='submit']");
  button.textContent = "Update Trip";

  // Replace event handler
  tripForm.onsubmit = (e) => {
    e.preventDefault();
    trip.destination = document.getElementById("destination").value;
    trip.days = document.getElementById("days").value;
    trip.notes = document.getElementById("notes").value;

    const fileInput = document.getElementById("image");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        trip.image = reader.result;
        trips[index] = trip;
        localStorage.setItem("trips", JSON.stringify(trips));
        loadTrips();
        resetForm();
      };
      reader.readAsDataURL(file);
    } else {
      trips[index] = trip;
      localStorage.setItem("trips", JSON.stringify(trips));
      loadTrips();
      resetForm();
    }
  };
}

// ====== RESET FORM ======
function resetForm() {
  tripForm.reset();
  tripForm.querySelector("button[type='submit']").textContent = "Add Trip";
  tripForm.onsubmit = addTripHandler; // restore original handler
}

// ====== FEEDBACK ======
feedbackForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  feedbacks.push({ name, message, date: new Date().toLocaleDateString() });
  localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
  feedbackForm.reset();
  loadFeedback();
});

// ====== FILTER & SEARCH EVENTS ======
document.getElementById("searchBox").addEventListener("input", loadTrips);
document.getElementById("dayFilter").addEventListener("change", loadTrips);


function loadFeedback() {
  const feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
  feedbackList.innerHTML = feedbacks.map(
    f => `<p><strong>${f.name}</strong> (${f.date}): ${f.message}</p>`
  ).join("");
}

// ====== INITIAL LOAD ======
window.onload = () => {
  loadTrips();
  loadFeedback();
};

// ====== DOWNLOAD ITINERARY AS PDF ======
document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  const trips = JSON.parse(localStorage.getItem("trips") || "[]");
  if (trips.length === 0) {
    alert("No trips to download!");
    return;
  }

  // Create a printable version of trips
  let printableContent = `
    <html>
    <head>
      <title>My Trip Itinerary</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        h1 { color: #004080; }
        img { width: 200px; height: 120px; border-radius: 8px; margin: 10px 0; }
        .trip { border-bottom: 1px solid #ccc; margin-bottom: 20px; padding-bottom: 10px; }
      </style>
    </head>
    <body>
      <h1>🧳 My Trip Itinerary</h1>
  `;

  trips.forEach((t, i) => {
    printableContent += `
      <div class="trip">
        <h2>${i + 1}. ${t.destination}</h2>
        <p><strong>Days:</strong> ${t.days}</p>
        <p><strong>Notes:</strong> ${t.notes || "None"}</p>
        ${t.image ? `<img src="${t.image}" alt="${t.destination}">` : ""}
      </div>
    `;
  });

  printableContent += `
      <p style="text-align:center; font-size:12px;">Generated by Trip Planner 🗺️</p>
    </body></html>
  `;

  // Open a new window and trigger print dialog
  const printWindow = window.open("", "_blank");
  printWindow.document.write(printableContent);
  printWindow.document.close();
  printWindow.print();
});
