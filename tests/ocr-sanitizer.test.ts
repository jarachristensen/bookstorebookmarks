import { describe, it, expect } from "vitest";
import { cleanOcrTranscription, isHalftoneNoiseLine } from "@/lib/utils/ocr-sanitizer";

describe("OCR Post-Processing Sanitizer (cleanOcrTranscription)", () => {
  it("strips halftone photo noise and dot-matrix artifacts from newspaper clippings", () => {
    const rawOcr = `var Businesses: Books WEST IN ARROYO
A th h t | i
RT, FR Cr La ee yi mG a
Bainter g = TER A Be na TRE a
Ln : TREE ae
a SAPD 4 EE EN
ne ; it SUITE ae a
ga # : Su HEE
Ea fal HER a Thoma
: ang i Nad
= peg & Sin : a a Ee]
: oa In Gra © mw Bow
i" i é fi os bo
Ny § — - : EL ThE
Epa i E4 | - hd 3 a Ga
i "RE Mh ~ ¥ 3 pro oo
8 Ey Me k 1 | Be
| CLOG % er a
: ; AUR ST - Eo
{ os CHET RE BR 1 = hs
| Tae Bee | ‘ ] E 0
j - Eo
foe ca . F elas ee 5
or p gE SE
: & pao <a ey iE 3
Col gp i |
| i! i A E
i | ba a ; i “
3 : i Gig 3 =
: he 1 :
1 : a Gi |
i ; . ; 1
TRIBUNE PHOTOS BY LAURA DICKINSON
On Jan. 14, Books West in Arroyo Grande will close for good, a victim of com-
pounding problems, says owner Carole Kapphahn. She
and her husband once owned five book stores on the Central Coast and in Bakersfield.
By Leslie E. Stevens
THE TRIBUNE
SOUTH COUNTY LOSING ONE OF THE LAST REMAINING INDEPENDENT BOOKSELLERS
Berle Stone showed up at Books West before the store opened on Friday, anxious to pick up books.`;

    const cleaned = cleanOcrTranscription(rawOcr);

    // Verify all halftone gibberish lines are stripped
    expect(cleaned).not.toContain("A th h t | i");
    expect(cleaned).not.toContain("RT, FR Cr La ee yi mG a");
    expect(cleaned).not.toContain("Bainter g = TER");
    expect(cleaned).not.toContain("Ln : TREE ae");
    expect(cleaned).not.toContain("a SAPD 4 EE EN");
    expect(cleaned).not.toContain("ne ; it SUITE ae a");
    expect(cleaned).not.toContain("Ea fal HER");
    expect(cleaned).not.toContain("Tae Bee");
    expect(cleaned).not.toContain("foe ca . F elas");
    expect(cleaned).not.toContain("var Businesses:");

    // Verify real article text and headlines are retained
    expect(cleaned).toContain("Books WEST IN ARROYO");
    expect(cleaned).toContain("TRIBUNE PHOTOS BY LAURA DICKINSON");
    expect(cleaned).toContain("On Jan. 14, Books West in Arroyo Grande will close for good");
    expect(cleaned).toContain("compounding problems, says owner Carole Kapphahn");
    expect(cleaned).toContain("SOUTH COUNTY LOSING ONE OF THE LAST REMAINING INDEPENDENT BOOKSELLERS");
    expect(cleaned).toContain("Berle Stone showed up at Books West before the store opened on Friday");
  });

  it("merges broken hyphenated words across linebreaks", () => {
    const raw = `small indepen-
dent booksellers rely on loyal customers. Profit margins are shrink-
ing along with store traffic.`;

    const cleaned = cleanOcrTranscription(raw);
    expect(cleaned).toContain("independent booksellers");
    expect(cleaned).toContain("shrinking along with");
  });

  it("preserves quotes, em-dashes, and accented text in historical newspaper excerpts", () => {
    const figaro = `“PARIS — Facing the towers of Notre-Dame at 37 rue de la Bûcherie, an American ex-serviceman named George Whitman has opened a library and bookshop named Le Mistral, continuing the noble tradition established thirty years ago by Sylvia Beach. Young writers from all continents find here not only books in English, but a roof, a cup of tea, and an unending conversation.”`;
    const cleanedFigaro = cleanOcrTranscription(figaro);
    expect(cleanedFigaro).toContain("George Whitman");
    expect(cleanedFigaro).toContain("Sylvia Beach");

    const citylights = `“SAN FRANCISCO — In Municipal Court today, Judge Clayton W. Horn ruled that Allen Ginsberg’s poem 'Howl', published and sold by Lawrence Ferlinghetti of City Lights Books, is not obscene. In a memorable 39-page opinion, Judge Horn declared that an author must have the freedom to depict society in the language of its people: 'The author has spoken in earnest terms regarding the conditions of our era. To restrict such expression would be to blind ourselves to art.'”`;
    const cleanedCitylights = cleanOcrTranscription(citylights);
    expect(cleanedCitylights).toContain("Allen Ginsberg");
    expect(cleanedCitylights).toContain("Lawrence Ferlinghetti");
  });

  it("handles edge cases gracefully", () => {
    expect(cleanOcrTranscription("")).toBe("");
    expect(cleanOcrTranscription("   ")).toBe("");
    expect(cleanOcrTranscription("... ... --- === ~~~")).toBe("");
  });
});
