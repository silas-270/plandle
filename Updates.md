# Plandle - Updates & Roadmap

Basierend auf 410 Runden Spielzeit wurden folgende Ideen auf einer Skala von "Absolut wichtiger Fix" bis "Neue Funktion" eingestuft und in eine Roadmap zur Abarbeitung priorisiert.

## Phase 1: Das Kern-Spiel robuster machen (Top Priorität)
*Hier wird die "Glaubwürdigkeit" des Spiels und die Langzeitmotivation gesichert.*

- [X] **🔴 Absolut wichtiger Fix:** Fehlerhafte Identifikation von Flugzeugen behandeln
  *Problem:* Wenn eine Airline sich das Flugzeug einer anderen für den Flug ausleiht, stimmt das Matching nicht mehr (vor allem bei kleinen Airlines). 
  *Lösungsansatz:* Über die Wikipedia Seite des Bildereintrags nochmal den Extra-Eintrag zur Airline finden, um sie zu verifizieren.
- [X] **🟠 Balancing-Fix:** Höhere und nicht-lineare Ranks und niedrigere Meilen pro Spiel
  *Ziel:* Es soll nicht mehr so einfach sein, den höchsten Rang zu bekommen, um die Langzeitmotivation zu erhalten.

## Phase 2: Quick Wins & Statistiken (Schnelle Erfolgserlebnisse)
*Schnell umsetzbare Punkte, die die Spielerführung und das Feedback deutlich aufwerten.*

- [X] **🟢 Kleine neue Funktion:** Spielerstatistik auch im Hauptmenü anzeigen
  *Ziel:* Einfaches Hinzufügen des Buttons ins Hauptmenü, damit man nicht immer ein Spiel starten muss, um die Statistik zu sehen.
- [x] **🟡 QoL-Verbesserung:** Success Rate anpassen
  *Ziel:* Nicht mehr all-time, sondern gewichtet oder nur die letzten n Spiele. Es soll weiterhin die Gesamtzahl der gespielten Spiele gezeigt werden. Lediglich die Prozent sollen nur noch die aktuellsten Statistiken beinhalten.
- [ ] **🟢 Kleine neue Funktion:** Sharing Funktion der Fortschritte hinzufügen
  *Ziel:* Einfacher "Teilen"-Button unten im Statistik-Menü.

## Phase 3: Erweiterung & Polish
*Das Spiel fit machen, um es in der Breite bekannt zu machen und organisch wachsen zu lassen.*

- [ ] **🔵 Größere neue Funktion:** Sharing Funktion (Seed teilen für gleiches Flugzeug)
  *Ziel:* Einen Seed teilen, um anderen Leuten genau dasselbe Flugzeug (inkl. Wiki-Details) zu zeigen. Am Ende klickt der User auf einen Link wie `plandle.com/endless?seed=123456789`. Man wird direkt ins normale Endless weitergeleitet, sodass der User danach direkt weiterspielen kann, aber das erste Bild der Queue ist das aus dem Seed.
- [ ] **🟣 Content Update:** Trivia Modus ausbauen
  *Ziel:* Mehr Fragen hinzufügen.
- [ ] **🟣 Kosmetische Verbesserung:** Flammenanimation verbessern
  *Ziel:* Aktuell wackelt nur das Emoji. Eventuell auf eine ganze CSS Animation oder ein GIF o.ä. umstellen.

## Phase 4: Das Mammut-Projekt
*Das große Feature für die globale Community.*

- [ ] **🌌 Große neue Funktion:** Scoreboard / Globale Rangliste
  *Teilaufgaben:*
  - User Accounts durch generierte UUID im Localstorage umsetzen.
  - UI hinzufügen, um im Menü dem Account einen Namen zu geben (z.B. eine weitere Karte über den Spielauswahlkarten).
  - Scoreboard UI hinzufügen, um die besten Spieler nach Meilen anzuzeigen. Dafür den Tab für die persönlichen Statistiken verwenden und einen Toggle zwischen persönlichem und globalem Scoreboard einbauen.


Weitere Ideen:
- [x] Das Fenster, was man nach jedem Spiel sieht, soll ein Kreuz zum Schließen haben, damit man nochmal das ganze Flugzeug sieht.
- Menü nach jedem Spiel verbessern. Relevantere Sachen anzeigen
- Animation beim Aufstieg eines Rangs anzeigen
- Custom Icons für die Ränge statt Emojis verwenden