const request = require('request-promise-native')
const fs = require('fs')
const path = require('path')

async function fetch (params) {
  let body = await fetchByUrl(params)
  let o = JSON.parse(body.trim())
  let idfound = o.data.url.match(/share\/(.*)/i)
  if (idfound) {
    let id = idfound[1]
    let htm = await fetchById(id)
    let m3u8 = htm.match(/url:\s*'(.*)'/i)
    if (m3u8) {
      m3u8 = 'https://v3.juhui600.com' + m3u8[1]
      return m3u8
    } else {
      throw new Error('m3u8 not found')
    }
  } else {
    throw new Error('shareid not found')
  }
}

function fetchById (id) {
  let opts = {
    url: `https://v3.juhui600.com/share/${id}`,
    gzip: true,
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,text/plain, */*'
    }
  }
  return request(opts)
}

function fetchByUrl (data) {
  let opts = {
    url: 'http://www.haitum.com/common/api_getNewHost.php',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
      'accept': '*/*',
      'referer': 'http://www.haitum.com'
    },
    form: data,
    json: true
  }
  return request.post(opts)
}

async function fetchAll () {
  // http://www.haitum.com/dianshiju
  let pobingxingdong = {
    cname: '破冰行动',
    name: 'pobingxingdong',
    url: 'http://www.haitum.com/movie/201-119047.html&play=0-',
    cnt: 30
  }
  let current = pobingxingdong
  let m3u = ['#EXTM3U']
  for (var i = 0; i < current.cnt; i++) {
    let url = current.url + i
    let found = url.match(/(\d+)-(\d+).html&play=(\d+)-(\d+)/i)
    if (found) {
      let params = {
        order: 'getNewHost',
        aid: '',
        sid: found[1],
        mid: found[2],
        isstatic: 1,
        target: 'movieDetails',
        rp0: found[3],
        rp1: found[4],
        isBackServerRsData: 1
      }
      let m3u8 = await fetch(params)
      console.log(i, m3u8)
      m3u.push('#EXTINF:0,破冰行动 - ' + (i + 1))
      m3u.push(m3u8)
    }
  }
  fs.writeFileSync(path.join(__dirname, '../data/' + current.name + '.m3u'), m3u.join('\r\n'))
}

;(function () {
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  switch (command) {
    case 'fetch':
      fetchAll()
      break
    case 'build':

      break
    default:
      break
  }
})()
