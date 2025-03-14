using Microsoft.Web.WebView2.Core;

namespace webviewer_winforms_sample
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private async void Form1_Load(object sender, EventArgs e)
        {
            var options = new CoreWebView2EnvironmentOptions();
            options.AdditionalBrowserArguments = "--disable-web-security";

            var environment = await CoreWebView2Environment.CreateAsync(null, null, options);
            await webView.EnsureCoreWebView2Async(environment);

            UriBuilder uriBuilder = new UriBuilder(Path.Combine(Directory.GetCurrentDirectory(), "webviewer/index.html"));
            webView.Source = uriBuilder.Uri; 
        }
    }
}
