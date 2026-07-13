import { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import galnexaLogo from "./assets/heading.png";
import logo from "./assets/logo.png";
gsap.registerPlugin(useGSAP);
const PER_PAGE = 30;
function App() {
  const [pics, setPics] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // References for GSAP animation scopes
  const appRef = useRef(null);
  const galleryRef = useRef(null);
  /*
   * Header animation
   * Runs once when App mounts
   */
  useGSAP(
    () => {
      const headerTimeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      headerTimeline
        .from(".header-container", {
          y: -40,
          autoAlpha: 0,
          duration: 0.8,
        })
        .from(
          ".brand-icon",
          {
            scale: 0.4,
            rotation: -25,
            autoAlpha: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
          },
          "-=0.4"
        )
        .from(
          ".brand-wordmark",
          {
            x: -25,
            autoAlpha: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".nav-link",
          {
            y: -15,
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.12,
          },
          "-=0.3"
        );

      // Continuous floating logo animation
      gsap.to(".brand-icon", {
        y: -4,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    {
      scope: appRef,
    }
  );

  /*
   * Gallery animation
   * Runs whenever the pics array changes
   */
  useGSAP(
    () => {
      if (pics.length === 0) return;

      const galleryTimeline = gsap.timeline();

      galleryTimeline
        .fromTo(
          ".gallery-card",
          {
            y: 60,
            scale: 0.94,
            autoAlpha: 0,
          },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "transform",
          }
        )
        .fromTo(
          ".pagination",
          {
            y: 20,
            autoAlpha: 0,
          },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.25"
        );
    },
    {
      scope: galleryRef,
      dependencies: [pics],
      revertOnUpdate: true,
    }
  );

  /*
   * Pexels API request
   * Runs when the page number changes
   */
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
    <main
      ref={appRef}
      className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-6 lg:px-10"
    >
      <header className="header-container sticky top-0 z-50 flex w-full items-center justify-between border-b border-white/10 bg-neutral-950/90 px-3 py-3 backdrop-blur-xl sm:px-5">
  {/* Logo section */}
  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    <img
      src={logo}
      alt="Galnexa icon"
      className="brand-icon h-10 w-10 shrink-0 object-contain sm:h-14 sm:w-14"
    />

    <img
      src={galnexaLogo}
      alt="Galnexa"
      className="brand-wordmark h-8 w-24 object-contain sm:h-10 sm:w-36"
    />
  </div>

  {/* Navigation */}
  <nav className="flex shrink-0 items-center gap-2 font-poppins text-xs sm:gap-4 sm:text-sm">
    <a
      href="#gallery"
      className="rounded-full px-3 py-2 text-neutral-300 transition hover:bg-white/10 hover:text-white sm:px-4"
    >
      Gallery
    </a>

    <a
      href="#about"
      className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 font-medium text-cyan-300 transition hover:border-cyan-300 hover:bg-cyan-400/20 hover:text-white sm:px-5"
    >
      About
    </a>
  </nav>
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

      <div ref={galleryRef}>
        <section
          id="gallery"
          aria-busy={loading}
          className={`mt-10 grid grid-cols-1 gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${loading ? "opacity-50" : "opacity-100"
            }`}
        >
          {pics.map((pic) => (
            <article
              key={pic.id}
              className="gallery-card group overflow-hidden rounded-xl border border-white/5 bg-neutral-900 shadow-lg"
            >
              <div className="overflow-hidden">
                <img
                  src={pic.src.medium}
                  srcSet={`
                    ${pic.src.medium} 350w,
                    ${pic.src.large} 940w,
                    ${pic.src.large2x} 1880w
                  `}
                  sizes="(max-width: 640px) 100vw,
                         (max-width: 1024px) 50vw,
                         33vw"
                  alt={
                    pic.alt ||
                    `Photo by ${pic.photographer}`
                  }
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
          className="pagination mx-auto mt-10 flex max-w-md items-center justify-between"
        >
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={page === 1 || loading}
            className="rounded-lg bg-neutral-800 px-5 py-2.5 font-semibold font-poppins transition hover:scale-105 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
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
            className="rounded-lg bg-neutral-800 px-5 py-2.5 font-semibold font-poppins  transition hover:scale-105 hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            Next
          </button>
        </nav>
        <section
  id="about"
  className="mx-auto mt-24 max-w-4xl scroll-mt-28 rounded-3xl border border-white/10 bg-neutral-900/70 px-6 py-12 text-center backdrop-blur-xl sm:px-12"
>
  <p className="font-poppins text-xs uppercase tracking-[0.35em] text-cyan-400">
    About Galnexa
  </p>

  <h2 className="mt-4 font-poppins text-3xl font-bold text-white sm:text-4xl">
    Discover beautiful moments in every frame
  </h2>

  <p className="mx-auto mt-5 max-w-2xl font-poppins leading-7 text-neutral-400">
    Galnexa is a modern photo gallery application built with React, Tailwind
    CSS, Axios and the Pexels API. It allows users to explore a curated
    collection of high-quality photographs with smooth animations and simple
    pagination.
  </p>

  <div className="mt-8 flex flex-wrap justify-center gap-3">
    {["React", "Tailwind CSS", "Axios", "GSAP", "Pexels API"].map(
      (technology) => (
        <span
          key={technology}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-poppins text-sm text-neutral-300"
        >
          {technology}
        </span>
      )
    )}
  </div>
</section>

        {pics.length > 0 && (
          <p className="mt-10 text-center font-poppins text-sm text-neutral-500">
            Photos provided by Pexels
          </p>
        )}
      </div>
    </main>
  );
}

export default App;