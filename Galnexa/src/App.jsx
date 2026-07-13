import { useState } from "react";

function App() {
  const [pics, setPics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    try {
      setLoading(true);
      setError("");

      const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

      if (!apiKey) {
        throw new Error("Pexels API key is missing");
      }

      const response = await fetch(
        "https://api.pexels.com/v1/curated?page=1&per_page=80",
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      console.log(data);
      setPics(data.photos);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-5 py-5 text-white">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-green-700 px-4 py-2 font-montserrat font-bold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Loading..." : "Get Pics"}
      </button>

      {error && (
        <p className="mt-4 font-poppins text-red-400">
          {error}
        </p>
      )}

      <section className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pics.map((pic) => (
          <article
            key={pic.id}
            className="group overflow-hidden rounded-xl bg-neutral-900"
          >
            <img
              src={pic.src.large}
              alt={pic.alt || `Photo by ${pic.photographer}`}
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />

            <div className="p-4">
              <p className="font-poppins text-sm text-neutral-300">
                Photo by{" "}
                <a
                  href={pic.photographer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-white"
                >
                  {pic.photographer}
                </a>
              </p>
            </div>
          </article>
        ))}
      </section>

      {pics.length > 0 && (
        <p className="mt-8 text-center font-poppins text-sm text-neutral-500">
          Photos provided by Pexels
        </p>
      )}
    </main>
  );
}

export default App;