# Atlas Guess

Atlas Guess is an original geography game for GitHub Pages. It is not affiliated with WorldGuessr or any other game. It now includes solo play, pass-and-play, and Firebase-backed online rooms.

## Play

Visit **https://abcdzone1234.github.io/**. Solo and local pass-and-play work without an account. Game options include 5 or 10 rounds, 30/60/120-second timers, easy/mixed/expert location pools, map-pin or multiple-choice guesses, optional sound effects, a personal local stats summary, and shareable results. Online rooms support up to 8 players, invite codes/links, a lobby, host-controlled rounds, live guess status, shared timer, scoring, and a leaderboard.

## Enable online multiplayer (Firebase setup required)

GitHub Pages is static; online rooms need a real-time database service. This project uses Firebase Realtime Database and anonymous authentication. The Firebase web config is public client configuration, not an admin secret. **Do not put a service-account key or database admin credentials in this repository.**

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Add a Web app to the project and copy its config object.
3. In **Build → Authentication → Sign-in method**, enable **Anonymous** sign-in.
4. In **Build → Realtime Database**, create a database. Choose a location and start in locked/production mode.
5. Put the app's `apiKey`, `authDomain`, `databaseURL`, `projectId`, and `appId` into `firebase-config.js`, replacing the `YOUR_...` placeholders.
6. In Realtime Database **Rules**, use the starter rules below, then publish. These let signed-in anonymous room members read/write their room. They are suitable for a small prototype, not a competitive game: browser clients can be modified and score writes are not server-verified. For public competitive leaderboards, validate membership, room state, and scoring in trusted Cloud Functions and add abuse/rate controls.
7. Commit the config file and wait for Pages to redeploy. Select **Online room → Create room**, share the invite link/code, and have friends join.

Starter room membership rules (validate carefully before using with strangers):

```json
{
  "rules": {
    "atlasRooms": {
      "$room": {
        ".read": "auth != null && data.child('players').child(auth.uid).exists()",
        ".write": "auth != null && (data.child('players').child(auth.uid).exists() || newData.child('players').child(auth.uid).exists())"
      }
    }
  }
}
```

This simple starter ruleset intentionally prioritizes getting a small friends-only prototype running. Its broad room write access is not suitable for untrusted public use or rankings with prizes; a trusted server implementation is required to prevent cheating. You can still use solo/local play before configuring Firebase.

## Files and services

- `index.html`, `styles.css`, `game.js` — static game UI and logic.
- `firebase-config.js` — replace placeholders with Firebase web app config to enable online rooms.
- `Leaflet` from unpkg and © OpenStreetMap contributors — map display (attribution shown on-map).
- Wikimedia Commons API — optional images with artist/license and source link shown when provided; game falls back to clue-only if no image is found.
- Firebase Authentication and Realtime Database — anonymous identities and real-time rooms, only when configured.

The site needs an internet connection for maps, external scripts, fonts, Wikimedia photos, and online multiplayer. Personal game stats are stored locally in the browser. The game has no account system. Custom location packs can be added to the `PLACES` array in `game.js` using places/images that you have permission to use.
