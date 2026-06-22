import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { Artwork, Artist } from "@/constants/data";

interface DataStore {
  artworks: Record<string, Artwork>;
  artists: Record<string, Artist>;
  setArtwork: (a: Artwork) => void;
  setArtworks: (list: Artwork[]) => void;
  setArtist: (a: Artist) => void;
  setArtists: (list: Artist[]) => void;
  getArtwork: (id: string) => Artwork | null;
  getArtist: (id: string) => Artist | null;
  getAllArtworks: () => Artwork[];
  getAllArtists: () => Artist[];
}

const DataStoreContext = createContext<DataStore | null>(null);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworksMap] = useState<Record<string, Artwork>>({});
  const [artists, setArtistsMap] = useState<Record<string, Artist>>({});

  const setArtwork = useCallback((a: Artwork) => {
    if (!a.id) return;
    setArtworksMap((prev) => ({ ...prev, [a.id]: a }));
  }, []);

  const setArtworks = useCallback((list: Artwork[]) => {
    setArtworksMap((prev) => {
      const next = { ...prev };
      for (const a of list) {
        if (a.id) next[a.id] = a;
      }
      return next;
    });
  }, []);

  const setArtist = useCallback((a: Artist) => {
    if (!a.id) return;
    setArtistsMap((prev) => ({ ...prev, [a.id]: a }));
  }, []);

  const setArtists = useCallback((list: Artist[]) => {
    setArtistsMap((prev) => {
      const next = { ...prev };
      for (const a of list) {
        if (a.id) next[a.id] = a;
      }
      return next;
    });
  }, []);

  const getArtwork = useCallback(
    (id: string) => artworks[id] ?? null,
    [artworks]
  );

  const getArtist = useCallback(
    (id: string) => artists[id] ?? null,
    [artists]
  );

  const getAllArtworks = useCallback(() => Object.values(artworks), [artworks]);
  const getAllArtists = useCallback(() => Object.values(artists), [artists]);

  const value = useMemo(() => ({
    artworks,
    artists,
    setArtwork,
    setArtworks,
    setArtist,
    setArtists,
    getArtwork,
    getArtist,
    getAllArtworks,
    getAllArtists,
  }), [artworks, artists, setArtwork, setArtworks, setArtist, setArtists, getArtwork, getArtist, getAllArtworks, getAllArtists]);

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  );
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error("useDataStore must be used within DataStoreProvider");
  return ctx;
}
