# WebViewer annotations sample - using files and PHP backend

[WebViewer](https://docs.apryse.com/web/guides/get-started) is a powerful JavaScript-based PDF Library that is part of the [Apryse SDK](https://apryse.com/). It provides a slick out-of-the-box responsive UI that enables you to view, annotate and manipulate PDFs and other document types inside any web project.

- [WebViewer Documentation](https://docs.apryse.com/web/guides/get-started)
- [WebViewer Demo](https://showcase.apryse.com/)

This sample demonstrates how to save and load annotations using XFDF files and a PHP backend.

## Get your trial key

A license key is required to run WebViewer. You can obtain a trial key in our [get started guides](https://docs.apryse.com/web/guides/get-started), or by signing-up on our [developer portal](https://dev.apryse.com/).

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/) and a PHP development environment such as [built-in CLI](http://php.net/manual/en/features.commandline.webserver.php), [XAMPP](https://www.apachefriends.org/index.html) or [AMPPS](https://www.ampps.com/).




## Install

```
git clone --depth=1 https://github.com/ApryseSDK/webviewer-samples.git
cd webviewer-samples/webviewer-annotations-php
npm install
```

## Run

Serve the root directory of this project using the PHP development environment, and navigate to `/client/index.html`.

As a sample of a development environment using [XAMPP](https://www.apachefriends.org/index.html) v3.3.0, here is one way to set the environment.

1. Install [XAMPP](https://www.apachefriends.org/index.html) with the **Apache** and **MySQL** options selected to your prefered path. For this example, we will use `C:\xampp` as the installation path.

2. In XAMPP control panel, click the **Config** button for **Apache**. The `httpd.conf` file will open up in your text editor. Set the following properties:

**Apache**'s `httpd.conf`

| Property       | Value                              |
|----------------|------------------------------------|
| `ServerName`   | `localhost:8181` (or use your own) |
| `DocumentRoot` | `"C:/xampp/htdocs"`                |
| `Listen`       | `8181`                             |

3. Set the XAMPP Config port settings. From the control panel, in the upper right corner, click the **Config** button. In the **Configuration of Control Panel** select **Service and Port Settings** and select the **Apache** tab. In the **Main Port** enter the matching port number, in this example `8181`. For the SSL Port enter `4433` for this example. Close the XAMPP control and restart it before the next step.

4. To check the environment is set correctly, click the **Start** buttons for the **Apache** and **MySQL** modules. Then click on the **Admin** buttons and a page should render on the `localhost:8181` for each module. If you see both pages, your environment is set. 

5. To render the page using this environment, you can simply move both folders **client** and **server** from the root of this project to a `demo` folder in `C:\xampp\htdocs`. Once you move the folders, it should look like this `C:\xampp\htdocs\demo` with two folders named `client` and `server`.

* `C:\xampp\htdocs\demo\client`
* `C:\xampp\htdocs\demo\server`

 While the XAMPP dev environment is able to render the `localhost:8181` default page, you can navigate to `http://localhost:8181/demo/client/index.html`.




## How to use

- Create annotations with annotations tools in the header
- Save annotations with the save button in the header
- Load annotations by refreshing the app
- You can find annotation data saved into an XFDF file in server/xfdf folder

