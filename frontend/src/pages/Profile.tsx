import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";

interface Card {
  id: string;
  name: string;
  set_name: string;
  image_url: string;
  price: number;
}

interface Deck {
  _id: string;
  name: string;
  cards: Card[];
}

export default function Profile() {
  const [collection, setCollection] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const fetchCollection = async (token: string) => {
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
  };

  const fetchDecks = async (token: string) => {
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. Redirecting to login...");
      navigate("/login"); // Redirect if not logged in
      return;
    }

    setLoading(true);
    Promise.all([fetchCollection(token), fetchDecks(token)]).finally(() =>
      setLoading(false)
    );
  }, [navigate]);

  const handleCreateDeck = async () => {
    if (!newDeckName.trim()) {
      setMessage("Deck name cannot be empty.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(`${API_URL}/users/me/decks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newDeckName, cards: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create deck");

      setMessage("Deck created successfully!");
      setNewDeckName("");
      fetchDecks(token); // Refresh list
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const totalCards = collection.length;
  const totalValue = collection.reduce((sum, card) => sum + (card.price || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Account</h1>

      {loading ? (
        <p>Loading your data...</p>
      ) : (
        <>
          {/* Collection Summary */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4 shadow-md">
            <p className="text-lg">
              📦 Total Cards: <span className="font-bold">{totalCards}</span>
            </p>
            <p className="text-lg">
              💵 Collection Value:{" "}
              <span className="font-bold">${totalValue.toFixed(2)} USD</span>
            </p>
            <button
              onClick={() => navigate("/collection")}
              className="mt-2 px-6 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
            >
              Show Collection
            </button>
          </div>

          {/* Create Deck */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-md">
            <h2 className="text-xl font-semibold mb-2">Create a New Deck</h2>
            {message && <p className="text-yellow-400 mb-2">{message}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Deck Name"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="flex-1 p-2 rounded text-black"
              />
              <button
                onClick={handleCreateDeck}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
              >
                Create
              </button>
            </div>
          </div>

          {/* Decks List */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Your Decks</h2>
            {decks.length === 0 ? (
              <p className="text-gray-400">You don’t have any decks yet.</p>
            ) : (
              <ul className="space-y-2">
                {decks.map((deck) => (
                  <li
                    key={deck._id}
                    className="p-3 bg-gray-800 rounded shadow hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/deck/${deck._id}`)}
                  >
                    {deck.name} ({deck.cards.length} cards)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
