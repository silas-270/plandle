const fs = require('fs');
const path = require('path');

// Pfad zur Datenbank
const dbPath = path.join(__dirname, '../data/aircraft_database.json');
const rawData = fs.readFileSync(dbPath, 'utf-8');
const aircraftData = JSON.parse(rawData);

// Funktion um ein zufälliges Element aus einem Array zu bekommen
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// 10 Zufällige Flugzeuge generieren
const testCases = [];
for (let i = 0; i < 10; i++) {
    const randomAircraft = getRandomElement(aircraftData);
    const randomAirline = getRandomElement(randomAircraft.airlines);
    testCases.push({
        manufacturer: randomAircraft.manufacturer,
        type: randomAircraft.type,
        airline: randomAirline
    });
}

async function runTests() {
    console.log("Starte Abfragen für 10 Flugzeuge...");
    const results = [];

    for (const testCase of testCases) {
        const searchQuery = `${testCase.manufacturer} ${testCase.type} ${testCase.airline}`.trim();
        console.log(`Suche nach: ${searchQuery}`);

        const wikimediaUrl = new URL('https://commons.wikimedia.org/w/api.php');
        wikimediaUrl.searchParams.append('action', 'query');
        wikimediaUrl.searchParams.append('format', 'json');
        wikimediaUrl.searchParams.append('generator', 'search');
        wikimediaUrl.searchParams.append('gsrsearch', `filetype:bitmap ${searchQuery}`);
        wikimediaUrl.searchParams.append('gsrnamespace', '6'); // File namespace
        wikimediaUrl.searchParams.append('gsrlimit', '3'); // Wir holen mal die ersten 3 Ergebnisse pro Flugzeug
        wikimediaUrl.searchParams.append('prop', 'imageinfo');
        // iiprop=url für den Bildlink und extmetadata für die erweiterten Bildinfos (wie z.B. Kategorien/Beschreibungen wo die Airline drin steht)
        wikimediaUrl.searchParams.append('iiprop', 'url|extmetadata');

        try {
            const response = await fetch(wikimediaUrl.toString(), {
                method: 'GET',
                headers: {
                    'User-Agent': 'Plane-dle-App/Testing (eduardo@salabinga.com)'
                }
            });

            if (!response.ok) {
                console.error(`HTTP Fehler: ${response.status}`);
                continue;
            }

            const data = await response.json();
            
            results.push({
                searchQuery,
                testCase,
                responseData: data
            });

        } catch (error) {
            console.error(`Fehler bei ${searchQuery}:`, error);
        }
        
        // Kleine Pause um die API nicht zu spammen
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Speichern der Ergebnisse
    const outputPath = path.join(__dirname, 'wiki_responses.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n✅ Abfrage beendet. Ergebnisse wurden in ${outputPath} gespeichert.`);
}

runTests();
