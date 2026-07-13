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
    className="min-h-screen bg-gradient-to-br from-[#f8f7ff] via-white to-[#eefcff] px-4 pb-12 text-slate-900 sm:px-6 lg:px-10"
  >
    {/* Header */}
    <header className="header-container sticky top-0 z-50 flex w-full items-center justify-between border-b border-violet-100 bg-white/80 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Your logo currently has a black background,
            so this wrapper helps it fit the light theme */}
        <div className="brand-icon flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 shadow-md sm:h-14 sm:w-14">
          <img
            src={logo}
            alt="Galnexa icon"
            className="h-full w-full object-cover"
          />
        </div>

        <img
          src={galnexaLogo}
          alt="Galnexa"
          className="brand-wordmark h-8 w-24 object-contain sm:h-10 sm:w-36"
        />
      </div>

      <nav className="flex shrink-0 items-center gap-1 font-poppins text-xs sm:gap-3 sm:text-sm">
        <a
          href="#gallery"
          className="rounded-full px-3 py-2 font-medium text-slate-600 transition duration-300 hover:bg-violet-50 hover:text-violet-700 sm:px-4"
        >
          Gallery
        </a>

        <a
          href="#about"
          className="rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-4 py-2 font-medium text-white shadow-md shadow-violet-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:px-5"
        >
          About
        </a>
      </nav>
    </header>

    {/* Hero heading */}
    <section className="mx-auto max-w-3xl pb-4 pt-14 text-center">
      <p className="font-poppins text-xs font-semibold uppercase tracking-[0.35em] text-violet-500">
        Visual inspiration
      </p>

      <h1 className="mt-4 font-cormorant text-5xl font-semibold leading-none text-slate-900 sm:text-6xl lg:text-7xl">
        Discover beauty in
        <span className="block bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
          every frame
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl font-poppins leading-7 text-slate-500">
        Explore a carefully curated collection of beautiful photographs,
        creative perspectives and inspiring visual moments.
      </p>
    </section>

    {/* Error */}
    {error && (
      <div
        role="alert"
        className="mx-auto mt-6 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-center font-poppins text-sm text-red-600 shadow-sm"
      >
        {error}
      </div>
    )}

    {/* Loading */}
    {loading && pics.length === 0 && (
      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

        <p className="font-poppins text-sm text-slate-500">
          Loading beautiful photos...
        </p>
      </div>
    )}

    <div ref={galleryRef}>
      {/* Gallery */}
      <section
        id="gallery"
        aria-busy={loading}
        className={`mt-12 grid scroll-mt-28 grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${
          loading ? "opacity-50" : "opacity-100"
        }`}
      >
        {pics.map((pic) => (
          <article
            key={pic.id}
            className="gallery-card group overflow-hidden rounded-[2rem] border border-white bg-white/80 p-2 shadow-[0_15px_50px_rgba(99,102,241,0.10)] backdrop-blur-md transition duration-500 hover:-translate-y-2 hover:shadow-[0_25px_70px_rgba(99,102,241,0.18)]"
          >
            {/* Image */}
            <div className="relative overflow-hidden rounded-[1.6rem]">
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
                alt={pic.alt || `Photo by ${pic.photographer}`}
                className="h-80 w-full object-cover transition duration-700 group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />

              {/* Soft overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-60 transition group-hover:opacity-80" />

              {/* Category-style label */}
              <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/80 px-3 py-1 font-poppins text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md">
                Curated
              </span>

              {/* Photographer over image */}
              <div className="absolute bottom-0 left-0 w-full p-5">
                <p className="font-poppins text-xs uppercase tracking-[0.2em] text-white/70">
                  Photography
                </p>

                <a
                  href={pic.photographer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-poppins text-lg font-semibold text-white transition hover:text-cyan-200"
                >
                  {pic.photographer}
                </a>
              </div>
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between px-4 py-4">
              <p className="line-clamp-1 font-poppins text-sm text-slate-500">
                {pic.alt || "A beautiful curated photograph"}
              </p>

              <a
                href={pic.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`View photo by ${pic.photographer}`}
                className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-lg text-violet-600 transition duration-300 hover:rotate-45 hover:bg-violet-600 hover:text-white"
              >
                ↗
              </a>
            </div>
          </article>
        ))}
      </section>

      {/* Pagination */}
      <nav
        aria-label="Gallery pagination"
        className="pagination mx-auto mt-14 flex max-w-md items-center justify-between rounded-2xl border border-violet-100 bg-white/80 p-2 shadow-lg shadow-violet-100 backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={page === 1 || loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-montserrat text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Previous
        </button>

        <span className="rounded-xl bg-violet-50 px-4 py-2 font-poppins text-sm font-medium text-violet-700">
          Page {page}
        </span>

        <button
          type="button"
          onClick={goToNextPage}
          disabled={!hasNextPage || loading}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 font-montserrat text-sm font-semibold text-white shadow-md shadow-violet-200 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          Next
        </button>
      </nav>

      {/* About */}
      <section
        id="about"
        className="mx-auto mt-24 max-w-5xl scroll-mt-28 overflow-hidden rounded-[2.5rem] border border-violet-100 bg-white/80 px-6 py-14 shadow-[0_25px_80px_rgba(99,102,241,0.12)] backdrop-blur-xl sm:px-12"
      >
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="font-poppins text-xs font-semibold uppercase tracking-[0.35em] text-violet-500">
              About Galnexa
            </p>

            <h2 className="mt-4 font-cormorant text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
              A modern space for visual discovery
            </h2>

            <p className="mt-5 font-poppins leading-7 text-slate-500">
              Galnexa is a responsive photo gallery built with React,
              Tailwind CSS, Axios, GSAP and the Pexels API. It combines
              curated photography with smooth navigation and subtle
              animations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ["30", "Photos per page"],
              ["100%", "Responsive"],
              ["GSAP", "Smooth motion"],
              ["Pexels", "Photo source"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-cyan-50 p-5"
              >
                <p className="font-poppins text-2xl font-bold text-violet-700">
                  {value}
                </p>

                <p className="mt-1 font-poppins text-xs text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {pics.length > 0 && (
        <footer className="mt-16 text-center">
          <p className="font-poppins text-sm text-slate-400">
            Photos provided by{" "}
            <span className="font-medium text-slate-600">Pexels</span>
          </p>
        </footer>
      )}
    </div>
   
  </main>
);
  
}

export default App;