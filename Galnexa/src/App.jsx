import { useState } from "react";

function App() {
  const [pics, setPics] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const response = await fetch(
        "https://picsum.photos/v2/list?page=1&limit=30"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      console.log(data);
      setPics(data);
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-5 text-white">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-green-700 px-4 py-2 font-montserrat font-bold text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading..." : "Get Pics"}
      </button>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pics.map((pic) => (
          <div
            key={pic.id}
            className="overflow-hidden rounded-lg bg-neutral-900"
          >
            <img
              src={pic.download_url}
              alt={`Photograph by ${pic.author}`}
              className="h-72 w-full object-cover"
              loading="lazy"
            />

            <p className="p-3 font-montserrat text-sm text-neutral-300">
              Photo by {pic.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;