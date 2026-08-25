import fs from "fs";
import path from "path";

export function ensureSeedAssets() {
  try {
    const seedDir = path.resolve(process.cwd(), "public/seed-images");
    if (!fs.existsSync(seedDir)) {
      try {
        fs.mkdirSync(seedDir, { recursive: true });
      } catch {
        // Read-only filesystem (e.g. Vercel)
        return;
      }
    }

    const assets: Record<string, string> = {
      // 1. Gotham Book Mart
      "gotham-front.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <defs>
          <filter id="paper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="1 0 0 0 0.98  0 1 0 0 0.96  0 0 1 0 0.91  0 0 0 1 0" />
          </filter>
          <pattern id="linen" width="4" height="4" patternUnits="userSpaceOnUse">
            <path d="M 0 0 L 4 4 M 4 0 L 0 4" stroke="#E6DFD1" stroke-width="0.5" />
          </pattern>
        </defs>
        <!-- Background Paper -->
        <rect width="320" height="900" fill="#FAF6EE" rx="4" />
        <rect width="320" height="900" fill="url(#linen)" opacity="0.4" />
        <rect x="12" y="12" width="296" height="876" fill="none" stroke="#881337" stroke-width="1.5" stroke-dasharray="8 4" rx="2" />
        <rect x="16" y="16" width="288" height="868" fill="none" stroke="#292524" stroke-width="0.75" rx="2" />
        
        <!-- Top Ribbon / Motif -->
        <path d="M 160 40 L 175 65 L 145 65 Z" fill="#881337" />
        <circle cx="160" cy="85" r="18" fill="none" stroke="#881337" stroke-width="2" />
        <text x="160" y="91" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#881337" text-anchor="middle">GBM</text>
        
        <!-- Woodcut Illustration: Wise Men Fish Here -->
        <g transform="translate(40, 130)">
          <rect width="240" height="240" fill="#F4EFE6" stroke="#292524" stroke-width="2" />
          <!-- Ocean waves -->
          <path d="M 10 200 Q 60 170 120 200 T 230 200 L 230 230 L 10 230 Z" fill="#292524" opacity="0.15" />
          <path d="M 10 210 Q 70 190 130 210 T 230 210" stroke="#292524" stroke-width="2" fill="none" />
          <!-- Small rowboat -->
          <path d="M 70 170 Q 120 185 170 170 L 160 195 Q 120 205 80 195 Z" fill="#292524" />
          <!-- Fishermen figures -->
          <circle cx="105" cy="145" r="10" fill="#292524" />
          <path d="M 105 155 L 100 175 L 115 175 Z" fill="#292524" />
          <circle cx="135" cy="142" r="10" fill="#292524" />
          <path d="M 135 152 L 130 175 L 145 175 Z" fill="#292524" />
          <!-- Fishing rod & Hook catching a book -->
          <path d="M 140 145 Q 180 110 210 130" stroke="#292524" stroke-width="2" fill="none" />
          <path d="M 210 130 L 210 180" stroke="#292524" stroke-width="1" stroke-dasharray="2 2" fill="none" />
          <!-- The Book -->
          <rect x="200" y="175" width="20" height="26" fill="#881337" rx="2" transform="rotate(15 210 188)" />
          <text x="210" y="192" font-family="sans-serif" font-size="8" fill="#FAF6EE" text-anchor="middle" font-weight="bold">✦</text>
        </g>
        
        <!-- Iconic Motto -->
        <text x="160" y="420" font-family="Georgia, serif" font-size="17" font-style="italic" fill="#881337" text-anchor="middle" letter-spacing="1">“Wise Men Fish Here”</text>
        <line x1="80" y1="435" x2="240" y2="435" stroke="#881337" stroke-width="1" />
        
        <!-- Store Name -->
        <text x="160" y="480" font-family="'Playfair Display', Georgia, serif" font-size="24" font-weight="bold" fill="#1C1917" text-anchor="middle" letter-spacing="2">GOTHAM</text>
        <text x="160" y="510" font-family="'Playfair Display', Georgia, serif" font-size="22" font-weight="bold" fill="#1C1917" text-anchor="middle" letter-spacing="2">BOOK MART</text>
        
        <!-- Location & Specialties -->
        <text x="160" y="560" font-family="sans-serif" font-size="12" font-weight="600" fill="#78716C" text-anchor="middle" letter-spacing="3">41 WEST 47TH STREET</text>
        <text x="160" y="585" font-family="sans-serif" font-size="11" fill="#78716C" text-anchor="middle" letter-spacing="2">NEW YORK CITY</text>
        <text x="160" y="620" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#292524" text-anchor="middle">Headquarters: The James Joyce Society</text>
        
        <!-- Decorative Filigree -->
        <text x="160" y="670" font-family="Georgia, serif" font-size="20" fill="#881337" text-anchor="middle">❧ ❦ ☙</text>
        
        <!-- Bottom Accession & Year -->
        <rect x="35" y="780" width="250" height="70" fill="#F3EFE6" rx="4" stroke="#E2DACB" stroke-width="1" />
        <text x="160" y="805" font-family="monospace" font-size="11" font-weight="bold" fill="#881337" text-anchor="middle" letter-spacing="1.5">CATALOG: BM-1934-NY-01</text>
        <text x="160" y="825" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">Established 1920 · Frances Steloff</text>
        <text x="160" y="842" font-family="sans-serif" font-size="9" fill="#A8A29E" text-anchor="middle">ARCHIVAL SPECIMEN REPRODUCTION</text>
      </svg>`,

      "gotham-back.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#F5EFE4" rx="4" />
        <rect x="16" y="16" width="288" height="868" fill="none" stroke="#D5C8B4" stroke-width="1" rx="2" />
        <text x="160" y="60" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1C1917" text-anchor="middle">SPECIAL ANNOUNCEMENT</text>
        <line x1="60" y1="75" x2="260" y2="75" stroke="#881337" stroke-width="1" />
        <g transform="translate(35, 110)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="13" fill="#292524" line-height="1.6">
            <tspan x="0" dy="0">“We specialize in modern first editions,</tspan>
            <tspan x="0" dy="24">avant-garde literary journals, cinema,</tspan>
            <tspan x="0" dy="24">theatre art, and surrealist poetry.</tspan>
            <tspan x="0" dy="36">Appointed agents for Transition,</tspan>
            <tspan x="0" dy="24">The Little Review, and Horizon.”</tspan>
          </text>
        </g>
        <rect x="35" y="270" width="250" height="340" fill="#FAF6EE" stroke="#E2DACB" stroke-width="1" rx="4" />
        <text x="160" y="300" font-family="sans-serif" font-size="11" font-weight="bold" fill="#881337" text-anchor="middle" letter-spacing="1">FREQUENT AUTHORS &amp; PATRONS</text>
        <line x1="60" y1="315" x2="260" y2="315" stroke="#E2DACB" stroke-width="0.75" />
        <text x="55" y="345" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ James Joyce</text>
        <text x="55" y="375" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Anaïs Nin</text>
        <text x="55" y="405" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Henry Miller</text>
        <text x="55" y="435" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Marianne Moore</text>
        <text x="55" y="465" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ E.E. Cummings</text>
        <text x="55" y="495" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Tennessee Williams</text>
        <text x="55" y="525" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Patti Smith</text>
        <text x="55" y="555" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Gore Vidal</text>
        <text x="55" y="585" font-family="Georgia, serif" font-size="12" fill="#44403C">✦ Allen Ginsberg</text>
        
        <!-- Vintage postal cancel / stamp -->
        <circle cx="160" cy="710" r="45" fill="none" stroke="#881337" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.7" />
        <text x="160" y="700" font-family="monospace" font-size="10" fill="#881337" text-anchor="middle">NEW YORK, N.Y.</text>
        <text x="160" y="715" font-family="monospace" font-size="9" fill="#881337" text-anchor="middle">OCT 14 1934</text>
        <text x="160" y="730" font-family="monospace" font-size="8" fill="#881337" text-anchor="middle">GOTHAM STATION</text>
        
        <text x="160" y="840" font-family="monospace" font-size="10" fill="#78716C" text-anchor="middle">PRESERVED IN EPHEMERA ARCHIVE</text>
      </svg>`,

      // 2. Shakespeare and Company
      "shakespeare-front.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#FDFBF7" rx="4" />
        <rect x="12" y="12" width="296" height="876" fill="none" stroke="#14532D" stroke-width="2" rx="2" />
        <rect x="18" y="18" width="284" height="864" fill="none" stroke="#B45309" stroke-width="0.75" rx="2" />
        
        <!-- Paris Crest -->
        <g transform="translate(160, 80)">
          <circle cx="0" cy="0" r="30" fill="#14532D" />
          <text x="0" y="8" font-family="'EB Garamond', serif" font-size="24" font-weight="bold" fill="#FDFBF7" text-anchor="middle">S&amp;C</text>
        </g>
        
        <!-- Storefront Illustration -->
        <g transform="translate(45, 140)">
          <rect width="230" height="230" fill="#F4EFE6" stroke="#14532D" stroke-width="2" />
          <!-- Yellow sign backdrop -->
          <rect x="20" y="30" width="190" height="40" fill="#14532D" rx="3" />
          <text x="115" y="55" font-family="'EB Garamond', serif" font-size="12" font-weight="bold" fill="#FDE047" text-anchor="middle" letter-spacing="1">SHAKESPEARE AND COMPANY</text>
          <!-- Bookshelf windows -->
          <rect x="25" y="85" width="80" height="120" fill="#FAF6EE" stroke="#14532D" stroke-width="1.5" />
          <line x1="25" y1="125" x2="105" y2="125" stroke="#14532D" />
          <line x1="25" y1="165" x2="105" y2="165" stroke="#14532D" />
          <!-- Miniature books on shelf -->
          <rect x="30" y="95" width="12" height="30" fill="#881337" />
          <rect x="44" y="100" width="10" height="25" fill="#14532D" />
          <rect x="56" y="90" width="14" height="35" fill="#B45309" />
          <rect x="72" y="102" width="12" height="23" fill="#1E293B" />
          <!-- Door -->
          <rect x="125" y="85" width="80" height="140" fill="#14532D" />
          <rect x="135" y="95" width="60" height="60" fill="#FAF6EE" opacity="0.3" />
        </g>
        
        <text x="160" y="415" font-family="'EB Garamond', Georgia, serif" font-size="24" font-weight="bold" fill="#14532D" text-anchor="middle" letter-spacing="1.5">SHAKESPEARE</text>
        <text x="160" y="445" font-family="'EB Garamond', Georgia, serif" font-size="20" font-style="italic" fill="#B45309" text-anchor="middle">&amp; COMPANY</text>
        
        <line x1="60" y1="465" x2="260" y2="465" stroke="#14532D" stroke-width="1" />
        
        <text x="160" y="500" font-family="sans-serif" font-size="12" font-weight="bold" fill="#292524" text-anchor="middle" letter-spacing="2">37 RUE DE LA BÛCHERIE</text>
        <text x="160" y="525" font-family="sans-serif" font-size="11" fill="#78716C" text-anchor="middle" letter-spacing="2">PARIS Vᵉ · KILOMETRE ZERO</text>
        
        <!-- Whitman Motto -->
        <rect x="35" y="560" width="250" height="120" fill="#F4EFE6" stroke="#E2DACB" stroke-width="1" rx="4" />
        <text x="160" y="590" font-family="Georgia, serif" font-size="12" font-style="italic" fill="#14532D" text-anchor="middle">“Be not inhospitable to strangers</text>
        <text x="160" y="612" font-family="Georgia, serif" font-size="12" font-style="italic" fill="#14532D" text-anchor="middle">lest they be angels in disguise.”</text>
        <line x1="100" y1="630" x2="220" y2="630" stroke="#B45309" stroke-width="0.75" />
        <text x="160" y="655" font-family="sans-serif" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">HOME OF THE TUMBLEWEEDS</text>
        
        <!-- Bottom Accession -->
        <rect x="35" y="780" width="250" height="70" fill="#F3EFE6" rx="4" stroke="#E2DACB" stroke-width="1" />
        <text x="160" y="805" font-family="monospace" font-size="11" font-weight="bold" fill="#14532D" text-anchor="middle" letter-spacing="1.5">CATALOG: BM-1951-PAR-02</text>
        <text x="160" y="825" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">Founded 1919 by Sylvia Beach</text>
        <text x="160" y="842" font-family="sans-serif" font-size="9" fill="#A8A29E" text-anchor="middle">1951 George Whitman Revival</text>
      </svg>`,

      // 2b. Shakespeare Back
      "shakespeare-back.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#F4EFE6" rx="4" />
        <rect x="16" y="16" width="288" height="868" fill="none" stroke="#D4C5B0" stroke-width="1" rx="2" />
        
        <!-- Famous Blue Stamp -->
        <g transform="translate(160, 120)">
          <circle cx="0" cy="0" r="60" fill="none" stroke="#1E3A8A" stroke-width="3" stroke-dasharray="6 3" />
          <circle cx="0" cy="0" r="52" fill="none" stroke="#1E3A8A" stroke-width="1" />
          <text x="0" y="-22" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1E3A8A" text-anchor="middle" letter-spacing="2">SHAKESPEARE AND COMPANY</text>
          <text x="0" y="-2" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1E3A8A" text-anchor="middle">PARIS</text>
          <text x="0" y="18" font-family="sans-serif" font-size="8" fill="#1E3A8A" text-anchor="middle">KILOMETRE ZERO</text>
          <text x="0" y="32" font-family="sans-serif" font-size="7" fill="#1E3A8A" text-anchor="middle">37 RUE DE LA BÛCHERIE</text>
        </g>
        
        <rect x="35" y="240" width="250" height="380" fill="#FAF6EE" stroke="#E2DACB" stroke-width="1" rx="4" />
        <text x="160" y="275" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#14532D" text-anchor="middle">THE LITERARY CIRCLE</text>
        <line x1="80" y1="290" x2="240" y2="290" stroke="#14532D" stroke-width="1" />
        
        <g transform="translate(45, 320)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="12" fill="#292524" line-height="1.8">
            <tspan x="0" dy="0">Sylvia Beach famously published</tspan>
            <tspan x="0" dy="22">James Joyce’s Ulysses in 1922 when</tspan>
            <tspan x="0" dy="22">no English-language press dared.</tspan>
            <tspan x="0" dy="36">George Whitman later hosted</tspan>
            <tspan x="0" dy="22">over 30,000 writers to sleep</tspan>
            <tspan x="0" dy="22">among the shelves in exchange</tspan>
            <tspan x="0" dy="22">for reading a book a day.</tspan>
          </text>
        </g>
        
        <text x="160" y="550" font-family="sans-serif" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle">NOTABLE GUESTS</text>
        <text x="160" y="575" font-family="Georgia, serif" font-size="11" fill="#44403C" text-anchor="middle">Ernest Hemingway · F. Scott Fitzgerald</text>
        <text x="160" y="595" font-family="Georgia, serif" font-size="11" fill="#44403C" text-anchor="middle">James Baldwin · Allen Ginsberg</text>
        <text x="160" y="615" font-family="Georgia, serif" font-size="11" fill="#44403C" text-anchor="middle">Anaïs Nin · William Burroughs</text>
        
        <rect x="35" y="680" width="250" height="150" fill="#FDFBF7" stroke="#14532D" stroke-width="1" rx="4" />
        <text x="160" y="715" font-family="sans-serif" font-size="10" font-weight="bold" fill="#14532D" text-anchor="middle" letter-spacing="1">CURATOR'S NOTE</text>
        <text x="160" y="745" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">Hand-stamped in Paris with</text>
        <text x="160" y="765" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">original purple archival ink.</text>
        <text x="160" y="795" font-family="monospace" font-size="9" fill="#14532D" text-anchor="middle">ARCHIVAL SPECIMEN VERIFIED</text>
      </svg>`,

      // 3. City Lights Booksellers
      "citylights-front.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#F7F4EA" rx="4" />
        <rect x="14" y="14" width="292" height="872" fill="none" stroke="#1C1917" stroke-width="3" rx="2" />
        <rect x="20" y="20" width="280" height="860" fill="none" stroke="#881337" stroke-width="1" rx="2" />
        
        <!-- Bold Typographic Masthead -->
        <g transform="translate(160, 75)">
          <rect x="-120" y="-35" width="240" height="70" fill="#1C1917" rx="3" />
          <text x="0" y="-5" font-family="sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">CITY LIGHTS</text>
          <text x="0" y="18" font-family="sans-serif" font-size="11" font-weight="bold" fill="#E2DACB" text-anchor="middle" letter-spacing="2">BOOKSELLERS &amp; PUBLISHERS</text>
        </g>
        
        <!-- Woodcut/Linocut San Francisco Beat Motif -->
        <g transform="translate(45, 145)">
          <rect width="230" height="230" fill="#1C1917" />
          <!-- Streetlight beam -->
          <polygon points="115,20 30,220 200,220" fill="#FDE047" opacity="0.3" />
          <!-- Street Lamp -->
          <path d="M 115 15 L 115 220" stroke="#FAF6EE" stroke-width="4" />
          <circle cx="115" cy="25" r="14" fill="#FDE047" />
          <!-- Street sign: Columbus Ave & Broadway -->
          <rect x="60" y="80" width="110" height="22" fill="#FAF6EE" stroke="#1C1917" stroke-width="1" />
          <text x="115" y="95" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1C1917" text-anchor="middle">COLUMBUS &amp; BROADWAY</text>
          <!-- Open book icon -->
          <path d="M 85 160 Q 115 150 145 160 L 145 190 Q 115 180 85 190 Z" fill="#881337" stroke="#FAF6EE" stroke-width="1.5" />
        </g>
        
        <text x="160" y="420" font-family="sans-serif" font-size="14" font-weight="bold" fill="#881337" text-anchor="middle" letter-spacing="3">NORTH BEACH · SAN FRANCISCO</text>
        <line x1="50" y1="435" x2="270" y2="435" stroke="#1C1917" stroke-width="1" />
        
        <g transform="translate(45, 470)">
          <text x="115" y="0" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#1C1917" text-anchor="middle">“A Literary Meeting Place</text>
          <text x="115" y="24" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#1C1917" text-anchor="middle">Since 1953”</text>
          <text x="115" y="60" font-family="sans-serif" font-size="11" font-weight="bold" fill="#78716C" text-anchor="middle" letter-spacing="1">FOUNDED BY LAWRENCE FERLINGHETTI</text>
          <text x="115" y="80" font-family="sans-serif" font-size="10" fill="#78716C" text-anchor="middle">&amp; PETER D. MARTIN</text>
        </g>
        
        <!-- Pocket Poets Series Badge -->
        <rect x="35" y="600" width="250" height="140" fill="#FAF6EE" stroke="#1C1917" stroke-width="1.5" rx="4" />
        <text x="160" y="630" font-family="sans-serif" font-size="11" font-weight="900" fill="#1C1917" text-anchor="middle" letter-spacing="2">POCKET POETS SERIES</text>
        <line x1="80" y1="645" x2="240" y2="645" stroke="#881337" stroke-width="1" />
        <text x="160" y="670" font-family="Georgia, serif" font-size="12" fill="#292524" text-anchor="middle">No. 4: HOWL AND OTHER POEMS</text>
        <text x="160" y="692" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">by Allen Ginsberg (1956)</text>
        <text x="160" y="720" font-family="sans-serif" font-size="9" font-weight="bold" fill="#881337" text-anchor="middle">LANDMARK FIRST AMENDMENT VICTORY</text>
        
        <!-- Bottom Accession -->
        <rect x="35" y="780" width="250" height="70" fill="#1C1917" rx="4" />
        <text x="160" y="810" font-family="monospace" font-size="12" font-weight="bold" fill="#FDE047" text-anchor="middle" letter-spacing="1.5">CATALOG: BM-1956-SF-03</text>
        <text x="160" y="832" font-family="sans-serif" font-size="10" fill="#E2DACB" text-anchor="middle">FIRST ALL-PAPERBACK BOOKSTORE IN U.S.</text>
      </svg>`,

      "citylights-back.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#FAF6EE" rx="4" />
        <rect x="16" y="16" width="288" height="868" fill="none" stroke="#292524" stroke-width="1" rx="2" />
        
        <text x="160" y="60" font-family="sans-serif" font-size="14" font-weight="900" fill="#1C1917" text-anchor="middle" letter-spacing="2">THE POET'S CHAIR</text>
        <line x1="60" y1="75" x2="260" y2="75" stroke="#881337" stroke-width="1.5" />
        
        <g transform="translate(35, 110)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="13" fill="#292524" line-height="1.6">
            <tspan x="0" dy="0">“Paperbound books were a revolutionary</tspan>
            <tspan x="0" dy="24">medium in 1953 — cheap, portable,</tspan>
            <tspan x="0" dy="24">and democratic. We stayed open until</tspan>
            <tspan x="0" dy="24">midnight seven days a week so poets,</tspan>
            <tspan x="0" dy="24">night-owls, and workers had a place</tspan>
            <tspan x="0" dy="24">to read without buying.”</tspan>
          </text>
        </g>
        
        <rect x="35" y="300" width="250" height="300" fill="#F4EFE6" stroke="#E2DACB" stroke-width="1" rx="4" />
        <text x="160" y="335" font-family="sans-serif" font-size="12" font-weight="bold" fill="#881337" text-anchor="middle">BEAT GENERATION ROOTS</text>
        <line x1="80" y1="350" x2="240" y2="350" stroke="#881337" stroke-width="0.75" />
        
        <text x="60" y="380" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Jack Kerouac (On the Road)</text>
        <text x="60" y="415" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Allen Ginsberg (Howl)</text>
        <text x="60" y="450" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Gregory Corso (Gasoline)</text>
        <text x="60" y="485" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Lawrence Ferlinghetti (Coney Island)</text>
        <text x="60" y="520" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Diane di Prima (Revolutionary Letters)</text>
        <text x="60" y="555" font-family="Georgia, serif" font-size="12" fill="#1C1917">✦ Gary Snyder (Riprap)</text>
        
        <rect x="35" y="640" width="250" height="190" fill="#FAF6EE" stroke="#1C1917" stroke-width="1" rx="4" />
        <text x="160" y="675" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1C1917" text-anchor="middle">1957 OBSCENITY TRIAL</text>
        <text x="160" y="705" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">Judge Clayton Horn ruled Howl</text>
        <text x="160" y="725" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">held “redeeming social importance”,</text>
        <text x="160" y="745" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">setting a landmark U.S. precedent.</text>
        <text x="160" y="790" font-family="monospace" font-size="9" fill="#881337" text-anchor="middle">261 COLUMBUS AVE · SAN FRANCISCO</text>
      </svg>`,

      // 4. Kroch's & Brentano's
      "krochs-front.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#FBF8F2" rx="4" />
        <rect x="12" y="12" width="296" height="876" fill="none" stroke="#1E293B" stroke-width="2" rx="2" />
        <rect x="18" y="18" width="284" height="864" fill="none" stroke="#B45309" stroke-width="0.75" rx="2" />
        
        <!-- Classic 1950s Chicago Department Store Badge -->
        <g transform="translate(160, 80)">
          <rect x="-120" y="-30" width="240" height="60" fill="#1E293B" rx="4" />
          <text x="0" y="-5" font-family="'Playfair Display', Georgia, serif" font-size="17" font-weight="bold" fill="#F8FAFC" text-anchor="middle" letter-spacing="1">KROCH'S &amp; BRENTANO'S</text>
          <text x="0" y="16" font-family="sans-serif" font-size="9" font-weight="bold" fill="#F59E0B" text-anchor="middle" letter-spacing="2">THE WORLD'S LARGEST BOOKSTORE</text>
        </g>
        
        <!-- Flagship Storefront & Chicago Skyline -->
        <g transform="translate(45, 140)">
          <rect width="230" height="230" fill="#F1F5F9" stroke="#1E293B" stroke-width="1.5" />
          <!-- Modernist glass windows of 29 S. Wabash -->
          <rect x="20" y="40" width="190" height="150" fill="#E2E8F0" stroke="#1E293B" stroke-width="1" />
          <line x1="20" y1="90" x2="210" y2="90" stroke="#1E293B" />
          <line x1="20" y1="140" x2="210" y2="140" stroke="#1E293B" />
          <line x1="83" y1="40" x2="83" y2="190" stroke="#1E293B" />
          <line x1="146" y1="40" x2="146" y2="190" stroke="#1E293B" />
          <!-- Flagpole -->
          <line x1="115" y1="10" x2="115" y2="40" stroke="#1E293B" stroke-width="2" />
          <rect x="115" y="10" width="25" height="15" fill="#DC2626" />
        </g>
        
        <text x="160" y="420" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="bold" fill="#1E293B" text-anchor="middle">29 SOUTH WABASH AVE</text>
        <text x="160" y="445" font-family="sans-serif" font-size="12" font-weight="600" fill="#78716C" text-anchor="middle" letter-spacing="3">CHICAGO · THE LOOP</text>
        <line x1="60" y1="465" x2="260" y2="465" stroke="#B45309" stroke-width="1" />
        
        <rect x="35" y="495" width="250" height="240" fill="#FAF6EE" stroke="#E2DACB" stroke-width="1" rx="4" />
        <text x="160" y="525" font-family="sans-serif" font-size="11" font-weight="bold" fill="#B45309" text-anchor="middle" letter-spacing="1">FOUR COMPLETE FLOORS OF BOOKS</text>
        <line x1="60" y1="535" x2="260" y2="535" stroke="#E2DACB" stroke-width="0.75" />
        
        <text x="55" y="565" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">4th Floor:</text>
        <text x="125" y="565" font-family="Georgia, serif" font-size="11" fill="#44403C">Art, Architecture &amp; Rare</text>
        
        <text x="55" y="595" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">3rd Floor:</text>
        <text x="125" y="595" font-family="Georgia, serif" font-size="11" fill="#44403C">Technical, Scientific &amp; Law</text>
        
        <text x="55" y="625" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">2nd Floor:</text>
        <text x="125" y="625" font-family="Georgia, serif" font-size="11" fill="#44403C">Fiction, Poetry, Biography</text>
        
        <text x="55" y="655" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">1st Floor:</text>
        <text x="125" y="655" font-family="Georgia, serif" font-size="11" fill="#44403C">Current Bestsellers &amp; Travel</text>
        
        <text x="55" y="685" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">Lower Level:</text>
        <text x="125" y="685" font-family="Georgia, serif" font-size="11" fill="#44403C">Paperbacks &amp; Children's</text>
        
        <!-- Bottom Accession -->
        <rect x="35" y="780" width="250" height="70" fill="#F1F5F9" rx="4" stroke="#CBD5E1" stroke-width="1" />
        <text x="160" y="805" font-family="monospace" font-size="11" font-weight="bold" fill="#1E293B" text-anchor="middle" letter-spacing="1.5">CATALOG: BM-1955-CHI-04</text>
        <text x="160" y="825" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#78716C" text-anchor="middle">Adolph Kroch · Established 1907</text>
        <text x="160" y="842" font-family="sans-serif" font-size="9" fill="#94A3B8" text-anchor="middle">Closed 1995 · 88 Glorious Years</text>
      </svg>`,

      // 4b. Kroch's Back
      "krochs-back.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 900" width="100%" height="100%">
        <rect width="320" height="900" fill="#FAF6EE" rx="4" />
        <rect x="16" y="16" width="288" height="868" fill="none" stroke="#64748B" stroke-width="1" rx="2" />
        
        <text x="160" y="65" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1E293B" text-anchor="middle" letter-spacing="2">STORE SERVICES &amp; CHARGE ACCOUNTS</text>
        <line x1="50" y1="80" x2="270" y2="80" stroke="#B45309" stroke-width="1" />
        
        <g transform="translate(35, 115)">
          <text x="0" y="0" font-family="Georgia, serif" font-size="13" fill="#334155" line-height="1.6">
            <tspan x="0" dy="0">“Ask for your free K&amp;B bookmark</tspan>
            <tspan x="0" dy="24">with every volume. Phone DEarborn 2-7500</tspan>
            <tspan x="0" dy="24">for prompt delivery anywhere</tspan>
            <tspan x="0" dy="24">in Chicagoland.”</tspan>
          </text>
        </g>
        
        <rect x="35" y="240" width="250" height="380" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" rx="4" />
        <text x="160" y="275" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B" text-anchor="middle">BRANCH LOCATIONS</text>
        <line x1="80" y1="290" x2="240" y2="290" stroke="#CBD5E1" stroke-width="0.75" />
        
        <text x="50" y="325" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1E293B">✦ 29 S. Wabash Ave (Flagship)</text>
        <text x="50" y="355" font-family="sans-serif" font-size="11" fill="#475569">✦ 62 E. Randolph St</text>
        <text x="50" y="385" font-family="sans-serif" font-size="11" fill="#475569">✦ 1723 Sherman Ave, Evanston</text>
        <text x="50" y="415" font-family="sans-serif" font-size="11" fill="#475569">✦ Old Orchard, Skokie</text>
        <text x="50" y="445" font-family="sans-serif" font-size="11" fill="#475569">✦ Oakbrook Center</text>
        <text x="50" y="475" font-family="sans-serif" font-size="11" fill="#475569">✦ Woodfield Mall, Schaumburg</text>
        <text x="50" y="505" font-family="sans-serif" font-size="11" fill="#475569">✦ Water Tower Place</text>
        <text x="50" y="535" font-family="sans-serif" font-size="11" fill="#475569">✦ Michigan Avenue Plaza</text>
        <text x="50" y="565" font-family="sans-serif" font-size="11" fill="#475569">✦ Evergreen Plaza</text>
        
        <rect x="35" y="650" width="250" height="180" fill="#FAF6EE" stroke="#CBD5E1" stroke-width="1" rx="4" />
        <text x="160" y="685" font-family="sans-serif" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">MIDWEST BOOKSELLING LEGACY</text>
        <text x="160" y="715" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#64748B" text-anchor="middle">At its peak, K&amp;B accounted for</text>
        <text x="160" y="735" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#64748B" text-anchor="middle">over 20% of all hardcover trade book</text>
        <text x="160" y="755" font-family="Georgia, serif" font-size="11" font-style="italic" fill="#64748B" text-anchor="middle">sales across the United States.</text>
        <text x="160" y="795" font-family="monospace" font-size="9" fill="#1E293B" text-anchor="middle">CHICAGO HISTORICAL SOCIETY ARCHIVE</text>
      </svg>`,
    };

    for (const [filename, content] of Object.entries(assets)) {
      const target = path.join(seedDir, filename);
      if (!fs.existsSync(target)) {
        try {
          fs.writeFileSync(target, content.trim(), "utf-8");
        } catch {
          // Ignore EROFS on read-only serverless environments
        }
      }
    }
  } catch {
    // Graceful fallback for serverless read-only runtime
  }
}
