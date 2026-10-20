using Microsoft.Web.WebView2.Core;
using System.Net;

namespace webviewer_winforms_sample
{
    public partial class Form1 : Form
    {
        private static readonly string LocalhostUrl = GetConfigurationUrl();
        private static readonly string WebviewerIndexPath = GetConfigurationPath();

        private HttpListener? httpListener;

        public Form1()
        {
            InitializeComponent();
        }

        private async void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                var options = new CoreWebView2EnvironmentOptions();
                options.AdditionalBrowserArguments = "--disable-web-security";

                var environment = await CoreWebView2Environment.CreateAsync(null, null, options);
                await webView.EnsureCoreWebView2Async(environment);

                // Start local HTTP server
                StartHttpServer();
                await Task.Delay(500);
                webView.Source = new Uri(LocalhostUrl + WebviewerIndexPath);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing WebViewer: {ex.Message}", "Error");
            }
        }

        private void StartHttpServer()
        {
            httpListener = new HttpListener();
            httpListener.Prefixes.Add(LocalhostUrl);
            httpListener.Start();

            Task.Run(async () =>
            {
                while (httpListener?.IsListening == true)
                {
                    try
                    {
                        HttpListenerContext context = await httpListener.GetContextAsync();
                        HandleRequest(context);
                    }
                    catch
                    {
                        break;
                    }
                }
            });
        }

        private static void HandleRequest(HttpListenerContext context)
        {
            try
            {
                string requestPath = context.Request.Url?.LocalPath ?? "/";
                if (requestPath == "/") requestPath = string.Format("/{0}", WebviewerIndexPath);

                // Resolve the requested path and ensure it stays within the root directory
                string rootPath = Path.GetFullPath(Directory.GetCurrentDirectory());
                if (!rootPath.EndsWith(Path.DirectorySeparatorChar)) rootPath += Path.DirectorySeparatorChar;

                string filePath = Path.GetFullPath(Path.Combine(rootPath, requestPath.TrimStart('/')));
                if (!filePath.StartsWith(rootPath, StringComparison.OrdinalIgnoreCase))
                {
                    context.Response.StatusCode = 403;
                    context.Response.OutputStream.Close();
                    return;
                }

                if (File.Exists(filePath))
                {
                    byte[] buffer = File.ReadAllBytes(filePath);
                    context.Response.ContentType = GetContentType(filePath);
                    context.Response.ContentLength64 = buffer.Length;
                    context.Response.OutputStream.Write(buffer, 0, buffer.Length);
                    context.Response.OutputStream.Close();
                }
                else
                {
                    context.Response.StatusCode = 404;
                    context.Response.OutputStream.Close();
                }
            }
            catch
            {
                context.Response.StatusCode = 500;
                context.Response.OutputStream.Close();
            }
        }

        private static string GetContentType(string filePath)
        {
            string extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension switch
            {
                ".html" => "text/html",
                ".css" => "text/css",
                ".js" => "application/javascript",
                ".json" => "application/json",
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                ".wasm" => "application/wasm",
                ".res" => "application/octet-stream",
                ".mem" => "application/octet-stream",
                _ => "application/octet-stream"
            };
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            base.OnFormClosing(e);
            if (httpListener != null && httpListener.IsListening)
            {
                httpListener.Stop();
                httpListener.Close();
            }
        }

        private static string GetConfigurationUrl()
        {
            return Environment.GetEnvironmentVariable("WEBVIEWER_URL") ?? "http://localhost:8080/";
        }

        private static string GetConfigurationPath()
        {
            return Environment.GetEnvironmentVariable("WEBVIEWER_PATH") ?? "webviewer/index.html";
        }
    }
}
