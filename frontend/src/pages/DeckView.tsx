import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";

interface Card {
  scryfall_id: string;
  name: string;
  set_name: string;
  image_url: string;
  price: number;
}

interface Deck {
  name: string;
  cards: Card[];
}

export default function DeckView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. Redirecting to login...");
      navigate("/login");
      return;
    }

    const fetchDeck = async () => {
      try {
        const res = await fetch(`${API_URL}/users/me/decks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch deck");
        const data = await res.json();
        setDeck(data);
      } catch (err) {
        console.error("Error fetching deck:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [id, navigate]);

  const renameDeck = async () => {
    const newName = prompt("Enter new deck name:");
    if (!newName || !newName.trim()) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/users/me/decks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newName.trim()),
      });
      if (!res.ok) throw new Error("Failed to rename deck");
      setDeck((prev) => prev ? { ...prev, name: newName.trim() } : prev);
      setMessage("Deck renamed successfully.");
    } catch (err) {
      console.error("Error renaming deck:", err);
    }
  };

  const deleteDeck = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this deck?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/users/me/decks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete deck");
      navigate("/profile");
    } catch (err) {
      console.error("Error deleting deck:", err);
    }
  };

  const removeCard = async (scryfall_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You must be logged in.");

    try {
      const res = await fetch(
        `${API_URL}/users/me/decks/${id}/cards/${scryfall_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to remove card");

      if (deck) {
        setDeck({
          ...deck,
          cards: deck.cards.filter((card) => card.scryfall_id !== scryfall_id),
        });
      }
      setMessage("Card removed from deck.");
    } catch (err) {
      console.error("Error removing card:", err);
    }
  };

  if (loading) return <p className="p-6">Loading deck...</p>;
  if (!deck) return <p className="p-6">Deck not found.</p>;

  const totalValue = deck.cards.reduce((sum, card) => sum + (card.price || 0), 0);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        ← Back
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">{deck.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={renameDeck}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Rename Deck
          </button>
          <button
            onClick={deleteDeck}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Delete Deck
          </button>
        </div>
      </div>
      <p className="mb-4">💵 Deck Value: ${totalValue.toFixed(2)} USD</p>
      {message && <p className="text-green-400 mb-2">{message}</p>}

      {deck.cards.length === 0 ? (
        <p>This deck has no cards yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {deck.cards.map((card) => (
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
              <button
                onClick={() => removeCard(card.scryfall_id)}
                className="w-full px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
              >
                Remove from Deck
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
