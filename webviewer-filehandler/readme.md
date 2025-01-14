# Create helper app in Azure Active Directory

1. Sign in to [Azure Portal](https://azure.microsoft.com/en-us/get-started/azure-portal/)
2. Switch to the tenant that you want to register the application
3. Select **Azure Active Directory**
4. On the left sidebar, select **App registrations**
5. Click **+ New registration**
6. Enter a name that you find it easily, ex. "Webviewer helper" and click **register**
7. After the registration, click the **API permissions** on the left sidebar and add the following permissions: openid, Directory.AccessAsUser.All, User.Read.
8. Consent the permissions that you've just added.
9. Click **Authentication** on the left side bar, and click **+ Add a platform** on the top.
10. Select **Mobile and desktop applications** and select **(MSAL Only)** option in the list of redirect Uris.
11. In the **Advanced Settings -> Allow public client flows**, set it to "Yes". (This is to treat app as public client)
12. Click **Save** to save the configurations.


# Project Setup

To set up the project, download the code in this repository.

1. Run `npm install` to install the required packages in the root folder

2. Run `npm run setup:dev` to start setting up app registration for the webviewer demo. 

3. In the console when prompted, enter the **client id** and **tenant id**.

4. The console should provide a link for you to enter verification code for Microsoft. Open the link in the browser and enter the given code.

5. A `.env` file will be created in the root folder when the app registration is done.

6. Run `npm run start:dev` to start the local server

# Resetting cache in development for file handler in Sharepoint

It usually takes about 24 - 48 hours for the new file handler to be effective in Sharepoint. However, microsoft provides a API to refresh the cache. ([Resetting the file hanlder cache](https://docs.microsoft.com/en-us/onedrive/developer/file-handlers/reset-cache?view=odsp-graph-online))

In order to get the access token for resetting Sharepoint cache, we can start from getting the code.

Before using the API, we need to enable it in the **API permissions** under the application we registered (In this case, it's "Webviewer Demo").

1. Go to **Azure Active Directory** and select the application we registered.
2. Select **API permissions** on the left sidebar and click **+ Add a permission**.
3. In **Request API permissions**, select **Sharepoint -> Application permissions -> Sites.ReadWrite.All**, and add the permission.
4. If necessary, grand admin consent for the permissions.
5. Paste the following url in the browser to retreive the code for getting accessToken:
```
http method: GET

https://login.microsoftonline.com/<TENANT-ID-IN_ENV>/oauth2/v2.0/authorize?
client_id=<Your-app-client-id>
&response_type=code
&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fapi%2Fauth%2Flogin
&response_mode=query
&scope=Sites.ReadWrite.All
&state=54321
```
| Query Param  | Description |
| -----------  | ------------|
| client_id    | *This is the client id for your application. You can get it in the **Overview** section.|
| response_type| "code" |
|redirect_uri  |* The redirect uri under the **Authentication** section|
|response_mode |"query"|
|scope         |"https://{your-sharepoint-tenant}-my.sharepoint.com/Sites.ReadWriteAll" <br /> * Note: This sharepoint tenant id is not the same with your application tenant id. |
|state         |*You could put whatever here|

This step is to ask your consent of accessing sharepoint. The code we get here doesn't have the scope for resetting Sharepoint cache though.
Therefore, we need to make a similar request with `scope=https://{your-sharepoint-tenant-id}-my.sharepoint.com/Sites.ReadWrite.All`

The example would be 
```
http method: GET

https://login.microsoftonline.com/13571a4c-345f-42f7-947b-44dc62efec3b/oauth2/v2.0/authorize?
client_id=<Your-app-client-id>
&response_type=code
&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fapi%2Fauth%2Flogin
&response_mode=query
&scope=https://{your-sharepoint-tenant-id}-my.sharepoint.com/Sites.ReadWrite.All
&state=54321
```

Again, paste the url in the browser and you would be redirect with a url that contains the code with the right scope.

With the code, you could use Postman or other similar service, use the following url to get the accessToken.

```
https://login.microsoftonline.com/13571a4c-345f-42f7-947b-44dc62efec3b/oauth2/v2.0/token?
client_id=<Your-app-client-id>
&scope=https://<your-sharepoint-tenant-id>-my.sharepoint.com/Sites.ReadWrite.All
&code=<The-code-you-just-get>
&grant_type=authorization_code
&client_secret=<One-of-the-client-secrets-in-your-app>
&redirect_uri=http%3A%2F%2Flocalhost:3000%2Fapi%2Fauth%2Flogin
```

You are expected to receive the response in json with `access_token`.

The last step would be making a request to the following url to reset the cache.

```
http method: GET

https://<your-tenant-id>-my.sharepoint.com/_api/v2.0/drive/apps?forceRefresh=1

with headers: {
    Authorization: Bearer <access-token>
}
```

The response should be your file handler configurations.


# Deployment in production
After the development, you may want to deploy your server and redirect the filehandler to the hosted server.

You can achieve this by change the **Manifest** in your application.

Change the `logoutUrl` with your new domain but with the same path. Change the `url` in the object of the array `replyUrlsWithType`.