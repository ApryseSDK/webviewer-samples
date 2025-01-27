# WebViewer - Microsoft Teams Sample

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is specifically designed for any users interested in integrating WebViewer into Microsoft Teams project.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes

- [VS Code](https://code.visualstudio.com/download)
- [VS Code Teams Toolkit Extension](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- You need a **Microsoft 365 account** and if you do not have one, you can sign up for the free [**Microsoft 365 Developer Program**](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Node.js](https://nodejs.org/en/download/)

## Install

1. Open `webviewer-angular-sample` in VS Code
2. Install dependencies

```cli
npm install
```

## Run

```cli
npm start
```

## Use ngrok to make local running instance externally accessible

- [Microsoft docs - Locally hosted](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/debug)
- [ngrok Download](https://ngrok.com/download)

Install ngrok via Chocolatey

```choco
choco install ngrok
```

Add auth token (You generate your own token and input it here)

```ngrok
ngrok authtoken <token>
```

Start a tunnel (Note: Change port “4200” as needed)

```ngrok
ngrok http 4200 --host-header=localhost:4200
```

## Setup Microsoft Teams project and sideload

1. Use the `Teams Toolkit extension` in VS Code and open the `teams-project` folder
2. Go to the `teams-project\templates\appPackage\manifest.local.template.json` file
3. Replace the text `replace url here` in file with your public endpoint from ngrok
4. Press F5 to run

![TeamsSideload3](https://user-images.githubusercontent.com/100613588/162543116-f70f632d-cab1-4dba-83ac-9861213f8955.gif)

Alternatively

1. Open `Microsoft Teams`
2. Click on `Apps`
3. Click on `Manage your apps`
4. Click on `Upload a customised app`
5. Upload the .zip file from the built project (usually in the `packages` folder or `build` folder)

![TeamsSideload1](https://user-images.githubusercontent.com/100613588/162542088-301aae1c-77de-4224-8443-d0e1392a9c3d.gif)

## Sideloading issues

Note: If there is an issue with Sideloading not being enabled, you must sign into the [admin center](https://admin.microsoft.com/adminportal/home?#/homepage) as the admin and enable it.

1. At the admin center, select `Teams`
2. Expand `Teams apps`
3. Underneath go to `Setup policies`
4. Enable `Upload custom apps`

![TeamsSideload2](https://user-images.githubusercontent.com/100613588/162542605-09ebe37d-4933-4982-b6d1-1dd7f0827cbd.gif)

## Resources

- [Apryse Angular Getting Started](https://docs.apryse.com/web/guides/get-started/angular)
- [Microsoft docs - Consideration for Teams integration](https://docs.microsoft.com/en-us/microsoftteams/platform/samples/integrating-web-apps)
- [Microsoft docs - Overview](https://docs.microsoft.com/en-us/microsoftteams/platform/mstdd-landing)
- [Microsoft docs - Get started overview](https://docs.microsoft.com/en-us/microsoftteams/platform/get-started/get-started-overview)
- [Microsoft docs - Teams toolkit](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Sign up Microsoft 365 developer subscriptions](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- [Microsoft admin center](https://admin.microsoft.com/adminportal/home?#/homepage)
- [Microsoft 365 profile](https://developer.microsoft.com/en-us/microsoft-365/profile)
- [Microsoft docs - Teams sample projects](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/create-new-project)
- [Microsoft docs - Locally hosting and debug (ngrok)](https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/build-and-test/debug)
- [Microsoft docs - Manifest customization](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teamsfx-manifest-customization)

