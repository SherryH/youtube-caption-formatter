// use youtube downloader to download caption
// > youtube-dl --write-auto-sub --skip-download https://www.youtube.com/watch?v=YODPgBadj80

// getting the output file from /captionInput
// read the content of the file (check the fileContent)
// perform Regex to format the content
// HTML template: format the content to be read on html

var fs = require("fs");
var path = require("path");
var Promise = require("promise");

// var readFileAsync = Promise.promisify(fs.readFile);

var inputDir = path.join(__dirname, "/captionInput");
var outputDir = path.join(__dirname, "/captionOutput");

var currentFile = null;
var outputFile = null;

fs.readdir(inputDir, function(err, files) {
  if (err) console.log(err);
  console.log("files in dir", files);
  // read the first file in the input dir
  currentFile = path.join(inputDir, files[0]);
  outputFile = path.join(outputDir, `${files[0]}.html`);

  // read file content
  readFileAsync(currentFile)
    .then(function(fileContent) {
      var contentArr = fileContent.toString().split("\n");
      return contentArr.map(function(line, index) {
        var isEven = index % 2 === 0;
        var istimeline = line.search(/-->/g) !== -1;
        // var isCaptionLine = line.search(/<\/?[\w\.?:?]+>/g) !== -1;
        var isCaptionLine = line.search(/-->/g) === -1;
        if (istimeline) {
          return line.replace(/-->.*/g, "");
        } else if (isCaptionLine) {
          return line.replace(/<\/?[\w\.?:?]+>/g, "");
        } else {
          return "";
        }
      });
    })
    .then(function(rawContent) {
      // combine 2 caption lines together
      // add html tags
      return rawContent.map(function(line, index) {
        var istimeline = line => {
          return /\d{2}:\d{2}:\d{2}/.test(line);
        };
        var isCaptionLine = line => {
          return !istimeline(line) && line !== "";
        };
        if (istimeline(line)) {
          // find the next timeline and remove it
          var nextInd = index + 1;
          while (
            !istimeline(rawContent[nextInd]) &&
            nextInd < rawContent.length
          ) {
            nextInd++;
            console.log("nextInd", nextInd, rawContent[nextInd]);
          }
          // console.log(
          //   'istimeline',
          //   istimeline(rawContent[nextInd]),
          //   rawContent[nextInd]
          // );
          if (istimeline(rawContent[nextInd])) rawContent[nextInd] = "";
          return renderTime(line);
        }
        if (isCaptionLine(line)) {
          var nextInd = index + 1;
          while (
            !isCaptionLine(rawContent[nextInd]) &&
            nextInd < rawContent.length
          ) {
            nextInd++;
          }
          if (isCaptionLine(rawContent[nextInd])) {
            line = line.concat(" ", rawContent[nextInd]);
            // console.log(
            //   'isCaption',
            //   isCaptionLine(rawContent[nextInd]),
            //   rawContent[nextInd]
            // );
            rawContent[nextInd] = "";
            return renderCaption(line);
          }
        }
        return line;
      });
    })
    .then(function(formattedContent) {
      wStream = fs.createWriteStream(outputFile);
      wStream.write(createHTMLBoilerplate());
      formattedContent.forEach(function(content) {
        if (content !== "") wStream.write(content);
      });
      wStream.write("</body>\n</html>");
      wStream.on("finish", function() {
        console.log("all data wrote to file");
      });
    })
    .catch(function(err) {
      console.error(err);
    });
});

function readFileAsync(filePath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filePath, function(err, content) {
      if (err) reject(err);
      resolve(content);
    });
  });
}

function renderTime(time) {
  return `<div class="block">
  <span class="time">${time}</span>`;
}

function renderCaption(caption) {
  return `  <span class="caption">${caption}</span>
  </div>`;
}

function createHTMLBoilerplate() {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Extracted Subtitle</title>
      <link rel="stylesheet" href="styles.css">
    </head>
    <body>`;
}
