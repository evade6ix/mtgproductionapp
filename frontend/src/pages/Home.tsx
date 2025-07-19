import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../api/config";

interface Card {
  id: string;
  name: string;
  set_name: string;
  image_uris: {
    normal: string;
  };
  prices?: {
    usd?: string;
    usd_foil?: string;
  };
}

export default function Home() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get query and page from URL
  const defaultQuery = searchParams.get("q") || "black lotus";
  const defaultPage = parseInt(searchParams.get("page") || "1", 10);
  const [query, setQuery] = useState(defaultQuery);
  const [page, setPage] = useState(defaultPage);
  const [totalPages, setTotalPages] = useState(1);

  const CARDS_PER_PAGE = 20;

  const searchCards = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          searchQuery
        )}&unique=prints&order=released`
      );
      const data = await res.json();

      const fetchedCards: Card[] = data.data || [];
      setAllCards(fetchedCards);

      // Calculate total pages based on 20 per page
      setTotalPages(Math.ceil(fetchedCards.length / CARDS_PER_PAGE));

      // Set first slice
      const startIdx = (defaultPage - 1) * CARDS_PER_PAGE;
      const endIdx = startIdx + CARDS_PER_PAGE;
      setCards(fetchedCards.slice(startIdx, endIdx));
    } catch (err) {
      console.error("Error fetching Scryfall data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    searchCards(query);
  }, [query]);

  const handleSearch = () => {
    setPage(1);
    setSearchParams({ q: query, page: "1" });
    searchCards(query);
  };

  const handlePageChange = (newPage: number) => {
    const goingForward = newPage > page; // detect direction

    setPage(newPage);
    setSearchParams({ q: query, page: newPage.toString() });

    const startIdx = (newPage - 1) * CARDS_PER_PAGE;
    const endIdx = startIdx + CARDS_PER_PAGE;
    setCards(allCards.slice(startIdx, endIdx));

    // Scroll logic
    if (goingForward) {
      window.scrollTo({ top: 0, behavior: "smooth" }); // Next page → top
    }
    // Previous page → no scroll (stay at position)
  };

  const addToCollection = async (card: Card) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add to collection.");
      return;
    }

    const payload = {
      scryfall_id: card.id,
      name: card.name,
      set_name: card.set_name,
      image_url: card.image_uris.normal,
      price: parseFloat(card.prices?.usd || "0"),
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

      if (!res.ok) throw new Error("Failed to add card.");
      alert(`${card.name} added to your collection!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">MTG Card Search</h1>
      <div className="flex mb-4">
        <input
          type="text"
          className="flex-1 p-2 rounded text-black"
          placeholder="Search for a card..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="ml-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-gray-800 p-3 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
          >
            <img
              src={card.image_uris?.normal}
              alt={card.name}
              className="rounded mb-2"
              onClick={() => navigate(`/card/${card.id}`)}
            />
            <h2 className="text-lg font-bold">{card.name}</h2>
            <p className="text-sm text-gray-400 mb-1">{card.set_name}</p>
            <p className="text-green-400 font-semibold mb-2">
              ${card.prices?.usd ? `${card.prices.usd} USD` : "N/A"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => addToCollection(card)}
                className="flex-1 px-2 py-1 bg-purple-600 text-xs rounded hover:bg-purple-700"
              >
                Add to Collection
              </button>
              <button
                disabled
                className="flex-1 px-2 py-1 bg-gray-600 text-xs rounded cursor-not-allowed"
              >
                Add to Deck
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 space-x-4">
        <button
          onClick={() => handlePageChange(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 bg-gray-800 rounded">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
