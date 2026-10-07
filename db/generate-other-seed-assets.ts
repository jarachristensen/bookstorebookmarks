import fs from "fs";
import path from "path";

export function ensureOtherSeedAssets() {
  const otherDir = path.join(process.cwd(), "public", "seed-images", "other");
  if (!fs.existsSync(otherDir)) {
    fs.mkdirSync(otherDir, { recursive: true });
  }

  // 1. Seattle Public Library Borrower Card (Front & Back)
  const splFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FDFBF7" rx="4" />
    <rect x="12" y="12" width="296" height="876" fill="none" stroke="#2563EB" stroke-width="1.5" stroke-dasharray="6 3" rx="2" />
    <rect x="16" y="16" width="288" height="868" fill="none" stroke="#1E293B" stroke-width="0.75" rx="2" />
    <g transform="translate(40, 50)">
      <rect width="240" height="80" fill="#2563EB" rx="6" />
      <text x="120" y="36" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">SEATTLE PUBLIC LIBRARY</text>
      <text x="120" y="60" font-family="'Courier New', monospace" font-size="11" fill="#93C5FD" text-anchor="middle">OFFICIAL BORROWER EPHEMERA</text>
    </g>
    <g transform="translate(40, 160)">
      <rect width="240" height="420" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" rx="4" />
      <text x="20" y="30" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#0F172A">DATE DUE</text>
      <text x="140" y="30" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#0F172A">BORROWER</text>
      <line x1="10" y1="40" x2="230" y2="40" stroke="#CBD5E1" stroke-width="1" />
      
      <text x="20" y="70" font-family="'Courier New', monospace" font-size="11" fill="#DC2626">OCT 14 1984</text>
      <text x="140" y="70" font-family="'Courier New', monospace" font-size="11" fill="#334155">#8402-A</text>
      
      <text x="20" y="110" font-family="'Courier New', monospace" font-size="11" fill="#2563EB">NOV 02 1984</text>
      <text x="140" y="110" font-family="'Courier New', monospace" font-size="11" fill="#334155">#9120-C</text>
      
      <text x="20" y="150" font-family="'Courier New', monospace" font-size="11" fill="#059669">JAN 18 1985</text>
      <text x="140" y="150" font-family="'Courier New', monospace" font-size="11" fill="#334155">#1109-F</text>
      
      <text x="20" y="190" font-family="'Courier New', monospace" font-size="11" fill="#D97706">MAR 29 1985</text>
      <text x="140" y="190" font-family="'Courier New', monospace" font-size="11" fill="#334155">#5512-B</text>
      
      <text x="20" y="230" font-family="'Courier New', monospace" font-size="11" fill="#DC2626">AUG 12 1986</text>
      <text x="140" y="230" font-family="'Courier New', monospace" font-size="11" fill="#334155">#4019-E</text>

      <text x="20" y="270" font-family="'Courier New', monospace" font-size="11" fill="#7C3AED">DEC 04 1987</text>
      <text x="140" y="270" font-family="'Courier New', monospace" font-size="11" fill="#334155">#7821-K</text>
    </g>
    <g transform="translate(40, 610)">
      <rect width="240" height="240" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" rx="4" />
      <text x="120" y="35" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#1E3A8A" text-anchor="middle">PLEASE KEEP THIS CARD</text>
      <text x="120" y="60" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#3B82F6" text-anchor="middle">Books may be renewed once for 14 days.</text>
      <text x="120" y="120" font-family="'Courier New', monospace" font-size="10" fill="#64748B" text-anchor="middle">SEATTLE PUBLIC LIBRARY SYSTEM</text>
      <text x="120" y="140" font-family="'Courier New', monospace" font-size="10" fill="#64748B" text-anchor="middle">CENTRAL BRANCH · 1000 4TH AVE</text>
      <circle cx="120" cy="185" r="24" fill="none" stroke="#2563EB" stroke-width="1.5" />
      <text x="120" y="190" font-family="sans-serif" font-size="16" fill="#2563EB" text-anchor="middle">📚</text>
    </g>
  </svg>`;

  const splBack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FAF8F5" rx="4" />
    <rect x="16" y="16" width="288" height="868" fill="none" stroke="#E2E8F0" stroke-width="1" rx="2" />
    <g transform="translate(40, 100)">
      <text x="120" y="40" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1E293B" text-anchor="middle">LIBRARY RULES &amp; NOTICES</text>
      <line x1="20" y1="55" x2="220" y2="55" stroke="#2563EB" stroke-width="1.5" />
      
      <text x="10" y="90" font-family="Georgia, serif" font-size="12" fill="#475569">1. Please handle all library books with care.</text>
      <text x="10" y="120" font-family="Georgia, serif" font-size="12" fill="#475569">2. Return books on or before due date stamped.</text>
      <text x="10" y="150" font-family="Georgia, serif" font-size="12" fill="#475569">3. Fines of 5¢ per day are assessed on late items.</text>
      <text x="10" y="180" font-family="Georgia, serif" font-size="12" fill="#475569">4. Lost card replacement fee: 50¢.</text>

      <rect x="10" y="240" width="220" height="280" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" rx="4" />
      <text x="120" y="280" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#0F172A" text-anchor="middle">ARCHIVAL PROVENANCE</text>
      <text x="120" y="320" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#64748B" text-anchor="middle">Deaccessioned Collection</text>
      <text x="120" y="350" font-family="'Courier New', monospace" font-size="10" fill="#94A3B8" text-anchor="middle">Item # SPL-EP-1984-77</text>
      <text x="120" y="440" font-family="Georgia, serif" font-size="18" fill="#2563EB" text-anchor="middle">❧ ✦ ☙</text>
    </g>
  </svg>`;

  // 2. Penguin Classics Orange Spine Bookmark (Front & Back)
  const penguinFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FAF6EE" rx="4" />
    <rect x="0" y="0" width="320" height="260" fill="#EA580C" />
    <rect x="0" y="260" width="320" height="380" fill="#FFFFFF" />
    <rect x="0" y="640" width="320" height="260" fill="#EA580C" />
    
    <g transform="translate(0, 70)">
      <circle cx="160" cy="40" r="30" fill="#FFFFFF" />
      <!-- Penguin silhouette -->
      <path d="M 160 22 C 152 22 147 28 147 38 C 147 48 152 58 160 58 C 168 58 173 48 173 38 C 173 28 168 22 160 22 Z" fill="#18181B" />
      <circle cx="160" cy="42" r="8" fill="#FFFFFF" />
      <text x="160" y="110" font-family="'Gill Sans', 'Helvetica Neue', sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">PENGUIN</text>
      <text x="160" y="135" font-family="'Gill Sans', 'Helvetica Neue', sans-serif" font-size="16" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">BOOKS</text>
    </g>

    <g transform="translate(30, 310)">
      <text x="130" y="40" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#18181B" text-anchor="middle">THE PENGUIN CLASSICS</text>
      <line x1="30" y1="55" x2="230" y2="55" stroke="#EA580C" stroke-width="2" />
      <text x="130" y="90" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#4B5563" text-anchor="middle">Founder &amp; Editor: E. V. Rieu</text>
      <text x="130" y="140" font-family="'Gill Sans', sans-serif" font-size="12" fill="#1F2937" text-anchor="middle" letter-spacing="1">A COMPLETE LIBRARY OF WORLD</text>
      <text x="130" y="160" font-family="'Gill Sans', sans-serif" font-size="12" fill="#1F2937" text-anchor="middle" letter-spacing="1">MASTERPIECES IN TRANSLATION</text>
      <text x="130" y="240" font-family="Georgia, serif" font-size="16" fill="#EA580C" text-anchor="middle">★ ★ ★</text>
    </g>

    <g transform="translate(0, 700)">
      <text x="160" y="40" font-family="'Gill Sans', sans-serif" font-size="14" font-weight="bold" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">HARMONDSWORTH</text>
      <text x="160" y="65" font-family="'Gill Sans', sans-serif" font-size="12" fill="#FED7AA" text-anchor="middle" letter-spacing="2">MIDDLESEX · ENGLAND</text>
      <text x="160" y="110" font-family="'Gill Sans', sans-serif" font-size="11" fill="#FFFFFF" text-anchor="middle">PRINTED ON AUTHENTIC CHIPBOARD</text>
    </g>
  </svg>`;

  const penguinBack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FAF6EE" rx="4" />
    <g transform="translate(30, 60)">
      <text x="130" y="30" font-family="'Gill Sans', sans-serif" font-size="16" font-weight="bold" fill="#EA580C" text-anchor="middle" letter-spacing="2">RECENT CLASSICS TITLES</text>
      <line x1="20" y1="45" x2="240" y2="45" stroke="#18181B" stroke-width="1" />
      
      <text x="10" y="80" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#18181B">L1 · HOMER: The Odyssey</text>
      <text x="10" y="100" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#6B7280">Translated by E.V. Rieu</text>

      <text x="10" y="140" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#18181B">L2 · MAUPASSANT: Boule de Suif</text>
      <text x="10" y="160" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#6B7280">Translated by H.N.P. Sloman</text>

      <text x="10" y="200" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#18181B">L5 · VOLTAIRE: Candide</text>
      <text x="10" y="220" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#6B7280">Translated by John Butt</text>

      <text x="10" y="260" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#18181B">L14 · HOMER: The Iliad</text>
      <text x="10" y="280" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#6B7280">Translated by E.V. Rieu</text>

      <text x="10" y="320" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#18181B">L23 · TOLSTOY: War and Peace</text>
      <text x="10" y="340" font-family="Georgia, serif" font-size="10" font-style="italic" fill="#6B7280">Translated by Rosemary Edmonds</text>

      <rect x="10" y="440" width="240" height="300" fill="#FFFFFF" stroke="#EA580C" stroke-width="1.5" rx="4" />
      <text x="130" y="480" font-family="'Gill Sans', sans-serif" font-size="14" font-weight="bold" fill="#EA580C" text-anchor="middle">PENGUIN COLLECTORS NOTE</text>
      <text x="130" y="520" font-family="Georgia, serif" font-size="11" fill="#4B5563" text-anchor="middle">Original promotional bookmark issued</text>
      <text x="130" y="540" font-family="Georgia, serif" font-size="11" fill="#4B5563" text-anchor="middle">with English paperback first editions.</text>
      <circle cx="130" cy="620" r="28" fill="#EA580C" />
      <text x="130" y="628" font-family="sans-serif" font-size="20" fill="#FFFFFF" text-anchor="middle">🐧</text>
    </g>
  </svg>`;

  // 3. Metropolitan Museum of Art Exhibition Bookmark (Front & Back)
  const metFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#1C1917" rx="4" />
    <rect x="12" y="12" width="296" height="876" fill="none" stroke="#D97706" stroke-width="1.5" rx="2" />
    <g transform="translate(35, 60)">
      <text x="125" y="40" font-family="'Times New Roman', serif" font-size="22" font-weight="bold" fill="#FBBF24" text-anchor="middle" letter-spacing="3">THE MET</text>
      <text x="125" y="65" font-family="sans-serif" font-size="10" font-weight="600" fill="#D97706" text-anchor="middle" letter-spacing="4">THE METROPOLITAN MUSEUM OF ART</text>
      <line x1="20" y1="80" x2="230" y2="80" stroke="#D97706" stroke-width="1" />
      
      <!-- Gold leaf illustration frame -->
      <rect x="15" y="120" width="220" height="340" fill="#292524" stroke="#FBBF24" stroke-width="2" rx="4" />
      <circle cx="125" cy="230" r="60" fill="none" stroke="#D97706" stroke-width="1.5" />
      <text x="125" y="238" font-family="Georgia, serif" font-size="28" fill="#FBBF24" text-anchor="middle">✦</text>
      <text x="125" y="320" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#FFFFFF" text-anchor="middle">DEGAS EXHIBITION</text>
      <text x="125" y="345" font-family="Georgia, serif" font-size="12" font-style="italic" fill="#D97706" text-anchor="middle">Autumn Retrospective 1988</text>
      <text x="125" y="380" font-family="'Courier New', monospace" font-size="10" fill="#A8A29E" text-anchor="middle">FIFTH AVENUE AT 82ND STREET</text>

      <text x="125" y="560" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#E7E5E4" text-anchor="middle">“Art is not what you see, but what</text>
      <text x="125" y="585" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#E7E5E4" text-anchor="middle">you make others see.”</text>
      <text x="125" y="620" font-family="sans-serif" font-size="11" font-weight="bold" fill="#FBBF24" text-anchor="middle">— EDGAR DEGAS</text>

      <rect x="25" y="700" width="200" height="60" fill="#292524" stroke="#44403C" stroke-width="1" rx="4" />
      <text x="125" y="735" font-family="'Courier New', monospace" font-size="10" fill="#FBBF24" text-anchor="middle">MUSEUM SHOP EPHEMERA · NY</text>
    </g>
  </svg>`;

  const metBack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#292524" rx="4" />
    <g transform="translate(35, 100)">
      <text x="125" y="40" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#FBBF24" text-anchor="middle">THE METROPOLITAN MUSEUM</text>
      <text x="125" y="65" font-family="'Courier New', monospace" font-size="10" fill="#A8A29E" text-anchor="middle">NEW YORK · FOUNDED 1870</text>
      <line x1="30" y1="85" x2="220" y2="85" stroke="#D97706" stroke-width="1" />
      
      <text x="125" y="140" font-family="Georgia, serif" font-size="12" fill="#E7E5E4" text-anchor="middle">Open Tuesday through Sunday</text>
      <text x="125" y="165" font-family="Georgia, serif" font-size="12" fill="#E7E5E4" text-anchor="middle">Pay-what-you-wish admission</text>
      
      <rect x="20" y="240" width="210" height="340" fill="#1C1917" stroke="#44403C" stroke-width="1" rx="4" />
      <text x="125" y="280" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#FBBF24" text-anchor="middle">MEMBERSHIP PRIVILEGES</text>
      <text x="125" y="320" font-family="Georgia, serif" font-size="11" fill="#A8A29E" text-anchor="middle">Free admission to all galleries</text>
      <text x="125" y="350" font-family="Georgia, serif" font-size="11" fill="#A8A29E" text-anchor="middle">10% discount in Museum Bookshop</text>
      <text x="125" y="380" font-family="Georgia, serif" font-size="11" fill="#A8A29E" text-anchor="middle">Invitations to Evening Previews</text>
      <text x="125" y="480" font-family="Georgia, serif" font-size="20" fill="#D97706" text-anchor="middle">🏛</text>
    </g>
  </svg>`;

  // 4. The Paris Review Literary Quarterly Bookmark (Front & Back)
  const parisReviewFront = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FAF8F5" rx="4" />
    <rect x="14" y="14" width="292" height="872" fill="none" stroke="#DC2626" stroke-width="2" rx="2" />
    <g transform="translate(35, 60)">
      <text x="125" y="40" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="#DC2626" text-anchor="middle" letter-spacing="3">FEATURING WRITERS AT WORK</text>
      <text x="125" y="80" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="900" fill="#18181B" text-anchor="middle">THE PARIS</text>
      <text x="125" y="110" font-family="'Playfair Display', Georgia, serif" font-size="26" font-weight="900" fill="#18181B" text-anchor="middle">REVIEW</text>
      <line x1="40" y1="130" x2="210" y2="130" stroke="#DC2626" stroke-width="1.5" />
      
      <!-- Crown / Bird Emblem -->
      <circle cx="125" cy="200" r="38" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5" />
      <text x="125" y="210" font-family="Georgia, serif" font-size="24" fill="#DC2626" text-anchor="middle">🦅</text>

      <g transform="translate(10, 270)">
        <rect width="230" height="260" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1" rx="4" />
        <text x="115" y="35" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#18181B" text-anchor="middle">INTERVIEW ARCHIVE</text>
        <line x1="20" y1="48" x2="210" y2="48" stroke="#DC2626" stroke-width="1" />
        <text x="115" y="80" font-family="Georgia, serif" font-size="11" fill="#374151" text-anchor="middle">Ernest Hemingway · Issue No. 18</text>
        <text x="115" y="115" font-family="Georgia, serif" font-size="11" fill="#374151" text-anchor="middle">Gabriel García Márquez · No. 82</text>
        <text x="115" y="150" font-family="Georgia, serif" font-size="11" fill="#374151" text-anchor="middle">Toni Morrison · Issue No. 128</text>
        <text x="115" y="185" font-family="Georgia, serif" font-size="11" fill="#374151" text-anchor="middle">Joan Didion · Issue No. 71</text>
        <text x="115" y="225" font-family="'Courier New', monospace" font-size="10" font-weight="bold" fill="#DC2626" text-anchor="middle">FOUNDED 1953 · PARIS / NYC</text>
      </g>

      <text x="125" y="600" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#4B5563" text-anchor="middle">“The Art of Fiction”</text>
      <text x="125" y="625" font-family="'Courier New', monospace" font-size="11" fill="#18181B" text-anchor="middle">QUARTERLY LITERARY EPHEMERA</text>
      
      <rect x="20" y="690" width="210" height="70" fill="#FEE2E2" stroke="#FCA5A5" stroke-width="1" rx="4" />
      <text x="125" y="730" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#991B1B" text-anchor="middle">LIMITED EDITION PRINT</text>
    </g>
  </svg>`;

  const parisReviewBack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
    <rect width="320" height="900" fill="#FAF8F5" rx="4" />
    <g transform="translate(35, 100)">
      <text x="125" y="40" font-family="'Courier New', monospace" font-size="12" font-weight="bold" fill="#DC2626" text-anchor="middle">SUBSCRIPTION CARD &amp; NOTICE</text>
      <line x1="20" y1="60" x2="230" y2="60" stroke="#18181B" stroke-width="1" />
      
      <text x="125" y="100" font-family="Georgia, serif" font-size="12" fill="#374151" text-anchor="middle">Subscribe to 4 issues for $20</text>
      <text x="125" y="130" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#6B7280" text-anchor="middle">541 East 72nd Street, New York, NY</text>
      
      <rect x="15" y="200" width="220" height="400" fill="#FFFFFF" stroke="#DC2626" stroke-width="1" stroke-dasharray="4 4" rx="4" />
      <text x="125" y="240" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#18181B" text-anchor="middle">PROVENANCE LOG</text>
      <text x="125" y="280" font-family="Georgia, serif" font-size="11" fill="#4B5563" text-anchor="middle">Acquired from the personal</text>
      <text x="125" y="305" font-family="Georgia, serif" font-size="11" fill="#4B5563" text-anchor="middle">collection of a Greenwich Village</text>
      <text x="125" y="330" font-family="Georgia, serif" font-size="11" fill="#4B5563" text-anchor="middle">literary magazine subscriber.</text>
      <text x="125" y="480" font-family="Georgia, serif" font-size="24" fill="#DC2626" text-anchor="middle">✒</text>
    </g>
  </svg>`;

  fs.writeFileSync(path.join(otherDir, "spl-card-front.svg"), splFront);
  fs.writeFileSync(path.join(otherDir, "spl-card-back.svg"), splBack);
  fs.writeFileSync(path.join(otherDir, "penguin-classics-front.svg"), penguinFront);
  fs.writeFileSync(path.join(otherDir, "penguin-classics-back.svg"), penguinBack);
  fs.writeFileSync(path.join(otherDir, "met-museum-front.svg"), metFront);
  fs.writeFileSync(path.join(otherDir, "met-museum-back.svg"), metBack);
  fs.writeFileSync(path.join(otherDir, "paris-review-front.svg"), parisReviewFront);
  fs.writeFileSync(path.join(otherDir, "paris-review-back.svg"), parisReviewBack);
}
