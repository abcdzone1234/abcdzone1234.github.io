# Atlas Guess

An original, static geography guessing game made for GitHub Pages. It is not affiliated with WorldGuessr or any other game.

## Play

Open the published GitHub Pages site, start exploring, read each clue, and click the map to place your guess. Each game has five randomized locations and a two-minute timer per round. Distance-based scoring awards up to 5,000 points per round.

## Publish on GitHub Pages

This repository is named `abcdzone1234.github.io`, so its user site should be available at:

**https://abcdzone1234.github.io/**

In **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, and save. GitHub Pages may take a few minutes to publish after the first commit.

## Files

- `index.html` — page structure and map library setup
- `styles.css` — responsive visual design
- `game.js` — rounds, map interaction, timer, scoring, and photo lookup

## Services and credits

- Interactive map: [Leaflet](https://leafletjs.com/), loaded from unpkg.
- Map tiles: [OpenStreetMap](https://www.openstreetmap.org/copyright); attribution is displayed on the map.
- Location photos: requested at runtime from the [Wikimedia Commons API](https://commons.wikimedia.org/wiki/Commons:API) and shown with the file page and license link when available. Photos are optional; if the request fails, the round remains playable using its clue.
- Fonts: DM Sans and DM Mono from Google Fonts, with system fallbacks.

The game needs an internet connection for the map tiles, map library, fonts, and optional photos. It does not collect accounts or save personal data.
