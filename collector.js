const request = require('request');
const process = require('process');
const cheerio = require('cheerio');
const fs = require('fs');
const epub = require("epub-gen");

const header = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
const footer = '</body></html>';

let stop = false;
let created = false;
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

    // Terminate requesting when reaching at opts.end or title, body, nextlink arent exits
    if (stop || !nextLink) {
      fs.appendFile(opts.dest, body + footer, 'utf8', (err) => {
        if (err) throw err;
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
    body = header + body;
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