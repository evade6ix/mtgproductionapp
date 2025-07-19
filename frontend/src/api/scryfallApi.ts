export interface Card {
  id: string;
  name: string;
  set_name: string;
  image_uris: {
    normal: string;
  };
}

export async function fetchCards(query: string): Promise<Card[]> {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error("Error fetching cards from Scryfall:", err);
    return [];
  }
}
