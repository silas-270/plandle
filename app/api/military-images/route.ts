import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    const manufacturer = searchParams.get('manufacturer');
    const type = searchParams.get('type');
    const imageIndexParam = searchParams.get('imageIndex');
    const forcedImageIndex = imageIndexParam !== null ? parseInt(imageIndexParam, 10) : null;

    if (!manufacturer || !type) {
        return NextResponse.json(
            { error: 'Search parameter missing (manufacturer and type are required)' },
            { status: 400 }
        );
    }

    const searchQuery = `${manufacturer} ${type}`.trim();

    const wikimediaUrl = new URL('https://commons.wikimedia.org/w/api.php');
    wikimediaUrl.searchParams.append('action', 'query');
    wikimediaUrl.searchParams.append('format', 'json');
    wikimediaUrl.searchParams.append('generator', 'search');
    wikimediaUrl.searchParams.append('gsrsearch', `filetype:bitmap ${searchQuery}`);
    wikimediaUrl.searchParams.append('gsrnamespace', '6');
    wikimediaUrl.searchParams.append('gsrlimit', '15');
    wikimediaUrl.searchParams.append('prop', 'imageinfo');
    wikimediaUrl.searchParams.append('iiprop', 'url|extmetadata');

    try {
        const response = await fetch(wikimediaUrl.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Plane-dle-App/1.0 (eduardo@salabinga.com) Next.js'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        const pages = data.query?.pages;

        if (!pages) {
            console.log(`No Wikimedia images found for: ${searchQuery}`);
            return NextResponse.json(
                { error: 'No images found for the given criteria' },
                { status: 404 }
            );
        }

        interface WikimediaPage {
            title?: string;
            imageinfo?: Array<{
                url: string;
                extmetadata?: Record<string, { value: string }>;
            }>;
        }

        const pageArray = Object.values(pages) as WikimediaPage[];

        // Verification: check if the aircraft type appears in image metadata.
        // Use the most distinctive part of the type name (e.g. "F-22" from "F-22 Raptor").
        const typeKeywords = type.toLowerCase().split(' ');

        const verifiedPages = pageArray.filter(page => {
            const info = page.imageinfo?.[0];
            if (!info || !info.url) return false;

            const title = (page.title ?? '').toLowerCase();
            const categories = (info.extmetadata?.Categories?.value ?? '').toLowerCase();
            const description = (info.extmetadata?.ImageDescription?.value ?? '').toLowerCase();
            const objectName = (info.extmetadata?.ObjectName?.value ?? '').toLowerCase();

            const combined = `${title} ${categories} ${description} ${objectName}`;

            // At least one keyword from the type must appear in the metadata
            return typeKeywords.some(kw => kw.length > 2 && combined.includes(kw));
        });

        const finalPool = verifiedPages.length > 0 ? verifiedPages : pageArray;

        if (verifiedPages.length > 0) {
            console.log(`[MILITARY VERIFIED] ${verifiedPages.length} images for: ${searchQuery}`);
        } else {
            console.log(`[MILITARY FALLBACK] No verified metadata for: ${searchQuery}`);
        }

        let chosenIndex: number;
        if (forcedImageIndex !== null && !isNaN(forcedImageIndex)) {
            chosenIndex = forcedImageIndex % finalPool.length;
        } else {
            chosenIndex = Math.floor(Math.random() * finalPool.length);
        }

        const chosenPage = finalPool[chosenIndex];
        const imageUrl = chosenPage.imageinfo?.[0]?.url;

        if (imageUrl) {
            return NextResponse.json({ imageUrl, imageIndex: chosenIndex }, { status: 200 });
        } else {
            console.log('Image info missing in Wikimedia result.');
            return NextResponse.json(
                { error: 'Image info missing in Wikimedia result' },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('Wikimedia fetch error (military):', error);
        return NextResponse.json(
            { error: 'Failed to fetch image data' },
            { status: 500 }
        );
    }
};
