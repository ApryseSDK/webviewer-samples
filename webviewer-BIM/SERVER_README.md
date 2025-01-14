# WebViewer BIM Server

WebViewer BIM Server is a REST server for performing 3D document work.

This server comes packaged as either a binary or a Docker image available for Windows, Linux and MacOS Intel (M1 not supported).

- [Setting up Server](#setting-up-server)
  * [Docker Image](#docker-image)
- [Configuring Server](#configuring-server)
- [Running Server](#running-server)
  * [Running with Docker and configuration file](#running-with-docker-and-configuration-file)
  * [Running with Docker and environment variables](#running-with-docker-and-environment-variables)
- [Managing Docker](#managing-docker)
- [WebViewer BIM Server APIs](#webviewer-bim-server-apis)

## Setting up Server

### Docker Image

1. Install [Docker CLI](https://docs.docker.com/get-docker/).

2. Pull latest webviewer bim server image:

```bash
docker pull pdftron/webviewer-bim-server:latest
```

## Configuring Server

The 3D server supports both setting configuration through a `config` file and setting it directly
through environment variables. To set configuration through a config file take the following steps:

The configuration file is a JSON file with the following options:

- `license` - The server license key
- `temp_directory` - The temp directory to use for processing. Defaults to `./sys/tmp`
- `log_directory` - The log directory to use for server logs. Defaults to `./sys/logs`
- `data_directory` - The directory to store cached data in. Defaults to `./sys/data`
- `log_level`     - Sets the logging level. Accepts `DEBUG` `INFO` `TRACE` `WARN`
- `num_threads`    - The number of concurrent jobs to target. Defaults to number of CPUs detected minus 1.
- `bind_address`   - The server binding address. Defaults to `0.0.0.0`
- `port`          - The server port. Defaults to `8085`
- `max_cache_size`  - The maximum cache size before forcing cache deletion. Defaults to 90% of the available disk.
- `force_zero_cache`- Force cache to constantly be removed. Defaults to `false`
- `release_mode`   - Sets HTTP to release mode, defaults to `true`.
- `request_timeout` - Maximum time to wait for an HTTP request result in seconds. Defaults to `10` seconds.
- `job_timeout`     - Maximum time to wait for a job to complete . Defaults to `10` minutes.
- `use_https`       - If `true`, enables HTTPS and uses the HTTPSPort. Defaults to `false`
- `https_port`      - HTTPS port, defaults to `443`
- `https_cert_file`  - The HTTPS public certificate location.
- `https_key_file`   - The HTTPS private certificate location.
- `allowed_origins` - The origins allowed to access the server. Expects a string array `['test.com','pdftron.com']`
 
 A sample of what the json file should look like.
 ```
{
    "license": "my_license_key",
    "allowed_origins": ["test.com", "pdftron.com"],
    "request_timeout": 1
}
 ```

 In order to pass these arguments as enviroment variables, just run the docker contianer with variable with the prefix `trn_`, such as:
```bash
docker run -e trn_license="MYLICENSE" -p 8085:8085 pdftron/webviewer-bim-server
```

## Running Server

### Running with Docker and configuration file

```bash
docker run -p 8085:8085 -v ABSOLUTE_PATH_TO_CONFIG_JSON_FILE:/home/docjob/config pdftron/webviewer-bim-server
```

This will mount the config file to the container into the path `/home/docjob/config` where it will be
loaded from.

### Running with Docker and environment variables

```bash
docker run -p 8085:8085 -e trn_license="my_license_key" pdftron/webviewer-bim-server
```

This will run the container with the configuration variable `trn_license` defined.

## Managing Docker 

It's important to maintain uptime when using a docker container. The best way to do this is with a container management tool such as `Portainer`, `Kubernetes`, `OpenShift`, `Docker`, `ECS` and much more.

When managing your webviewer-bim-server container, you can use its built in [health API](SERVER_README.md#response-body-2) to monitor its status.

## WebViewer BIM Server APIs

`GET /v1/convert/3d/{format}` - Converts a 3d asset into the specified format
| Argument | Description |
| --- | --- |
| {format} | Specific format that can be **vsf** and **vsfx** to converts a 3d Asset to a streaming format for Web Viewing or property to extracts **property** meta-data from a 3d Asset
  
#### Request Headers
```
uri: url to you 3D asset
ext: ifc
local: true
```
| Argument | Description |
| --- | --- |
| uri | The url of the ifc doc to get the sepecfic format from |
| ext | The extension of the source document if it cannot be determined from the URL |
| local | If set to true, expects URI to be a locally uploaded doc |

#### Response Body
A JSON document with the following structure:
```JSON
{
  "jid": "The job id of the result doc"
}
```
#### Status Code
| Status Code | Description |
| --- | --- |
| 202 | If job was accepted |

#### Example
```shel
curl -X GET http://localhost:8085/v1/convert/3d/vsf -H "uri: url_to_your_3d_asset"
```

`GET /v1/test` - Tests if the server queue is functioning

#### Response Body
A JSON document with the following structure:
```JSON
{
  "status": "sent"
}
```

#### Example
```shel
curl -X GET http://localhost:8085/v1/test
```


`GET /v1/health` - Checks server health

#### Response Body
A JSON document with the following structure:
```JSON
{
  "status": "Up"
}
```

#### Example
```shel
curl -X GET http://localhost:8085/v1/health
```

`POST /v1/util/upload` - Uploads a file for usage with other jobs

#### Response Body
Expects multipart form data with `Filename` containing filename and data within `file`

#### Response Body
A JSON document with the following structure:
```JSON
{
  "src": "source-id"
}
```

#### Example
```shel
curl -X POST localhost:8085/v1/util/upload -v --form file='@ABSOLUTE_PATH/PlayersTheatre.ifc'
```

`GET /v1/util/upload/status` - Checks if a uploaded file exists

#### Request Headers
```
src: local://d41d8cd98f00b204e9800998ecf8427e.ifc
```
| Argument | Description |
| --- | --- |
| src | Expects src header containing the key of the local upload ie `local://12345sd.vsf` |

#### Status Code
| Status Code | Description |
| --- | --- |
| 200 | File was found |
| 404 | File was not found |


#### Example
```shel
curl -I -X GET localhost:8085/v1/util/upload/status -H "src: local://d41d8cd98f00b204e9800998ecf8427e.ifc"
```

`GET /v1/results/{job-id}` - Request result for job

| Argument | Description |
| --- | --- |
| {job-id} | The job id of the result doc |

#### Status Code
| Status Code | Description |
| --- | --- |
| 102 | Processing, the job is still executing. Will eventually return one of the above status codes |
| 200 | Job is completed, returning result |
| 404 | Not found, no job was found for requested result |
| 408 | <ul><li> Requested job has failed since the execution took longer than the job timeout and no result exists </li> <li> Should keep retrying for the result if you get a 408 </li> <li> Set by request_timeout server timeout, defaults to 10s </li> |
| 460 | Requested job has failed during execution and no result exists |
| 461 | Requested job has failed since the execution took longer than the job timeout and no result exists |

#### Example
```shel
curl -X GET http://localhost:8085/v1/results/{jid} --output out.vsf
```
