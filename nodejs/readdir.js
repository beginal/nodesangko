var testFolder = './data';
var fs = require('fs');

fs.readdir(testFolder, (err, files) => {
  console.log(files)
  })