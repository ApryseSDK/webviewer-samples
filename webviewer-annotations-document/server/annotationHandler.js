const fs = require('fs');
const multer = require('multer');

const upload = multer(); // To handle blob in the server

module.exports = (app) => {  
  // Handle POST request sent to '/server/annotationHandler.js'
  app.post('/server/annotationHandler.js', upload.any(), (req, res) => {
    const filename = req.query.filename;
    try {
      // Write the blob into a PDF file
      res.status(200).send(fs.writeFileSync(`server/${req.query.filename}`, req.files[0].buffer));
    } catch(e) {
      res.status(500).send(`Error writing file data to ${filename}`);
    }
    res.end();
  });
}
