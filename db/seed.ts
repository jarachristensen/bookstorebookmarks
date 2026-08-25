import { db, initDb } from "./index";
import { bookstores, bookmarks, archivalMedia } from "./schema";
import { ensureSeedAssets } from "./generate-seed-assets";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  await initDb();
  ensureSeedAssets();

  const now = new Date().toISOString();

  // 1. Gotham Book Mart
  const gotham = {
    id: "gotham-book-mart",
    name: "Gotham Book Mart",
    city: "New York",
    stateProvince: "NY",
    country: "United States",
    streetAddress: "41 West 47th Street",
    yearOpened: 1920,
    yearClosed: 2007,
    isStillOperating: false,
    founders: "Frances Steloff",
    specialties: JSON.stringify(["Modernist Literature", "Avant-Garde Poetry", "Surrealism", "Film & Theatre", "Little Magazines"]),
    historicalBlurb: `### “Wise Men Fish Here” — Frances Steloff and the Crucible of Modernism

Founded in 1920 by the fierce and visionary **Frances Steloff** with just $100 and a handful of theatrical books, the **Gotham Book Mart** became the premier epicenter of avant-garde 20th-century literature in the United States. 

Operating under its iconic wrought-iron swinging sign painted with three fishermen in a boat beneath the motto *“Wise Men Fish Here”*, the shop on Manhattan's Diamond District (41 W 47th St) was far more than a retail space—it was a literary salon, safe haven, and distribution hub for contraband masterpieces.

#### Defying the Censors
When James Joyce’s *Ulysses* and Henry Miller’s *Tropic of Cancer* were banned under federal obscenity statutes, Steloff smuggled copies through customs in trunks and under carpets, personally risking arrest to ensure New York writers could study modern literature. In 1947, the **James Joyce Society** was founded right in the back room, with T.S. Eliot, Thornton Wilder, and Anaïs Nin among its earliest attendees.

#### Legacy
For 87 remarkable years, the Gotham Book Mart was a home away from home for generations of writers—from Marianne Moore and E.E. Cummings to Gore Vidal and Patti Smith. Although it closed in 2007, its extensive archives and inventory of 200,000 volumes were preserved by the University of Pennsylvania.`,
    notablePatronsTrivia: JSON.stringify([
      "Frances Steloff helped fund Henry Miller's writing while he was impoverished in Paris.",
      "The James Joyce Society held its inaugural meeting here in February 1947.",
      "Patti Smith worked as a Gotham Book Mart clerk in the early 1970s before releasing Horses.",
      "E.E. Cummings lived nearby and spent afternoons signing stacks of poetry collections at the front counter."
    ]),
    websiteUrl: "https://www.library.upenn.edu/collections/gotham",
    createdAt: now,
    updatedAt: now,
  };

  // 2. Shakespeare and Company
  const shakespeare = {
    id: "shakespeare-and-company",
    name: "Shakespeare and Company",
    city: "Paris",
    stateProvince: "Île-de-France",
    country: "France",
    streetAddress: "37 Rue de la Bûcherie",
    yearOpened: 1919,
    yearClosed: null,
    isStillOperating: true,
    founders: "Sylvia Beach (1919) · George Whitman (1951)",
    specialties: JSON.stringify(["Expatriate Fiction", "Anglophone Poetry", "Rare First Editions", "Literary Journal Archive", "Philosophy"]),
    historicalBlurb: `### Kilometre Zero: Sylvia Beach, George Whitman & The Lost Generation

Originally opened on the Left Bank in November 1919 by American expatriate **Sylvia Beach**, Shakespeare and Company was the beating heart of English-language modernist writing in interwar Paris. Beach ran both a bookstore and a lending library, providing books, mailboxes, and financial lifelines to Ernest Hemingway, F. Scott Fitzgerald, Gertrude Stein, and Man Ray.

#### Publishing Ulysses (1922)
When serialization of James Joyce’s *Ulysses* was blocked in England and the United States, Beach bravely took on the mantle of publisher under the Shakespeare and Company imprint, overseeing its historic 1922 Paris publication—a milestone that reshaped modern literature forever.

#### The Latin Quarter Revival
Though closed by Beach in 1941 during the Nazi occupation of Paris after she refused to sell her last copy of *Finnegans Wake* to a German officer, the spirit was reborn in 1951 when **George Whitman** opened his bookstore at 37 Rue de la Bûcherie across from Notre-Dame. Whitman dubbed his shop a *“socialist utopia masquerading as a bookstore”*, famously establishing the **“Tumbleweed”** tradition where over 30,000 traveling writers and artists have slept among the bookshelves in exchange for helping around the shop and writing a one-page autobiography.`,
    notablePatronsTrivia: JSON.stringify([
      "Sylvia Beach personally funded and typeset the first 1,000 copies of James Joyce's Ulysses in 1922.",
      "Ernest Hemingway recounted in 'A Moveable Feast' that Beach loaned him books when he had no money for food.",
      "George Whitman welcomed Allen Ginsberg and William S. Burroughs to give some of their earliest European readings here.",
      "Every book purchased in the store receives the famous purple 'Kilometre Zero' stamp."
    ]),
    websiteUrl: "https://shakespeareandcompany.com",
    createdAt: now,
    updatedAt: now,
  };

  // 3. City Lights Booksellers & Publishers
  const cityLights = {
    id: "city-lights-books",
    name: "City Lights Booksellers & Publishers",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "261 Columbus Avenue",
    yearOpened: 1953,
    yearClosed: null,
    isStillOperating: true,
    founders: "Lawrence Ferlinghetti · Peter D. Martin",
    specialties: JSON.stringify(["Beat Poetry", "Radical Politics", "Independent Press", "Translation", "Counterculture"]),
    historicalBlurb: `### The Beat Vanguard: Lawrence Ferlinghetti and the Free Word

Founded in 1953 in San Francisco's North Beach neighborhood by poet **Lawrence Ferlinghetti** and sociologist **Peter D. Martin**, **City Lights** was the first all-paperback bookstore in the United States. Conceived as a populist literary salon open seven days a week until midnight, it quickly became the spiritual headquarters of the **Beat Generation**.

#### The 1957 Obscenity Trial
In 1955, Ferlinghetti launched the *Pocket Poets Series*, publishing Allen Ginsberg’s groundbreaking and searing poem *Howl and Other Poems* as Volume No. 4. In 1957, San Francisco police arrested Ferlinghetti and store manager Shigeyoshi Murao on charges of publishing and selling "obscene writings."

In a watershed First Amendment victory defended by the ACLU, Judge Clayton W. Horn ruled that *Howl* possessed *"redeeming social importance"*, establishing a critical legal barrier against literary censorship that paved the way for Lady Chatterley’s Lover and Tropic of Cancer.

#### A Living Landmark
Designated an official San Francisco Landmark in 2001, City Lights continues as a vibrant center of political resistance, progressive publishing, and world poetry, drawing readers from around the globe to sit in the famous Poet's Chair.`,
    notablePatronsTrivia: JSON.stringify([
      "City Lights was the first bookstore in the United States to sell exclusively paperbound books.",
      "Allen Ginsberg first read 'Howl' at the Six Gallery in SF, after which Ferlinghetti telegrammed him: 'I greet you at the beginning of a great career. When do I get the manuscript?'",
      "Jack Kerouac spent nights writing in the City Lights basement while staying in North Beach.",
      "The alley alongside the store was renamed 'Jack Kerouac Alley' in 1988."
    ]),
    websiteUrl: "https://citylights.com",
    createdAt: now,
    updatedAt: now,
  };

  // 4. Kroch's & Brentano's
  const krochs = {
    id: "krochs-and-brentanos",
    name: "Kroch's & Brentano's",
    city: "Chicago",
    stateProvince: "IL",
    country: "United States",
    streetAddress: "29 South Wabash Avenue",
    yearOpened: 1907,
    yearClosed: 1995,
    isStillOperating: false,
    founders: "Adolph Kroch · Carl A. Kroch",
    specialties: JSON.stringify(["Midwest Trade Editions", "Technical & Scientific", "Art Books", "Children's Classics", "Paperback Superstore"]),
    historicalBlurb: `### The World's Largest Bookstore: The Kroch Dynasty in Chicago

Founded in 1907 by Austrian immigrant **Adolph Kroch** as an international bookstore on Monroe Street, **Kroch's & Brentano's (K&B)** grew to become a towering cultural institution in Chicago and the largest independent bookseller in the world.

#### The Wabash Avenue Mega-Store
In 1955, under the leadership of Adolph's son **Carl A. Kroch**, the company opened its legendary 40,000-square-foot flagship at **29 South Wabash Avenue** in the heart of the Chicago Loop. Boasting four complete floors and a vast basement "Super Book Mart", it held over 100,000 titles under one roof decades before Barnes & Noble or Borders imagined the superstore concept.

#### Innovations in Bookselling
Carl Kroch pioneered modern bookselling display techniques: full-cover frontal merchandising, extensive subject categorization, computerized inventory tracking, and author signing galas that drew literary icons like Carl Sandburg, Saul Bellow, Gwendolyn Brooks, and Studs Terkel.

At its peak in the 1970s and 1980s, K&B operated 22 branch stores across Illinois and accounted for over 20% of all trade books sold in the Midwest. The legendary Wabash flagship closed its doors in 1995 after 88 glorious years, leaving an indelible mark on American bookselling history.`,
    notablePatronsTrivia: JSON.stringify([
      "K&B was widely recognized as the inventor of the modern full-line bookstore department format.",
      "Carl Sandburg was a regular fixture at the 29 S. Wabash store, often signing books for hours unannounced.",
      "Adolph Kroch authored the influential 1937 treatise 'A Great Bookstore in Action'.",
      "During the 1960s, K&B's customer telephone desk answered over 500 book inquiries every day."
    ]),
    websiteUrl: "https://chicagology.com/loop/krochs-brentanos/",
    createdAt: now,
    updatedAt: now,
  };

  // Upsert Bookstores
  for (const b of [gotham, shakespeare, cityLights, krochs]) {
    await db.insert(bookstores).values(b).onConflictDoUpdate({
      target: bookstores.id,
      set: b,
    });
  }

  // Bookmarks
  const bookmarkEntries = [
    {
      id: "gotham-wise-men-fish-here",
      bookstoreId: "gotham-book-mart",
      title: "Gotham Book Mart “Wise Men Fish Here” Letterpress Bookmark",
      accessionNo: "BM-1934-NY-01",
      frontImageUrl: "/seed-images/gotham-front.svg",
      backImageUrl: "/seed-images/gotham-back.svg",
      yearProduced: 1934,
      material: "Letterpress Printed Heavy Cream Cardstock with Linen Texture",
      dimensions: "2.25\" × 7.75\"",
      condition: "Very Good (Light corner patina, crisp ink strike)",
      acquisitionDate: "1988-05-12",
      acquisitionNotes: "Acquired from a first edition of James Joyce's Pomes Penyeach in Greenwich Village.",
      isFeatured: true,
      displayOrder: 1,
      accentColor: "#881337",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "shakespeare-kilometre-zero",
      bookstoreId: "shakespeare-and-company",
      title: "Shakespeare and Company Paris “Kilometre Zero” Stamp Bookmark",
      accessionNo: "BM-1951-PAR-02",
      frontImageUrl: "/seed-images/shakespeare-front.svg",
      backImageUrl: "/seed-images/shakespeare-back.svg",
      yearProduced: 1951,
      material: "Hand-Stamped Natural French Cotton Rag Paper",
      dimensions: "2.1\" × 8.0\"",
      condition: "Fine (Authentic purple ink stamp, uncreased)",
      acquisitionDate: "2004-09-18",
      acquisitionNotes: "Stamped at the front desk by George Whitman during a visit to Rue de la Bûcherie.",
      isFeatured: true,
      displayOrder: 2,
      accentColor: "#14532D",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "city-lights-pocket-poets",
      bookstoreId: "city-lights-books",
      title: "City Lights Booksellers & Publishers Pocket Poets Series Flap Bookmark",
      accessionNo: "BM-1956-SF-03",
      frontImageUrl: "/seed-images/citylights-front.svg",
      backImageUrl: "/seed-images/citylights-back.svg",
      yearProduced: 1956,
      material: "Two-Tone Black & Crimson Chipboard",
      dimensions: "2.5\" × 7.5\"",
      condition: "Excellent (Intact edges, bold typography)",
      acquisitionDate: "1997-11-04",
      acquisitionNotes: "Discovered inside an early printing of Allen Ginsberg's Howl (Pocket Poets No. 4).",
      isFeatured: true,
      displayOrder: 3,
      accentColor: "#1C1917",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "krochs-wabash-department",
      bookstoreId: "krochs-and-brentanos",
      title: "Kroch's & Brentano's 29 S. Wabash Flagship Store Directory Bookmark",
      accessionNo: "BM-1955-CHI-04",
      frontImageUrl: "/seed-images/krochs-front.svg",
      backImageUrl: "/seed-images/krochs-back.svg",
      yearProduced: 1955,
      material: "Gloss Lithograph Card with Amber Border & Store Guide",
      dimensions: "2.25\" × 7.5\"",
      condition: "Mint (Unused archival survivor)",
      acquisitionDate: "2012-03-21",
      acquisitionNotes: "Gifted by a former K&B Wabash sales manager from their personal collection.",
      isFeatured: true,
      displayOrder: 4,
      accentColor: "#1E293B",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const bm of bookmarkEntries) {
    await db.insert(bookmarks).values(bm).onConflictDoUpdate({
      target: bookmarks.id,
      set: bm,
    });
  }

  // Archival Media & Newspaper Clippings
  const mediaEntries = [
    {
      id: "gotham-clipping-nyt-1947",
      bookstoreId: "gotham-book-mart",
      mediaType: "newspaper",
      imageUrl: "/seed-images/gotham-front.svg",
      caption: "The New York Times: 'Frances Steloff & Her Haven on 47th Street'",
      sourcePublication: "The New York Times",
      publicationDate: "November 14, 1947",
      transcriptionText: `“NEW YORK, Nov. 14 — In a narrow shop on Forty-seventh Street where three iron fishermen dangle from a sign above the door, Miss Frances Steloff has presided over modern literature for more than a quarter of a century. Here on any given afternoon, one might encounter Marianne Moore, E.E. Cummings, or Allen Tate examining the latest poetry from London or Paris. Miss Steloff was today honored by the James Joyce Society for her steadfast dedication to freedom of the written word.”`,
      displayOrder: 1,
      createdAt: now,
    },
    {
      id: "shakespeare-clipping-figaro-1951",
      bookstoreId: "shakespeare-and-company",
      mediaType: "newspaper",
      imageUrl: "/seed-images/shakespeare-front.svg",
      caption: "Le Figaro: 'An American Bookseller Opens Doors to Notre-Dame'",
      sourcePublication: "Le Figaro Littéraire",
      publicationDate: "October 8, 1951",
      transcriptionText: `“PARIS — Facing the towers of Notre-Dame at 37 rue de la Bûcherie, an American ex-serviceman named George Whitman has opened a library and bookshop named Le Mistral, continuing the noble tradition established thirty years ago by Sylvia Beach. Young writers from all continents find here not only books in English, but a roof, a cup of tea, and an unending conversation.”`,
      displayOrder: 1,
      createdAt: now,
    },
    {
      id: "citylights-clipping-chronicle-1957",
      bookstoreId: "city-lights-books",
      mediaType: "newspaper",
      imageUrl: "/seed-images/citylights-front.svg",
      caption: "San Francisco Chronicle: 'Judge Rules Ginsberg Poem Not Obscene in Landmark Trial'",
      sourcePublication: "San Francisco Chronicle",
      publicationDate: "October 4, 1957",
      transcriptionText: `“SAN FRANCISCO — In Municipal Court today, Judge Clayton W. Horn ruled that Allen Ginsberg’s poem 'Howl', published and sold by Lawrence Ferlinghetti of City Lights Books, is not obscene. In a memorable 39-page opinion, Judge Horn declared that an author must have the freedom to depict society in the language of its people: 'The author has spoken in earnest terms regarding the conditions of our era. To restrict such expression would be to blind ourselves to art.'”`,
      displayOrder: 1,
      createdAt: now,
    },
    {
      id: "krochs-clipping-tribune-1955",
      bookstoreId: "krochs-and-brentanos",
      mediaType: "newspaper",
      imageUrl: "/seed-images/krochs-front.svg",
      caption: "Chicago Tribune: 'Kroch's & Brentano's Opens 4-Floor Wabash Superstore'",
      sourcePublication: "Chicago Daily Tribune",
      publicationDate: "February 7, 1955",
      transcriptionText: `“CHICAGO — More than 5,000 book lovers surged through the glass doors of 29 S. Wabash Ave. yesterday to celebrate the grand opening of the world's largest bookstore. With 40,000 square feet of floor space across four stories and a subterranean 'Super Book Mart', Carl A. Kroch has created a Midwest monument to the printed page that promises to revolutionize bookselling for the 20th century.”`,
      displayOrder: 1,
      createdAt: now,
    },
  ];

  for (const m of mediaEntries) {
    await db.insert(archivalMedia).values(m).onConflictDoUpdate({
      target: archivalMedia.id,
      set: m,
    });
  }
}
