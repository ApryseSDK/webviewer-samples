# WebViewer - Ask AI sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/).

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates how to utilize the artificial intelligence capabilities within the WebViewer, using a chat panel interface to ask questions about the loaded document. Also the user can select text to summarize.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-ask-ai
npm install
```

## Configuration

This sample uses OpenAI. You can use any other artificial intelligence of your choice.

However, to get started with this sample rename `.env.example` file into `.env` and fill the followings:

```
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=your-openai-model-here
OPENAI_MAX_TOKENS=your-openai-max-tokens-here
OPENAI_TEMPERATURE=your-openai-temperature-here
OPENAI_SEED=your-openai-seed-here
```

## Run

```
npm start
```

This will start a server that you can access the WebViewer client at http://localhost:4040/client/index.html, and manage the connection to the OpenAI on backend.