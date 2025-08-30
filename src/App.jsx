import "./App.css";
import { useState } from "react";
import { Search, Results } from "./components/NavBar";
import { useMovies } from "./hooks/useMovies";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import NavBar from "./components/NavBar";
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

const KEY = "KEYHERE";

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(KEY, query);
  const [watched, setWatched] = useLocalStorageState([], "watched");

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
