## Instruction

1. You have to install `nodejs` and `npm`

2. Next, you need to download source code [here](https://github.com/huudai09/collector/archive/master.zip) or clone it via `git` command as below:
```bash
  git clone https://github.com/huudai09/collector.git
```

3. Install dependencies packages as below
```bash
  npm install
```

4. Configure settings in `./app.js` file
```javascript
collector({
  name: 'TIÊN NGỤC',
  start: 'http://truyenfull.vn/tien-nguc/chuong-1/',
  end: 'http://truyenfull.vn/tien-nguc/chuong-1503/', // optional
  cover: 'http://demo.com/cover.jpg', // optional
})
```

5. Start generating .epub file
```bash
  npm start
```

6. If success, the console will print out
```bash
Downloading: http://truyenfull.vn/nga-duc-phong-thien/chuong-2/2/
Ok. Start generating
Create table of contents
Create contents
Download cover image
Total size: 0.065386 MB
DONE
```