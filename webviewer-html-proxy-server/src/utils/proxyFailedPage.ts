const getProxyFailedPage = (error?: string) => {
  return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <script type='text/javascript'>
        const getClientUrl = () => {
          const { origin } = new URL(document.referrer);
          return origin;
        };

        window.parent.postMessage({ type: 'proxyFinishFail', error: '${error}' }, getClientUrl());
      </script>
    </head>

    <body>
    </body>

    </html>
  `;
};

export { getProxyFailedPage };