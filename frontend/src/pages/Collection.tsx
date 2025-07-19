import { useEffect, useState } from "react";
import { API_URL } from "../api/config";

interface Card {
  scryfall_id: string;
  name: string;
  set_name: string;
  image_url: string;
  price: number;
}

interface Deck {
  _id: string;
  name: string;
}

export default function Collection() {
  const [collection, setCollection] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. User not logged in.");
      return;
    }

    const fetchCollection = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/me/collection`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch collection");
        const data = await res.json();
        setCollection(data);
      } catch (err) {
        console.error("Error fetching collection:", err);
      }
      setLoading(false);
    };

    const fetchDecks = async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/decks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch decks");
        const data = await res.json();
        setDecks(data);
      } catch (err) {
        console.error("Error fetching decks:", err);
      }
    };

    fetchCollection();
    fetchDecks();
  }, []);

  const totalCards = collection.length;
  const totalValue = collection.reduce((sum, card) => sum + (card.price || 0), 0);

  const removeCard = async (cardId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(`${API_URL}/users/me/collection/${cardId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove card");
      setCollection(collection.filter((card) => card.scryfall_id !== cardId));
    } catch (err) {
      console.error("Error removing card:", err);
    }
  };

  const addToDeck = async (card: Card, deckId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(`${API_URL}/users/me/decks/${deckId}/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(card),
      });
      if (!res.ok) throw new Error("Failed to add card to deck");
      setMessage(`✅ ${card.name} added to deck successfully.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error adding card to deck:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Collection</h1>
      <p className="mb-2">📦 Total Cards: {totalCards}</p>
      <p className="mb-4">💵 Total Value: ${totalValue.toFixed(2)} USD</p>

      {message && <p className="text-green-400 mb-4">{message}</p>}

      {loading ? (
        <p>Loading collection...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {collection.map((card) => (
            <div
              key={card.scryfall_id}
              className="bg-gray-800 p-3 rounded-lg shadow hover:shadow-lg transition"
            >
              <img
                src={card.image_url}
                alt={card.name}
                className="rounded mb-2"
              />
              <h2 className="text-lg font-bold">{card.name}</h2>
              <p className="text-sm text-gray-400 mb-1">{card.set_name}</p>
              <p className="text-green-400 font-semibold mb-2">
                ${card.price?.toFixed(2)} USD
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => removeCard(card.scryfall_id)}
                  className="w-full px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                >
                  Remove
                </button>
                {decks.length > 0 && (
                  <select
                    onChange={(e) =>
                      e.target.value &&
                      addToDeck(card, e.target.value)
                    }
                    defaultValue=""
                    className="w-full px-3 py-1 bg-gray-700 rounded text-sm text-white"
                  >
                    <option value="" disabled>
                      ➕ Add to Deck
                    </option>
                    {decks.map((deck) => (
                      <option key={deck._id} value={deck._id}>
                        {deck.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
