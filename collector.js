const request = require('request');
const process = require('process');
const cheerio = require('cheerio');
const download = require('download');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid/v1')();
const utils = require('./utils');

const contentTmp = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="en"><head><meta charset="UTF-8" /><title>{{title}}</title><link rel="stylesheet" type="text/css" href="style.css" /></head><body>{{body}}</body></html>';
const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xml:lang="en" xmlns:media="http://www.idpf.org/epub/vocab/overlays/#" prefix="ibooks: http://vocabulary.itunes.apple.com/rdf/ibooks/vocabulary-extensions-1.0/">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
        <dc:identifier id="BookId">{{uuid}}</dc:identifier>
        <meta refines="#BookId" property="identifier-type" scheme="onix:codelist5">22</meta>
        <meta property="dcterms:identifier" id="meta-identifier">BookId</meta>
        <meta name="cover" content="image_cover" />
        <meta name="generator" content="epub-gen" />
        <meta property="ibooks:specified-fonts">true</meta>
    </metadata>
    <manifest>
        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
        <item id="css" href="style.css" media-type="text/css" />
        <item id="image_cover" href="cover.jpeg" media-type="image/jpeg" />
        {{items}}
    </manifest>
    <spine toc="ncx">
        <itemref idref="toc" />
        {{itemRefs}}
    </spine>
</package>`;

const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
        <meta name="dtb:uid" content="{{uuid}}" />
        <meta name="dtb:generator" content="epub-gen" />
        <meta name="dtb:depth" content="1" />
        <meta name="dtb:totalPageCount" content="0" />
        <meta name="dtb:maxPageNumber" content="0" />
    </head>
    <navMap>
      {{navPoints}}
    </navMap>
</ncx>`;

let stop = false;
let created = false;
let reqOpts = {
  url: '',
  headers: {
    'User-Agent': 'request',
    'Accept': '*/*',
  }
};
let reqIdx = 0;
let items = '';
let itemRefs = '';
let navPoints = '';

// Downloading contents
const run = (opts) => {
  if (!opts.dest) {
    opts.output = `./files/${opts.name}/${opts.name}.epub`;
    opts.dest = `./files/${opts.name}`;
  }
  request(Object.assign({}, reqOpts, {
    url: opts.start
  }), 
  // request response
  (error, response, body) => {
    let title, unsignedTitle;
    let nextLink;
    let $;
    let fname;
    let toc;

    ++reqIdx;

    // Check errors
    if (error) {
      console.log(error);
      return;
    }

    if (response && response.statusCode !== 200) {
      console.log('Request status', response.statusCode);
      return;
    }

    if (opts.start.indexOf(opts.end) === -1) {
      utils.logger(opts.start);
    } else {
      utils.logger(opts.start);
      console.log('\nOk. Start generating');
    }

    // Extract contents from response
    $ = cheerio.load(body);
    $('.ads-holder').remove();

    body = $('.chapter-c').html();
    title = $('.chapter-title').text();
    unsignedTitle = utils.showUnsignedString(title);
    nextLink = $('#next_chap').attr('href');

    toc =  {
      id: `content_${reqIdx}`,
      title: title,
      fname: unsignedTitle.toLowerCase().replace(/([^a-z0-9])/g, '-').replace(/-+/g, '-'),
      order: reqIdx
    };

    items += utils.createItem(toc);
    itemRefs += utils.createItemRef(toc);
    navPoints += utils.createNavPoint(toc);

    title = `<a class="toc"><h3>${title}</h3></a>`;
    body = title + body;
    nextLink = nextLink === 'javascript:void(0)' ? null : nextLink;

    if (stop || !nextLink) {
      opts.terminate = true;
    }

    // Mark to terminate request
    if (nextLink && nextLink.indexOf(opts.end) !== -1) {
      stop = true;
    }

    // create base folder
    if (!opts.createFd) {
      utils.createBase(opts);
      opts.createFd = true;
    }

    body = contentTmp.replace('{{title}}', title).replace('{{body}}', body).replace(/<br>/g, '<br/>');
    fname = path.join(opts.dest, 'OEBPS', `${toc.fname}.xhtml`);

    fs.writeFile(fname, body, 'utf8', (err) => {
      if (err) throw err;
      if (opts.terminate) {
        let tocCnt = tocNcx
          .replace('{{uuid}}', uuid)
          .replace('{{navPoints}}', navPoints);

        let contentCnt = contentOpf
          .replace('{{uuid}}', uuid)
          .replace('{{items}}', items)
          .replace('{{itemRefs}}', itemRefs);

        console.log('Create table of contents');
        fs.writeFileSync(path.join(opts.dest, 'OEBPS/toc.ncx'), tocCnt, 'utf8');
        console.log('Create contents');
        fs.writeFileSync(path.join(opts.dest, 'OEBPS/content.opf'), contentCnt, 'utf8');

        if (opts.cover) {
          download(opts.cover)
            .pipe(fs.createWriteStream(path.join(opts.dest, 'OEBPS/cover.jpeg')))
            .on('finish', () => {
              console.log('Download cover image');
              utils.generateFile(opts);
            });
        } else {
          utils.generateFile(opts);
        }

        return; 
      }

      opts.start = nextLink;
      run(opts);
    });
  })
}

module.exports = run;