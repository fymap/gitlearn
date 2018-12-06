const fs = require('fs');
const path = require('path');

function build(fname) {
  var txt = fs.readFileSync(path.join(__dirname, `../data/${fname}.txt`), 'utf8');
  var o = {
    "uuid": "64350b50-a810-4901-b86b-7a5106bdef2c",
    "title": `频道-${fname}`,
    "channels": []
  }
  var channels = [];
  var lines = txt.split('\r\n');
  lines.forEach((line) => {
    if (line) {
      var chi = line.split(',')
      channels.push({
        name: chi[0],
        url: chi[1]
      });
    }
  });
  o.channels = channels;
  fs.writeFileSync(path.join(__dirname, `../${fname}.json`), JSON.stringify(o, null, '\t'));  
}

// build('huya');
// build('others');
build('cctv')
