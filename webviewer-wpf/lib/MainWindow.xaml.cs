using IO = System.IO;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;

namespace WebView2;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
   public MainWindow()
   {
      InitializeComponent();
      InitializeWebView();
   }

   private async void InitializeWebView()
   {
      await webViewUI.EnsureCoreWebView2Async(null);
      
      //Set up a virtual host and map to local folder containing Apryse's WebViewer
      webViewUI.CoreWebView2.SetVirtualHostNameToFolderMapping(
         "app.local",
         GetWebViewerPath(),
         CoreWebView2HostResourceAccessKind.Allow);
      
      //Navigate to the page on virtual host
      webViewUI.CoreWebView2.Navigate("https://app.local/index.html");
   }

   private string GetWebViewerPath()
   {
      //Get the path to the current directory
      string rootPath = AppDomain.CurrentDomain.BaseDirectory;

      //Get the path to the webviewer folder using relative path, moving up 4 levels
      rootPath = IO.Path.GetFullPath(IO.Path.Combine(rootPath, @"..\..\..\..\"));
      string projectPath = IO.Path.Combine(rootPath, @"lib\WebViewer");
      return projectPath;
   }
}