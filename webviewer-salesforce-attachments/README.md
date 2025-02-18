# How to View, Edit, Annotate and Redact Salesforce Record Attachment Files in a Lightning Web Component

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample is a ready-to-deploy Salesforce implementation of Apryse SDK's WebViewer. This LWC Component will have the ability to enable client-side viewing, editing, annotation and redaction and much more in your Salesforce environment using Salesforce files or external files.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Prepare static files

Use the `optimize` script to generate the Static Resources (**.zip** and **.xml** files) and copy them to the `force-app/main/default/staticresources` folder.  
For details see the steps related to extracting `WebViewer.zip` and running the script in [Add WebViewer to Salesforce](https://github.com/ApryseSDK/webviewer-samples/tree/main/webviewer-salesforce#requirements) project.

## install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-salesforce-attachments
npm install
```

## Overview
This repository is a ready-to-deploy Salesforce implementation of Apryse SDK's WebViewer. This LWC Component will have the ability to enable client-side viewing, editing, annotation and redaction and much more in your Salesforce environment using Salesforce files or external files.

## Quick Installation


## Prerequisites
Required tools: [VS Code](https://code.visualstudio.com/download) + [Salesforce Extension](https://developer.salesforce.com/tools/vscode/en/vscode-desktop/install)

## Installation Steps
* Clone the repository to your local and open it in VS Code with the [Salesforce Extension](https://developer.salesforce.com/tools/vscode/en/vscode-desktop/install) installed.
* Authenticate your environment (you can follow this [example](https://trailhead.salesforce.com/content/learn/projects/quickstart-vscode-salesforce/use-vscode-for-salesforce))
* Right-click on the `force-app` folder and select `SFDX: Deploy Source To Org` or use `sf project deploy start` in your terminal
* Once deployed, navigate to a Lightning page, click Setup > `Edit Page` and drag and drop the `pdftronWebviewerContainer` into the desired location of your Lightning page

## Note on Salesforce deployment size limits
Please note that maximum deployment size is capped to ~39MB - in some cases the WebViewer worker files stored in `/staticresources/` exceed that file size limit. If you are facing this error, please split up your deployments in multiple parts to adhere to this size limit.

## Example 1
Your `/staticresources/` exceeds the 39MB limit - please deploy worker files one by one.

## Example 2
Your `/staticresources/` do not exceed the 39MB limit, but your total project is above the limit - you can deploy staticresources first, then deploy the other metadata types like so:

1. Deploy only StaticResource type
`sf project deploy start -m StaticResource`

2. Deploy other Metadata types
`sf project deploy start -m AuraDefinitionBundle ApexClass LightningComponentBundle LightningMessageChannel`

## Guide
This repository serves as the code-along sample for this [guide](https://apryse.com/blog/webviewer/view-edit-annotate-and-redact-salesforce-record-attachments).

## Project Structure
The Apryse SDK WebViewer integrates with Salesforce by using WebViewer's source files in Salesforce's `/staticresources/` - we leverage LWC to contain WebViewer UI inside of an iframe. We can use your browser's [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API and leverage the main LWC component to communicate with other LWC components and use Apex to retrieve files, user information and other data from Salesforce to build a fully custom document workflow.

## Documentation
You can find WebViewer's Salesforce-specific documentation [here](https://docs.apryse.com/documentation/salesforce/). For technical inquiries reach out to support@apryse.com - for information on licensing you can contact sales@apryse.com


