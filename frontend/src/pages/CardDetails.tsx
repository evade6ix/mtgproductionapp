import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api/config";

interface Card {
  id: string;
  name: string;
  set_name: string;
  image_uris: {
    normal: string;
  };
  oracle_text?: string;
  prices?: {
    usd?: string;
    usd_foil?: string;
  };
  legalities?: Record<string, string>;
}

export default function CardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.scryfall.com/cards/${id}`);
        const data = await res.json();
        setCard(data);
      } catch (err) {
        console.error("Error fetching card:", err);
      }
      setLoading(false);
    };

    fetchCard();
  }, [id]);

  const addToCollection = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("You must be logged in to add to collection.");
      return;
    }

    const payload = {
      scryfall_id: card?.id,
      name: card?.name,
      set_name: card?.set_name,
      image_url: card?.image_uris.normal,
      price: parseFloat(card?.prices?.usd || "0"),
    };

    try {
      const res = await fetch(`${API_URL}/users/me/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add card");

      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (loading) return <p className="p-6">Loading card details...</p>;
  if (!card) return <p className="p-6">Card not found.</p>;

  // Split legalities by status
  const legal = Object.entries(card.legalities || {}).filter(([_, v]) => v === "legal").sort();
  const notLegal = Object.entries(card.legalities || {}).filter(([_, v]) => v === "not_legal").sort();
  const banned = Object.entries(card.legalities || {}).filter(([_, v]) => v === "banned").sort();

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white p-8">
      <button
        className="mb-6 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-10 items-start justify-center">
        {/* Card Details */}
        <div className="order-2 md:order-1 backdrop-blur-md bg-gray-800/70 rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <h1 className="text-5xl font-extrabold mb-2">{card.name}</h1>
          <p className="text-lg text-gray-300 mb-1">Set: {card.set_name}</p>
          <p className="text-2xl text-green-400 font-bold mb-4">
            ${card.prices?.usd ? `${card.prices.usd} USD` : "N/A"}
          </p>
          <p className="text-lg mb-6 leading-relaxed">{card.oracle_text}</p>

          <h2 className="text-2xl font-semibold mb-4">Legalities</h2>
          <div className="space-y-4">
            {/* Legal */}
            {legal.length > 0 && (
              <div>
                <h3 className="text-xl text-green-400 font-bold mb-2">Legal In</h3>
                <div className="flex flex-wrap gap-2">
                  {legal.map(([format]) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-green-600/80 text-white shadow"
                    >
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Not Legal */}
            {notLegal.length > 0 && (
              <div>
                <h3 className="text-xl text-red-400 font-bold mb-2">Not Legal In</h3>
                <div className="flex flex-wrap gap-2">
                  {notLegal.map(([format]) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-red-600/80 text-white shadow"
                    >
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Banned */}
            {banned.length > 0 && (
              <div>
                <h3 className="text-xl text-yellow-400 font-bold mb-2">Banned In</h3>
                <div className="flex flex-wrap gap-2">
                  {banned.map(([format]) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/80 text-black shadow"
                    >
                      {format.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={addToCollection}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-all duration-200"
            >
              Add to Collection
            </button>
            <button
              disabled
              className="px-6 py-2 bg-gray-600 rounded-lg cursor-not-allowed"
            >
              Add to Deck (coming soon)
            </button>
          </div>

          {message && (
            <p className="mt-4 text-yellow-400 font-medium">{message}</p>
          )}
        </div>

        {/* Card Image */}
        <div className="order-1 md:order-2">
          <img
            src={card.image_uris.normal}
            alt={card.name}
            className="rounded-xl shadow-2xl hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
}
