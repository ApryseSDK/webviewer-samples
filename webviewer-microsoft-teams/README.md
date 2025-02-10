# WebViewer - Microsoft Teams Sample

[WebViewer](https://docs.apryse.com/documentation/web/) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that interacts with the core library to view, annotate and manipulate PDFs that can be embedded into web projects.

![WebViewer UI](https://www.pdftron.com/downloads/pl/webviewer-ui.png)

This repo is specifically designed for any users interested in integrating WebViewer into a Microsoft Teams project using the Basic Tab template.

## Demos

- [Customizable out-of-the-box UI](https://showcase.apryse.com/toolbar-customization)
- [PDF Viewer](https://showcase.apryse.com/)
- [DOCX Editor](https://showcase.apryse.com/office-editor)
- [Annotation & Markup](https://showcase.apryse.com/annotation-permissions)
- [Generate PDFs from DOCX template](https://showcase.apryse.com/office-template-fill)
- [Digital Signatures](https://showcase.apryse.com/digital-signatures)
- [PDF Text Editing](https://showcase.apryse.com/pdf-editing)
- [Page Manipulation](https://showcase.apryse.com/pdf-page-manipulation-api)
- [Redaction](https://showcase.apryse.com/redaction)
- [Form Building](https://showcase.apryse.com/pdf-form-build)
- [Annotate Videos](https://showcase.apryse.com/annotate-video-frames)
- [More](https://showcase.apryse.com/)

## Initial setup

Before you begin, make sure your development environment includes

- [VS Code](https://code.visualstudio.com/download)
- [VS Code Teams Toolkit Extension](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- You need a **Microsoft 365 account** and if you do not have one, you can sign up for the free [**Microsoft 365 Developer Program**](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Node.js](https://nodejs.org/en/download/)

## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-microsoft-teams
npm install
```

## Run

1. Go to **Run and Debug** in VS Code or use **Ctrl+Shift+D**
2. Click on the play button on the **Debug in Teams (Edge)** or **Debug in Teams (Chrome)**

## Custom App Upload issues

Note: If there is an issue with Custom App Upload not being enabled, you must sign into the [admin center](https://admin.microsoft.com/adminportal/home?#/homepage) as the admin and enable it.

1. At the admin center, select `Teams`
2. Expand `Teams apps`
3. Underneath go to `Setup policies`
4. Select `Global (Org-wide default)`.
5. Enable `Upload custom apps`

See [here](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/tools-prerequisites#enable-custom-app-upload-using-admin-center) for more details.

## Resources

- [Integrate WebViewer JavaScript PDF Viewer & Editor into a Web App](https://docs.apryse.com/web/guides/get-started/manually)
- [Basic Tab Template README](./Tab_Template_README.md)
- [Microsoft docs - Consideration for Teams integration](https://docs.microsoft.com/en-us/microsoftteams/platform/samples/integrating-web-apps)
- [Microsoft docs - Overview](https://docs.microsoft.com/en-us/microsoftteams/platform/mstdd-landing)
- [Microsoft docs - Get started overview](https://docs.microsoft.com/en-us/microsoftteams/platform/get-started/get-started-overview)
- [Microsoft docs - Teams toolkit](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [Sign up Microsoft 365 developer subscriptions](https://developer.microsoft.com/en-us/microsoft-365/dev-program)
- [Microsoft Admin Center](https://admin.microsoft.com/adminportal/home?#/homepage)
- [Microsoft 365 Profile](https://developer.microsoft.com/en-us/microsoft-365/profile)
- [Microsoft docs - Teams sample projects](https://docs.microsoft.com/en-us/microsoftteams/platform/toolkit/create-new-project)

----
