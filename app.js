const collector = require('./collector');

collector({
  start: 'http://truyenfull.vn/cuc-pham-gia-dinh/chuong-1',
  end: 'http://truyenfull.vn/cuc-pham-gia-dinh/chuong-10',
  dest: './files/cuc-pham-gia-dinh.epub',
  ebook: {
    title: "CỰC PHẨM GIA ĐINH", // *Required, title of the book. 
    author: "Vũ Nham", // *Required, name of the author. 
    publisher: "No one", // optional 
    cover: "http://static.truyenfull.vn/poster/n/QWJ4NzhWQUZmRkcxcTBldypGYVZaejBpX0deRmYqQCp2VmtBYUxNMm0xMW8yTHkxeFgwSkxfVypdTVdGQ1p5OVdVREJyJFZaTFlbcFVTUzlCUVVGQlFVRkJRVzFHUVM5dF9VSjJOMSRLUXxZMCN5OTNNfkUxTFdeek1*ST0=/cuc-pham-gia-dinh.jpg",
    content: [] 
  },
  onSuccess: () => {
    
  }
})