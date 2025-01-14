using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

/**
 * AnnotationController.cs
 * This is a sample of basic server-side annotation handling using ASP.NET.
 * When WebViewer makes a POST request with annotations to save, this script will save the annotations to a file.
 * When WebViewer makes a GET request to load the annotations, this script will fetch the annotations from the file and return it.
 * Note that this is only a sample and does not take account of security and concurrency.
 **/

namespace WebApplication1.Controllers
{
    public class AnnotationController : ApiController
    {
        // Handle GET request sent to '/api/annotation'
        // GET api/<controller>
        public HttpResponseMessage Get()
        {
            string filePath = GetFilePath(this.Request);
            if (File.Exists(filePath))
            {
                // Read from the XFDF file and send the string as a response
                string xfdfData = File.ReadAllText(filePath);
                return new HttpResponseMessage() { Content = new StringContent(xfdfData) };
            }
            else
            {
                return new HttpResponseMessage(HttpStatusCode.NoContent);
            }
        }

        // Handle POST request sent to '/api/annotation'
        // POST api/<controller>
        public async Task Post()
        {
            string filePath = GetFilePath(this.Request);
            string xfdfData = await Request.Content.ReadAsStringAsync();
            File.WriteAllText(filePath, xfdfData);
        }

        private string GetFilePath(HttpRequestMessage request)
        {
            string id = GetId(request);
            string fileName = (id != null) ? id : "default";
            return System.Web.HttpContext.Current.Server.MapPath(string.Format("~\\{0}.xfdf", fileName));
        }

        private string GetId(HttpRequestMessage request)
        {
            var pairs = Request.GetQueryNameValuePairs();
            string documentId = null;
            foreach (KeyValuePair<string, string> kvp in pairs)
            {
                if (kvp.Key == "id")
                {
                    documentId = kvp.Value;
                }
            }

            return documentId;
        }
    }
}