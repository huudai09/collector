const request = require('request');
const process = require('process');
const cheerio = require('cheerio');
const fs = require('fs');
const epub = require("epub-gen");
const concat = require('concatenate-files');

const header = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
const footer = '</body></html>';
const MAXSIZE = 10 * 1024 * 1024;

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

    // Extract contents from response
    $ = cheerio.load(body);
    $('.ads-holder').remove();

    body = $('.chapter-c').html();
    title = $('.chapter-title').text();
    nextLink = $('#next_chap').attr('href');

    title = `<a class="toc"><h3>${title}</h3></a>`;
    body = title + body;
    nextLink = nextLink === 'javascript:void(0)' ? null : nextLink;

    reqCounter += body.length;
    
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
        console.log('DONE');
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
        console.log(opts.start);
        run(opts);
      });
      return;
    }

    // Continue requesting
    body = opts.oldDest ? body : header + body;
    fs.writeFile(opts.dest, body, 'utf8', (err) => {
      if (err) throw err;      

      opts.start = nextLink;
      console.log(opts.start);
      created = true;
      run(opts);
    });
  })
}

module.exports = run;