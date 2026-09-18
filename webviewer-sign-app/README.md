# WebViewer Sign App

This React + Vite sample demonstrates a client-side, two-user signing workflow with [Apryse WebViewer](https://docs.apryse.com/web/). It has no authentication, server, or database dependency.

The app loads [public/contract.pdf](public/contract.pdf), assigns its signature fields to two local users, and keeps each user's signing session separate while they work in the same document.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Open the local URL shown by Vite in your browser.

## Signing flow

1. Select **Toby McDermott** or **Jennifer Davies** from the left-side signer panel.
2. Only fields assigned to the selected user are shown. The next unsigned field is highlighted.
3. Use **Previous field** and **Next field** to move through the selected user's fields.
4. Use **Sign current field** to open the signature workflow for the highlighted field.
5. Create or adopt a signature or initials appearance, then apply it to the field.
6. Switch users at any time. The previous user's saved signature and initials are stored, and the selected user's saved appearances are restored.
7. Select **Download** to save the completed document as a flattened PDF.

Signature appearances are kept in browser memory for the current session. There is no persistence or server-side signing service.

## Project structure

```text
src/
  App.jsx              - User switching, field visibility, and per-user signatures
  signingUIConfig.js   - Signing toolbar, field navigation, and PDF download
  main.jsx             - Application entry point
public/
  contract.pdf         - Sample document loaded by WebViewer
  webviewer/           - Copied static Apryse WebViewer assets
tools/
  copy-webviewer-files.js - Copies WebViewer static assets after installation
```

## Build

```bash
npm run build
```

## API documentation

See the [Apryse WebViewer API documentation](https://docs.apryse.com/web/).

## License

See [LICENSE](./LICENSE).
