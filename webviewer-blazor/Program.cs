using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace BlazorWebViewerServer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(config =>
                {
                    config.AddInMemoryCollection(LoadDotEnv(".env"));
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        // Reads KEY=VALUE pairs from a .env file, if it exists
        private static Dictionary<string, string> LoadDotEnv(string path)
        {
            var values = new Dictionary<string, string>();
            if (!File.Exists(path))
            {
                return values;
            }

            foreach (var line in File.ReadAllLines(path))
            {
                var trimmed = line.Trim();
                var separatorIndex = trimmed.IndexOf('=');
                if (trimmed.StartsWith('#') || separatorIndex <= 0)
                {
                    continue;
                }

                var key = trimmed.Substring(0, separatorIndex).Trim();
                var value = trimmed.Substring(separatorIndex + 1).Trim().Trim('"', '\'');
                values[key] = value;
            }

            return values;
        }
    }
}
