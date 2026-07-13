import { useEffect, useState } from "react";
import axios from "axios";

const PER_PAGE = 30;

function App() {
  const [pics, setPics] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPics() {
      try {
        setLoading(true);
        setError("");

        const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

        if (!apiKey) {
          throw new Error("Pexels API key is missing");
        }

        const { data } = await axios.get(
          "https://api.pexels.com/v1/curated",
          {
            params: {
              page,
              per_page: PER_PAGE,
            },
            headers: {
              Authorization: apiKey,
            },
            signal: controller.signal,
          }
        );

        setPics(data.photos ?? []);
        setHasNextPage(Boolean(data.next_page));

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } catch (error) {
        // Ignore errors caused by request cancellation
        if (
          error.name === "CanceledError" ||
          error.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error(error);

        setError(
          error.response?.data?.error ||
            error.message ||
            "Unable to load photos"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPics();

    return () => {
      controller.abort();
    };
  }, [page]);

  function goToPreviousPage() {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }

  function goToNextPage() {
    setPage((currentPage) => currentPage + 1);
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <header className="text-center">
        <h1 className="font-poppins text-4xl font-bold text-neutral-100 sm:text-5xl">
          Galnexa
        </h1>

        <p className="mx-auto mt-3 max-w-xl font-poppins text-sm text-neutral-500 sm:text-base">
          Browse through a curated collection of beautiful photos
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="mx-auto mt-6 max-w-xl rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center font-poppins text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {loading && pics.length === 0 && (
        <p className="mt-10 text-center font-poppins text-neutral-400">
          Loading photos...
        </p>
      )}

      <section
        aria-busy={loading}
        className={`mt-10 grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {pics.map((pic) => (
          <article
            key={pic.id}
            className="group overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-lg"
          >
            <div className="overflow-hidden">
              <img
                src={pic.src.medium}
                srcSet={`
                  ${pic.src.medium} 350w,
                  ${pic.src.large} 940w,
                  ${pic.src.large2x} 1880w
                `}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={pic.alt || `Photo by ${pic.photographer}`}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="p-4">
              <p className="font-poppins text-sm text-neutral-300">
                Photo by{" "}
                <a
                  href={pic.photographer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline decoration-neutral-600 underline-offset-4 transition hover:text-white"
                >
                  {pic.photographer}
                </a>
              </p>
            </div>
          </article>
        ))}
      </section>

      <nav
        aria-label="Gallery pagination"
        className="mx-auto mt-10 flex max-w-md items-center justify-between"
      >
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={page === 1 || loading}
          className="rounded-lg bg-neutral-800 px-5 py-2.5 font-montserrat font-semibold transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="font-poppins text-sm text-neutral-400">
          Page {page}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={!hasNextPage || loading}
          className="rounded-lg bg-neutral-800 px-5 py-2.5 font-montserrat font-semibold transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </nav>

      {pics.length > 0 && (
        <p className="mt-10 text-center font-poppins text-sm text-neutral-500">
          Photos provided by Pexels
        </p>
      )}
    </main>
  );
}

export default App;