# WebViewer - CLM Sample 

## Get Started

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial Setup

Before you begin, make sure the development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-clm
npm install
```

## Run

```
npm start
```

### Supabase

Update supabaseClient.ts with your Supabase project information.

```bash
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_KEY=your_supabase_key
```

For database setup, the project includes the schema files needed for your database.

```bash
./database/users.sql
./database/templates.sql
./database/agreements.sql
```