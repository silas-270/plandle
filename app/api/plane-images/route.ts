import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
    // 1. Extract parameters from the URL query string
    const { searchParams } = new URL(request.url);

    const manufacturer = searchParams.get('manufacturer');
    const type = searchParams.get('type');
    const airline = searchParams.get('airline');
    const imageIndexParam = searchParams.get('imageIndex');
    const forcedImageIndex = imageIndexParam !== null ? parseInt(imageIndexParam, 10) : null;

    // 2. Parameter validation
    if (!manufacturer || !type || !airline) {
        return NextResponse.json(
            { error: 'Search parameter missing' },
            { status: 400 }
        );
    }

    const searchQuery = `${manufacturer} ${type} ${airline}`.trim();

    // 3. Safely construct the Wikimedia URL using URLSearchParams
    const wikimediaUrl = new URL('https://commons.wikimedia.org/w/api.php');
    wikimediaUrl.searchParams.append('action', 'query');
    wikimediaUrl.searchParams.append('format', 'json');
    wikimediaUrl.searchParams.append('generator', 'search');
    wikimediaUrl.searchParams.append('gsrsearch', `filetype:bitmap ${searchQuery}`);
    wikimediaUrl.searchParams.append('gsrnamespace', '6'); // 6 is the File namespace
    wikimediaUrl.searchParams.append('gsrlimit', '15'); // Erhöhe Limit leicht für größeren Match-Pool
    wikimediaUrl.searchParams.append('prop', 'imageinfo');
    wikimediaUrl.searchParams.append('iiprop', 'url|extmetadata'); // Fordere Metadaten zur Verifizierung an

    try {
        // 4. Use the standard Web Fetch API
        const response = await fetch(wikimediaUrl.toString(), {
            method: 'GET',
            headers: {
                // Good job keeping the User-Agent! Wikimedia requires this.
                'User-Agent': 'Plane-dle-App/1.0 (eduardo@salabinga.com) Next.js' 
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        const pages = data.query?.pages;

        // 5. Always return a NextResponse, even for "Not Found" scenarios
        if (!pages) {
            console.log(`Keine Wikimedia-Bilder gefunden für: ${searchQuery}`);
            return NextResponse.json(
                { error: 'No images found for the given criteria' }, 
                { status: 404 }
            );
        }

        interface WikimediaPage {
            title?: string;
            imageinfo?: Array<{ 
                url: string;
                extmetadata?: any;
            }>;
        }

        const pageArray = Object.values(pages) as WikimediaPage[];
        
        // 6. Verifizierungs-Logik:
        const wantedAirline = airline.toLowerCase();
        
        const verifiedPages = pageArray.filter(page => {
            const info = page.imageinfo?.[0];
            if (!info || !info.url) return false;

            const title = (page.title || "").toLowerCase();
            const categories = (info.extmetadata?.Categories?.value || "").toLowerCase();
            const description = (info.extmetadata?.ImageDescription?.value || "").toLowerCase();
            const objectName = (info.extmetadata?.ObjectName?.value || "").toLowerCase();

            // Prüfen, ob die echte Airline in mindestens einem der relevanten Felder auftaucht
            return categories.includes(wantedAirline) ||
                   description.includes(wantedAirline) ||
                   title.includes(wantedAirline) ||
                   objectName.includes(wantedAirline);
        });

        // Wenn verifizierte Bilder vorliegen, bilde daraus den Pool. Andernfalls Fallback auf alle.
        const finalPool = verifiedPages.length > 0 ? verifiedPages : pageArray;
        
        if (verifiedPages.length > 0) {
            console.log(`[VERIFIED] ${verifiedPages.length} sichere Bilder für: ${searchQuery}`);
        } else {
            console.log(`[FALLBACK] Keine eindeutigen Metadaten für: ${searchQuery}`);
        }

        // Pick image: use forced index (clamped to pool size) or random
        let chosenIndex: number;
        if (forcedImageIndex !== null && !isNaN(forcedImageIndex)) {
            chosenIndex = forcedImageIndex % finalPool.length;
        } else {
            chosenIndex = Math.floor(Math.random() * finalPool.length);
        }
        const chosenPage = finalPool[chosenIndex];
        const imageUrl = chosenPage.imageinfo?.[0]?.url;

        if (imageUrl) {
            // Return the image URL and the index used so the client can create a challenge seed
            return NextResponse.json({ imageUrl, imageIndex: chosenIndex }, { status: 200 });
        } else {
            console.log("Bildinfo fehlte im Wikimedia-Ergebnis.");
            return NextResponse.json(
                { error: 'Image info missing in Wikimedia result' }, 
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('Wikimedia fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch image data' },
            { status: 500 }
        );
    }
};