const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const archiver = require('archiver');
const readline = require('readline');

exports.createItem = (dt) => {
  return `<item id="${dt.id}" href="${dt.fname}.xhtml" media-type="application/xhtml+xml" />`;
}

exports.createItemRef = (dt) => {
  return `<itemref idref="${dt.id}" />`;
}

exports.createNavPoint = (dt) => {
  return `<navPoint id="${dt.id}" playOrder="${dt.order}" class="chapter">
    <navLabel>
      <text>${dt.title}</text>
    </navLabel>
    <content src="${dt.fname}.xhtml" />
  </navPoint>`;
}

// Convert Vietnamese to Latin
exports.showUnsignedString = (input) => {
    var signedChars     = "àảãáạăằẳẵắặâầẩẫấậđèẻẽéẹêềểễếệìỉĩíịòỏõóọôồổỗốộơờởỡớợùủũúụưừửữứựỳỷỹýỵÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬĐÈẺẼÉẸÊỀỂỄẾỆÌỈĨÍỊÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢÙỦŨÚỤƯỪỬỮỨỰỲỶỸÝỴ";
    var unsignedChars   = "aaaaaaaaaaaaaaaaadeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyAAAAAAAAAAAAAAAAADEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYY";
    var pattern = new RegExp("[" + signedChars + "]", "g");
    var output = input.replace(pattern, function (m, key, value) {
        return unsignedChars.charAt(signedChars.indexOf(m));
    });
    return output
}

// Create base folders
exports.createBase = (opts) => {
  if (fs.existsSync(opts.dest)) 
    rimraf.sync(opts.dest);

  fs.mkdirSync(opts.dest);
  
  fs.mkdirSync(path.join(opts.dest, 'META-INF'));
  fs.writeFileSync(path.join(opts.dest, 'META-INF', 'container.xml'), '<?xml version="1.0" encoding="UTF-8"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles></container>', 'utf8');

  fs.mkdirSync(path.join(opts.dest, 'OEBPS'));
  fs.writeFileSync(path.join(opts.dest, 'OEBPS', 'style.css'), '.epub-author{color: #555;}.epub-link{margin-bottom: 30px;}.epub-link a{color: #666;font-size: 90%;}.toc-author{font-size: 90%;color: #555;}.toc-link{color: #999;font-size: 85%;display: block;}hr {border: 0;border-bottom: 1px solid #dedede;margin: 60px 10%;}', 'utf8');

  fs.writeFileSync(path.join(opts.dest, 'mimetype'), 'application/epub+zip', 'utf8');

}

// Generate epub
exports.generateFile = (opts) => {
  // create a file to stream archive data to.
  var output = fs.createWriteStream(`${opts.output}`);
  var archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
  });

  // listen for all archive data to be written
  output.on('close', function() {
    console.log('Total size:', archive.pointer()/1000000 + ' MB');
    console.log('\x1b[36mDONE\x1b[0m');
  });

  // good practice to catch this error explicitly
  archive.on('error', function(err) {
    throw err;
  });

  // pipe archive data to the file
  archive.pipe(output);

  // append a file
  archive.file(`${opts.dest}/mimetype`, { name: 'mimetype' });
  archive.directory(`${opts.dest}/META-INF`, "META-INF");
  archive.directory(`${opts.dest}/OEBPS`, "OEBPS");

  // finalize the archive (ie we are done appending files but streams have to finish yet)
  archive.finalize();
}

exports.logger = (data) => {
    //readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Downloading: ${data}`);
};
