const request = require('request');
const process = require('process');
const cheerio = require('cheerio');
const download = require('download');
const fs = require('fs');
const epub = require("epub-gen");
const concat = require('concatenate-files');
var readline = require('readline');

const header = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
const footer = '</body></html>';
const FILEPATH = './files';
const MAXSIZE = 10 * 1024 * 1024;
const logger = (data) => {
    //readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Downloading: ${data}`);
};


let stop = false;
let created = false;
let reqCounter = 0;
let fi = 0;
let arrFiles = [];
let defaultOpts = {
  start: '',
  end: '',
  ebook:  {
    title: '', // *Required, title of the book. 
    author: '', // *Required, name of the author. 
    publisher: '', // optional 
    cover: '', // Url or File path, both ok. 
    content: []
  }
}; 
let reqOpts = {
  url: '',
  headers: {
    'User-Agent': 'request',
    'Accept': '*/*',
  }
};

const run = (opts) => {
  request(Object.assign({}, reqOpts, {
    url: opts.start
  }), 
  // request response
  (error, response, body) => {
    let title;
    let nextLink;
    let $;

    // Check errors
    if (error) {
      console.log(error);
      return;
    }

    if (response && response.statusCode !== 200) {
      console.log('Request status', response.statusCode);
      return;
    }

    opts.start.indexOf(opts.end) === -1 ?
      logger(opts.start) :
      console.log('\nContent downloaded');

    // Extract contents from response
    $ = cheerio.load(body);
    $('.ads-holder').remove();

    body = $('.chapter-c').html();
    title = $('.chapter-title').text();
    nextLink = $('#next_chap').attr('href');

    title = `<a class="toc"><h3>${title}</h3></a>`;
    body = title + body;
    nextLink = nextLink === 'javascript:void(0)' ? null : nextLink;

    // calculate the size of file
    reqCounter += body.length;
    
    // if the size of file greater than MAXSIZE, then create a new one
    if (reqCounter >= MAXSIZE) {
      created = false;
      reqCounter = 0;
      ++fi;

      !opts.oldDest && (opts.oldDest = opts.dest) && arrFiles.push(opts.dest);

      opts.dest = opts.oldDest.replace('.html', `-${fi}.html`);
      arrFiles.push(opts.dest);
    }

    // Terminate requesting when reaching at opts.end or nextlink isnt exits
    if (stop || !nextLink) {
      fs.appendFile(opts.dest, body + footer, 'utf8', (err) => {
        if (err) throw err;

        opts.cover && download(opts.cover, FILEPATH).then(() => {
            console.log('Cover image downloaded!');
        });

        // concat files if splitted
        if (arrFiles.length) {
          opts.oldDest = opts.oldDest.replace('.html', '.concated.html');
          concat(arrFiles, opts.oldDest, { separator: '' }, (errC, resC) => {
            if (errC) throw errC;
            
            arrFiles.forEach((f, i) => {
              fs.unlink(f);
            });

            console.log('Concated files! DONE');
          });
          return;
        }
        console.log('File built!');
      });
      return;
    }

    // Mark to terminate request
    if (nextLink.indexOf(opts.end) !== -1) {
      stop = true;
    }
    
    if (created) {
      fs.appendFile(opts.dest, body, 'utf8', (err) => {
        if (err) throw err;

        opts.start = nextLink;
        run(opts);
      });
      return;
    }

    // Continue requesting
    body = opts.oldDest ? body : header + body;
    fs.writeFile(opts.dest, body, 'utf8', (err) => {
      if (err) throw err;      

      opts.start = nextLink;
      created = true;
      run(opts);
    });
  })
}

module.exports = run;