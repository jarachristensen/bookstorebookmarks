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

  // 5. Green Apple Books
  const greenApple = {
    id: "green-apple-books",
    name: "Green Apple Books",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "506 Clement Street",
    yearOpened: 1967,
    yearClosed: null,
    isStillOperating: true,
    founders: "Richard Savoy",
    specialties: JSON.stringify(["Used & Rare Books", "Modern Literature", "Comics & Graphic Novels", "San Francisco History", "Vinyl Records"]),
    historicalBlurb: `### An Inner Richmond Landmark: Richard Savoy and Green Apple Books

Founded in 1967 by 25-year-old **Richard Savoy**, a former radio technician, **Green Apple Books** opened at **506 Clement Street** in San Francisco's Inner Richmond district with a modest stock of used books, comic books, and pocket paperbacks.

#### The Labyrinth on Clement Street
Over the decades, Green Apple expanded into neighboring storefronts, creating a famously beloved two-story literary labyrinth featuring squeaky wood floors, narrow passageways, curated staff recommendation tags, and over 100,000 used and new volumes.

#### Cultural Bastion of San Francisco
In 1996, the shop expanded across the street into 520 Clement Street with a dedicated music and fiction annex, and later added a secondary branch in the Sunset District (Green Apple Books on the Park). In 2014, Green Apple was named *Publishers Weekly Bookstore of the Year*, recognized as one of the quintessential independent community bookstores on the West Coast.`,
    notablePatronsTrivia: JSON.stringify([
      "Green Apple Books was founded in 1967 with a small $1,000 savings bond and used books gathered at flea markets.",
      "Named Publishers Weekly Bookstore of the Year in 2014.",
      "The shop's creaky original wood staircase on Clement Street is an iconic landmark of San Francisco bookselling.",
      "In 2009, founder Richard Savoy transitioned co-ownership of the store to three longtime managers to ensure its permanent independence."
    ]),
    websiteUrl: "https://www.greenapplebooks.com",
    createdAt: now,
    updatedAt: now,
  };

  // 6. A Clean Well-Lighted Place for Books
  const cleanWellLighted = {
    id: "a-clean-well-lighted-place-for-books",
    name: "A Clean Well-Lighted Place for Books",
    city: "San Francisco",
    stateProvince: "CA",
    country: "United States",
    streetAddress: "601 Van Ness Avenue (Opera Plaza)",
    yearOpened: 1975,
    yearClosed: 2006,
    isStillOperating: false,
    founders: "Lewis Buzbee · Wendy Lesser · John May · William Petrocelli",
    specialties: JSON.stringify(["Contemporary Literature", "Author Readings", "Poetry", "Opera Plaza Community", "Independent Press"]),
    historicalBlurb: `### For People Who Love Good Books: Opera Plaza's Literary Epicenter
    
Named after Ernest Hemingway's famed 1933 short story, **A Clean Well-Lighted Place for Books** opened in 1975 in Larkspur Landing before establishing its landmark flagship at San Francisco's Opera Plaza in 1982. 

For three glorious decades, it was one of the premier independent literary bookstores on the West Coast, celebrated for its legendary author readings hosting Toni Morrison, Gabriel García Márquez, Isabel Allende, and Salman Rushdie.`,
    notablePatronsTrivia: JSON.stringify([
      "Named after Ernest Hemingway's classic 1933 short story.",
      "Hosted some of the most celebrated author reading series in San Francisco history.",
      "Co-founder William Petrocelli later founded Book Passage in Corte Madera."
    ]),
    websiteUrl: "https://www.sfgate.com",
    createdAt: now,
    updatedAt: now,
  };

  // 7. Arches Bookhouse
  const arches = {
    id: "arches-bookhouse",
    name: "Arches Bookhouse",
    city: "Portland",
    stateProvince: "OR",
    country: "United States",
    streetAddress: "8900 N Lombard Street",
    yearOpened: 2017,
    yearClosed: null,
    isStillOperating: true,
    founders: "Tim & Megan Hall",
    specialties: JSON.stringify(["Scholarly & Antiquarian", "Theology & Philosophy", "Classical Literature", "Poetry", "Rare Editions"]),
    historicalBlurb: `### St. Johns Antiquarian Sanctuary in North Portland
    
Located in the historic St. Johns neighborhood of North Portland, **Arches Bookhouse** is an antiquarian and secondhand bookshop specializing in scholarly literature, philosophy, theology, and rare bindings. Filled with natural wood arches and curated library shelves, it provides a quiet sanctuary for serious readers and collectors.`,
    notablePatronsTrivia: JSON.stringify([
      "Known for its architectural Gothic wooden arches framing the shop interior.",
      "Specializes in academic theology, classic poetry, and rare antiquarian volumes."
    ]),
    websiteUrl: "https://archesbookhouse.com",
    createdAt: now,
    updatedAt: now,
  };

  // 8. Aunt Bonnie's Book House
  const auntBonnies = {
    id: "aunt-bonnies-book-house",
    name: "Aunt Bonnie's Book House",
    city: "Oklahoma City",
    stateProvince: "OK",
    country: "United States",
    streetAddress: "2101 NW 39th Street",
    yearOpened: 1984,
    yearClosed: null,
    isStillOperating: true,
    founders: "Bonnie Martin",
    specialties: JSON.stringify(["Children's Literature", "Illustrated Classics", "Vintage Fiction", "School Reading Lists", "Storytelling"]),
    historicalBlurb: `### Generations of Storytelling in Oklahoma City
    
Founded in 1984, **Aunt Bonnie's Book House** is a beloved institution in Oklahoma City, delighting generations of young readers and collectors with vintage illustrated children's books, school classics, and community reading circles.`,
    notablePatronsTrivia: JSON.stringify([
      "Beloved for over four decades of children's literary enrichment in Oklahoma.",
      "Maintains a renowned archive of vintage mid-century illustrated storybooks."
    ]),
    websiteUrl: "https://www.facebook.com",
    createdAt: now,
    updatedAt: now,
  };

  // 9. Dog Star Books
  const dogStar = {
    id: "dog-star-books",
    name: "Dog Star Books",
    city: "Lancaster",
    stateProvince: "PA",
    country: "United States",
    streetAddress: "401 W Lemon Street",
    yearOpened: 2010,
    yearClosed: null,
    isStillOperating: true,
    founders: "Jordan & Deidre Dunn",
    specialties: JSON.stringify(["Used & Rare Books", "Small Press Poetry", "Science Fiction", "Art & Philosophy", "Literary Ephemera"]),
    historicalBlurb: `### Lancaster's Literary Curiosity Shop
    
Nestled in Lancaster, Pennsylvania, **Dog Star Books** is an independent secondhand and rare bookshop known for its hand-curated fiction, vintage sci-fi, poetry chapbooks, and community literary readings.`,
    notablePatronsTrivia: JSON.stringify([
      "Named after Sirius, the brightest star in the night sky (the Dog Star).",
      "Regularly hosts underground poetry readings and acoustic salon evenings."
    ]),
    websiteUrl: "https://www.dogstarbooks.com",
    createdAt: now,
    updatedAt: now,
  };

  // 10. Gardner's Used Books
  const gardners = {
    id: "gardners-used-books",
    name: "Gardner's Used Books",
    city: "Tulsa",
    stateProvince: "OK",
    country: "United States",
    streetAddress: "4421 S Mingo Road",
    yearOpened: 1991,
    yearClosed: null,
    isStillOperating: true,
    founders: "Richard Gardner",
    specialties: JSON.stringify(["Used Books Superstore", "Vintage Comics", "Rare Paperbacks", "Military History", "Oklahoma Lore"]),
    historicalBlurb: `### Oklahoma's Largest Used Bookstore: 23,000 Square Feet of Books
    
Recognized as the largest used bookstore in Oklahoma with over 23,000 square feet of book aisles, **Gardner's Used Books** in Tulsa holds hundreds of thousands of books, vintage comics, retro paperbacks, and historical ephemera.`,
    notablePatronsTrivia: JSON.stringify([
      "With over 23,000 sq ft, it is the largest independent used bookshop in the state of Oklahoma.",
      "Famous for its towering wall of vintage pulp fiction paperbacks and comic back issues."
    ]),
    websiteUrl: "https://www.gardnersbooks.com",
    createdAt: now,
    updatedAt: now,
  };

  // 11. Third Street Books
  const thirdStreet = {
    id: "third-street-books",
    name: "Third Street Books",
    city: "McMinnville",
    stateProvince: "OR",
    country: "United States",
    streetAddress: "320 NE 3rd Street",
    yearOpened: 2004,
    yearClosed: null,
    isStillOperating: true,
    founders: "Sylla McClellan",
    specialties: JSON.stringify(["Pacific Northwest Authors", "Local History", "New Fiction", "Children's Room", "Independent Press"]),
    historicalBlurb: `### Willamette Valley Literary Heart in Historic McMinnville
    
Located in the heart of historic downtown McMinnville in Oregon's Willamette Valley wine country, **Third Street Books** is a vibrant community bookstore celebrating Northwest authors, independent press titles, and local readers.`,
    notablePatronsTrivia: JSON.stringify([
      "Anchors historic 3rd Street in McMinnville, consistently voted one of America's best Main Streets.",
      "Hosts annual literary festivals celebrating Oregon poets and novelists."
    ]),
    websiteUrl: "https://www.thirdstreetbooks.com",
    createdAt: now,
    updatedAt: now,
  };

  // 12. Vintage Books
  const vintageBooks = {
    id: "vintage-books",
    name: "Vintage Books",
    city: "Vancouver",
    stateProvince: "WA",
    country: "United States",
    streetAddress: "6613 E Mill Plain Blvd",
    yearOpened: 1975,
    yearClosed: null,
    isStillOperating: true,
    founders: "Nancy Anderson · Becky Milner",
    specialties: JSON.stringify(["Used & Out-of-Print", "Mystery & Crime", "Pacific Northwest History", "Science Fiction & Fantasy", "Book Clubs"]),
    historicalBlurb: `### Fifty Years of Bookselling on the Columbia River
    
Serving readers across Southwest Washington and the Columbia River since 1975, **Vintage Books** is Vancouver's oldest independent bookstore, housing over 60,000 used, rare, and new titles across its labyrinthine aisles.`,
    notablePatronsTrivia: JSON.stringify([
      "Vancouver, Washington's oldest independent bookstore, celebrating 50 years of community bookselling.",
      "Home to the famous shop cats who greet browsers along the mystery and history shelves."
    ]),
    websiteUrl: "https://www.vintage-books.net",
    createdAt: now,
    updatedAt: now,
  };

  // Upsert Bookstores
  const allSeedStores = [
    gotham,
    shakespeare,
    cityLights,
    krochs,
    greenApple,
    cleanWellLighted,
    arches,
    auntBonnies,
    dogStar,
    gardners,
    thirdStreet,
    vintageBooks,
  ];

  for (const b of allSeedStores) {
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
      accentColor: "#92400E",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "green-apple-clement-vintage",
      bookstoreId: "green-apple-books",
      title: "Green Apple Books 506 Clement Street San Francisco Bookmark",
      accessionNo: "BM-1967-SF-07",
      frontImageUrl: "/seed-images/greenapple-front.svg",
      backImageUrl: "/seed-images/greenapple-back.svg",
      yearProduced: 1967,
      material: "Two-Tone Forest & Lime Cardstock with Apple Motif",
      dimensions: "2.25\" × 7.5\"",
      condition: "Fine (Clean edges, vibrant green ink)",
      acquisitionDate: "2018-09-12",
      acquisitionNotes: "Acquired at the original 506 Clement St. counter.",
      isFeatured: true,
      displayOrder: 5,
      accentColor: "#15803D",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "clean-well-lighted-opera-plaza",
      bookstoreId: "a-clean-well-lighted-place-for-books",
      title: "A Clean Well-Lighted Place for Books Opera Plaza Bookmark",
      accessionNo: "BM-1975-SF-08",
      frontImageUrl: "/seed-images/cleanwelllighted-front.svg",
      backImageUrl: "/seed-images/cleanwelllighted-back.svg",
      yearProduced: 1975,
      material: "Classic Blue Ink on Cream Cardstock",
      dimensions: "2.25\" × 7.5\"",
      condition: "Fine",
      acquisitionDate: "1994-04-12",
      acquisitionNotes: "Acquired at an author reading at Opera Plaza.",
      isFeatured: true,
      displayOrder: 6,
      accentColor: "#2563EB",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "arches-bookhouse-st-johns",
      bookstoreId: "arches-bookhouse",
      title: "Arches Bookhouse St. Johns Portland Bookmark",
      accessionNo: "BM-2017-OR-09",
      frontImageUrl: "/seed-images/arches-front.svg",
      backImageUrl: "/seed-images/arches-back.svg",
      yearProduced: 2017,
      material: "Amber Letterpress Heavy Linen",
      dimensions: "2.25\" × 7.5\"",
      condition: "Mint",
      acquisitionDate: "2021-08-05",
      acquisitionNotes: "Acquired during a visit to Portland, Oregon.",
      isFeatured: true,
      displayOrder: 7,
      accentColor: "#B45309",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "dog-star-books-lemon-st",
      bookstoreId: "dog-star-books",
      title: "Dog Star Books Lemon Street Lancaster Bookmark",
      accessionNo: "BM-2010-PA-10",
      frontImageUrl: "/seed-images/dogstar-front.svg",
      backImageUrl: "/seed-images/dogstar-back.svg",
      yearProduced: 2010,
      material: "Purple & Lavender Heavy Vellum",
      dimensions: "2.25\" × 7.5\"",
      condition: "Fine",
      acquisitionDate: "2019-11-18",
      acquisitionNotes: "Acquired at 401 W Lemon Street in Lancaster.",
      isFeatured: false,
      displayOrder: 8,
      accentColor: "#7E22CE",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "gardners-used-books-tulsa",
      bookstoreId: "gardners-used-books",
      title: "Gardner's Used Books Tulsa Oklahoma Bookmark",
      accessionNo: "BM-1991-OK-11",
      frontImageUrl: "/seed-images/gardners-front.svg",
      backImageUrl: "/seed-images/gardners-back.svg",
      yearProduced: 1991,
      material: "Warm Ochre Card with Bookstore Map",
      dimensions: "2.25\" × 7.5\"",
      condition: "Fine",
      acquisitionDate: "2016-05-30",
      acquisitionNotes: "Acquired at Gardner's Used Books on Mingo Road in Tulsa.",
      isFeatured: true,
      displayOrder: 9,
      accentColor: "#B45309",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "third-street-books-mcminnville",
      bookstoreId: "third-street-books",
      title: "Third Street Books McMinnville Oregon Bookmark",
      accessionNo: "BM-2004-OR-12",
      frontImageUrl: "/seed-images/thirdstreet-front.svg",
      backImageUrl: "/seed-images/thirdstreet-back.svg",
      yearProduced: 2004,
      material: "Forest Green Linen Cardstock",
      dimensions: "2.25\" × 7.5\"",
      condition: "Mint",
      acquisitionDate: "2020-07-22",
      acquisitionNotes: "Acquired during a Willamette Valley book tour.",
      isFeatured: false,
      displayOrder: 10,
      accentColor: "#15803D",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "vintage-books-vancouver-wa",
      bookstoreId: "vintage-books",
      title: "Vintage Books Vancouver Washington Bookmark",
      accessionNo: "BM-1975-WA-13",
      frontImageUrl: "/seed-images/vintagebooks-front.svg",
      backImageUrl: "/seed-images/vintagebooks-back.svg",
      yearProduced: 1975,
      material: "Vintage Amber & Brown Cardstock",
      dimensions: "2.25\" × 7.5\"",
      condition: "Fine",
      acquisitionDate: "2017-10-14",
      acquisitionNotes: "Acquired at Vintage Books in Vancouver, WA.",
      isFeatured: true,
      displayOrder: 11,
      accentColor: "#B45309",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "aunt-bonnies-okc-vintage",
      bookstoreId: "aunt-bonnies-book-house",
      title: "Aunt Bonnie's Book House Oklahoma City Bookmark",
      accessionNo: "BM-1984-OK-14",
      frontImageUrl: "/seed-images/auntbonnies-front.svg",
      backImageUrl: "/seed-images/auntbonnies-back.svg",
      yearProduced: 1984,
      material: "Rose Tinted Soft Touch Cardstock",
      dimensions: "2.25\" × 7.5\"",
      condition: "Very Good",
      acquisitionDate: "2018-03-10",
      acquisitionNotes: "Acquired from an Oklahoma collector.",
      isFeatured: false,
      displayOrder: 12,
      accentColor: "#BE185D",
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
    {
      id: "greenapple-clipping-chronicle-1967",
      bookstoreId: "green-apple-books",
      mediaType: "newspaper",
      imageUrl: "/seed-images/greenapple-front.svg",
      caption: "San Francisco Chronicle: 'Richard Savoy Opens Used Book Haven on Clement Street'",
      sourcePublication: "San Francisco Chronicle",
      publicationDate: "September 15, 1967",
      transcriptionText: `“SAN FRANCISCO — A promising new haven for book collectors has opened in the Inner Richmond at 506 Clement Street. Founded by Richard Savoy, Green Apple Books offers thousands of paperbacks, rare editions, and comix in an inviting, informal shop that invites browsing from morning until late evening.”`,
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

if (require.main === module || process.argv[1]?.includes("seed.ts")) {
  seedDatabase()
    .then(() => {
      console.log("Database seeded successfully with Green Apple Books!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
