import sys, json, random

def plan_trip(data):
    destination = data.get("destination", "Unknown")
    days = int(data.get("days", 1))
    budget = int(data.get("budget", 10000))

    # 🪙 Budget breakdown
    stay = budget * 0.4
    food = budget * 0.3
    travel = budget * 0.2
    misc = budget * 0.1

    # 🧭 Sample attractions (you can expand this list)
    sample_places = {
        "Goa": ["Baga Beach", "Fort Aguada", "Dudhsagar Falls", "Anjuna Market", "Old Goa Churches"],
        "Delhi": ["Red Fort", "India Gate", "Qutub Minar", "Lotus Temple", "Chandni Chowk"],
        "Paris": ["Eiffel Tower", "Louvre Museum", "Notre Dame", "Seine River Cruise", "Montmartre"],
        "Tokyo": ["Shibuya Crossing", "Tokyo Tower", "Asakusa Temple", "Akihabara", "Meiji Shrine"],
        "Unknown": ["Local attractions", "Nearby markets", "Cultural center", "Parks", "Museums"]
    }

    # Pick the right set of places
    places = sample_places.get(destination, sample_places["Unknown"])

    # 🗓️ Generate itinerary (simple random rotation)
    itinerary = []
    for i in range(1, days + 1):
        daily_plan = random.sample(places, min(len(places), 3))
        itinerary.append({
            "day": i,
            "activities": daily_plan,
            "note": random.choice([
                "Enjoy local food and take plenty of photos!",
                "Try to experience the nightlife and local culture.",
                "Plan an early start to cover more attractions.",
                "Spend time exploring lesser-known areas.",
                "Buy souvenirs and support local artisans."
            ])
        })

    # ✨ Suggestions
    suggestions = [
        f"Book stays near city center of {destination} to save travel time.",
        f"Use public transport or rent bikes for easy movement in {destination}.",
        f"Try local street food for an authentic experience in {destination}.",
        f"Plan your travel during off-season to get better deals."
    ]

    # 🧾 Final structured plan
    plan = {
        "destination": destination,
        "days": days,
        "total_budget": budget,
        "allocation": {
            "stay": round(stay),
            "food": round(food),
            "travel": round(travel),
            "misc": round(misc)
        },
        "itinerary": itinerary,
        "suggestions": suggestions
    }

    return plan


if __name__ == "__main__":
    try:
        data = json.loads(sys.stdin.read())
        plan = plan_trip(data)
        print(json.dumps(plan))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
