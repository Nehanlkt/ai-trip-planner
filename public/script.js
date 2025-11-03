document.querySelector("#tripForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const destination = document.querySelector("#destination").value;
  const days = document.querySelector("#days").value;
  const budget = document.querySelector("#budget").value;

  const response = await fetch("/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination, days, budget }),
  });

  const result = await response.json();

  document.querySelector("#result").innerHTML = `
    <h3>Trip Plan for ${result.destination}</h3>
    <p><strong>Total Budget:</strong> ₹${result.total_budget}</p>
  `;
});
