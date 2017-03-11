const request = require('request');
const fs = require('fs');

let options = {
  url: 'http://truyenfull.vn/linh-vu-thien-ha/chuong-1418',
  headers: {
    'User-Agent': 'request',
    'Accept': '*/*',
    // 'Accept-Encoding': 'gzip, deflate',
    // 'User-Agent': 'runscope/0.1'
  }
};

const toc = 'toc';
const stopTxt = 'chuong-2100';
const footer = '</body></html>';
const errTxt = 'javascript:void(0)';
const sepLine = '<br>========================<br>';
const header = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /></head><body>';
const hrefPatt = /^.*href="([^"]*)".*$/;
const titlePatt = /^.*title="([^"]*)".*$/;
const bodyPatt = /<div([^<>]*)"chapter-c">.*?<\/div>/g;
const chapterPatt = /<a\s+class="chapter-title".*?<\/a>/g;
const adsPatt = /<div class="([a-z-\s])*ads-holder">.*?<\/div>/g;
const linkPatt = /<a([^<>]*)href="([^"']*)"([^<>]*)id="next_chap"([^<>]*)?>/g;

let title;
let nextLink;
let stop = false;
let fileExist = false;
let fname = './files/linh-vu-thien-ha-1418-2100.html';

const run = () => {
  request(options, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }

    if (response && response.statusCode !== 200) {
      console.log('Request status', response.statusCode);
      return;
    }

    
    body = body.replace(adsPatt, '');
    title = body.match(chapterPatt);
    nextLink = body.match(linkPatt);
    
    if (title)  {
      title = title[0].replace(titlePatt, '$1');
      title = `<a class="${toc}"><h3>${title}</h3></a>`;
    }

    if (nextLink && nextLink[0].indexOf(errTxt) === -1) {
      nextLink = nextLink[0].replace(hrefPatt, '$1');
    } else {
      nextLink = null;
    }

    body = body.match(bodyPatt);
    body = body ? body[0] : null;


    if (stop || !title || !body || !nextLink) {
      fs.appendFile(fname, footer, 'utf8', (err) => {
        if (err) {
          console.log('Appending footer error');
          throw err;
        }
        console.log('End');
      });
      return;
    }

    return;

    // Stop running =============================================
    if (options.url.indexOf(stopTxt) !== -1) {
      stop = true;
    }

    body = title + body;

    if (fileExist) {
      body = sepLine + body; 
      fs.appendFile(fname, body, 'utf8', (err) => {
        if (err) {
          console.log('Appending error');
          throw err;
        }

        options.url = nextLink;
        console.log(options.url, ' concated');
        run();
      });
      return;
    }

    body = header + body;
    
    fs.writeFile(fname, body, 'utf8', (err) => {
      if (err) {
        console.log('Create file error');
        throw err;
      }
      console.log('It\'s saved!');

      options.url = nextLink;
      console.log(options.url);
      fileExist = true;
      run();
    });

  })
}

run();