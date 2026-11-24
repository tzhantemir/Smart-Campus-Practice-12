# Smart Campus - Practice 12

Taizhan Zhantemir (24B032044), Tuesday 13:00-16:00.

## Code-based
Open `index.html` in a browser. It is a standalone HTML/CSS/JavaScript implementation with the unchanged TypeScript engine transpiled to JavaScript. `bookingLogic.ts` preserves the original source. The demo uses a fixed reference time of 09:00, room B-204 and two fictional bookings.

## Low-code (Node-RED)
Install a supported Node.js LTS from https://nodejs.org/ if needed. Open CMD in this folder. Run `npx --yes node-red --settings "%CD%\node-red-settings.js" --userDir "%CD%\node-red-data"`. Open http://127.0.0.1:1880, select Menu > Import > select a file > `SmartCampus_NodeRED_Flow.json` > Import > Deploy. Open http://127.0.0.1:1880/campus. The included settings restrict the editor and application to localhost. No add-on nodes are needed. Capture the editor and the result page; the flow is not intended for a public server.

## Tests
Run `node verify-practice.mjs` for exact local logic tests. Run `node verify-practice.mjs --node-red` after deploying the actual flow to verify the real local HTTP endpoints as well. The latter creates `node-red-results.json`. The local preview harness is only for reproducible inspection without Node-RED; its results must not be represented as a deployed Node-RED test. Use `node NodeRED_Preview_Server.mjs` to preview at http://127.0.0.1:8765/campus.

## Publish and review
Upload the project files, report and evidence to a public GitHub/GitLab/Bitbucket repository. Exclude `node-red-data`, credentials, personal data and installed modules. GitHub Pages can publish `index.html` from the main branch root. Include the actual public repository and live demo URLs in the submission email. The Node-RED flow itself is portable JSON and should be kept local. No paid subscription is necessary. The code-based application is a static classroom demo, not a production booking service.

## Evidence status
Local acceptance tests: 8/8 for the code and 8/8 for the exact exported flow logic. Browser UI and additional security/boundary checks are documented in the report. The actual Node-RED runtime and public hosting must be verified in the user's own environment. Initial engineering times were not recorded; measured repeat checks are labeled separately.
