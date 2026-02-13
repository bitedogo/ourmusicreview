import { NextResponse } from "next/server";
import { getLargeImageUrl } from "@/src/lib/itunes";

const FEATURED_ALBUMS = [
  { artist: "Radiohead", title: "OK Computer" },
  { artist: "The Beatles", title: "Sgt. Pepper's Lonely Hearts Club Band" },
  { artist: "Marvin Gaye", title: "What's Going On" },
  { artist: "The Beach Boys", title: "Pet Sounds" },
  { artist: "Prince", title: "Purple Rain" },
  { artist: "Michael Jackson", title: "Thriller" },
  { artist: "Kanye West", title: "My Beautiful Dark Twisted Fantasy" },
  { artist: "Kendrick Lamar", title: "To Pimp a Butterfly" },
  { artist: "Notorious B.I.G.", title: "Ready to Die" },
  { artist: "D'Angelo", title: "Voodoo" },
  { artist: "Beyoncé", title: "Lemonade" },
  { artist: "Dr. dre", title: "2001" },
  { artist: "Talking Heads", title: "Remain in Light" },
  { artist: "Nas", title: "Illmatic" },
];

interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName?: string;
  collectionType?: string;
  trackCount?: number;
}

interface iTunesSearchResponse {
  results: iTunesAlbum[];
}

async function searchAlbum(artist: string, title: string): Promise<iTunesAlbum | null> {
  const searchTerm = `${artist} ${title}`.replace(/\s*-\s*/g, " ").trim();
  const encodedTerm = encodeURIComponent(searchTerm);
  const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=album&country=US&limit=10`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data = (await response.json()) as iTunesSearchResponse;
    const allResults = (data.results || []) as iTunesAlbum[];

    if (allResults.length === 0) {
      return null;
    }

    const normalizedSearchArtist = artist.toLowerCase().trim();
    const normalizedSearchTitle = title.toLowerCase().trim();

    const filteredResults = allResults.filter((album) => {
      const collectionType = album.collectionType?.toLowerCase() || "";
      const collectionName = (album.collectionName || "").toLowerCase();
      const artistName = (album.artistName || "").toLowerCase();
      const trackCount = album.trackCount || 0;
      
      if (collectionType === "single" && trackCount < 5) {
        return false;
      }
      
      if (trackCount < 5 && (collectionName.includes("- single") || collectionName.endsWith(" single"))) {
        return false;
      }
      
      const unofficialKeywords = ["tribute", "cover", "parody", "fanmade", "leak"];
      if (unofficialKeywords.some(keyword => collectionName.includes(keyword) || artistName.includes(keyword))) {
        return false;
      }
      
      return true;
    });

    for (const album of filteredResults) {
      const albumArtist = album.artistName.toLowerCase().trim();
      const albumTitle = album.collectionName.toLowerCase().trim();

      let isArtistMatch = false;
      
      if (albumArtist === normalizedSearchArtist) {
        isArtistMatch = true;
      } else {
        const searchWords = normalizedSearchArtist.split(/\s+/).filter(w => w.length > 1);
        if (searchWords.length > 0) {
          const allWordsIncluded = searchWords.every(word => albumArtist.includes(word));
          if (allWordsIncluded) {
            isArtistMatch = true;
          }
        }
      }

      if (!isArtistMatch) {
        continue;
      }

      let isTitleMatch = false;
      
      if (albumTitle === normalizedSearchTitle) {
        isTitleMatch = true;
      } else {
        const titleWords = normalizedSearchTitle.split(/\s+/).filter(w => w.length > 1);
        if (titleWords.length > 0) {
          const allTitleWordsIncluded = titleWords.every(word => albumTitle.includes(word));
          if (allTitleWordsIncluded) {
            isTitleMatch = true;
          }
        }
      }

      if (!isTitleMatch) {
        continue;
      }

      return album;
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const albums = await Promise.all(
      FEATURED_ALBUMS.map(async ({ artist, title }) => {
        const result = await searchAlbum(artist, title);
        
        if (!result) {
          return {
            collectionId: 0,
            title,
            artist,
            imageUrl: null,
            releaseDate: "",
            genre: "",
          };
        }
        
        return {
          collectionId: result.collectionId,
          title: result.collectionName,
          artist: result.artistName,
          imageUrl: getLargeImageUrl(result.artworkUrl100),
          releaseDate: result.releaseDate,
          genre: result.primaryGenreName || "",
        };
      })
    );

    const validAlbums = albums.filter(album => album.collectionId !== 0);

    return NextResponse.json({ ok: true, albums: validAlbums }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "명반 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
