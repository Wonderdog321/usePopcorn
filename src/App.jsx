import "./App.css";
import { useEffect, useState } from "react";
import NavBar from "./components/NavBar";
import { Search, Results } from "./components/NavBar";
import MainBar from "./components/MainBar";
import {
  Box,
  MovieList,
  WatchedSummary,
  WatchedMovieList,
} from "./components/MainBar";
import Loader from "./components/Loader";
import ErrorMessage from "./components/ErrorMessage";
import MovieDetails from "./components/MovieDetails";

const KEY = "ENTERKEYHERE";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => {
      const exists = watched.some(
        (watchMovie) => watchMovie.imdbId === movie.imdbId
      );
      if (exists) {
        return watched.map((watchMovie) =>
          watchMovie.imdbId === movie.imdbId ? movie : watchMovie
        );
      } else {
        return [...watched, movie];
      }
    });
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
  }
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setError("");
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies.");
          const data = await res.json();
          if (data.Response === "False") {
            throw new Error(data.Error);
          }
          setMovies(data.Search);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </NavBar>
      <MainBar>
        <Box>
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              key={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              apiKey={KEY}
              movieUserRating={
                watched.find((movie) => movie.imdbId === selectedId)
                  ?.userRating ?? 0
              }
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </MainBar>
    </>
  );
}
