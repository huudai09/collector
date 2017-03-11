const request = require('request');
const process = require('process');
const cheerio = require('cheerio');
const fs = require('fs');
const epub = require("epub-gen");

let stop = false;
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

    // Push content into list
    opts.ebook.content.push({
      title: title,
      data: body 
    });

    // Terminate requesting when reaching at opts.end or title, body, nextlink arent exits
    if (stop || !title || !body || !nextLink) {
      console.log('\x1b[36mStart generating epub file');

      // Generate file
      new epub(opts.ebook, opts.dest).promise.then(function(){
        console.log('\x1b[0m');
        console.log(`\x1b[32mEbook Generated Successfully! ${opts.dest}\x1b[0m`);
        opts.onSuccess && opts.onSuccess();
      }, function(err){
        opts.onError && opts.onError(err);
        console.log('\x1b[0m');
        console.error('\x1b[31mFailed to generate Ebook because of ', err, '\x1b[0m')
      });
      return;
    }

    // Mark to terminate request
    if (nextLink.indexOf(opts.end) !== -1) {
      stop = true;
    }

    // Continue requesting
    let mem = process.memoryUsage();
    opts.start = nextLink;
    console.log(nextLink, mem);
    run(opts);

  })
}

module.exports = run;