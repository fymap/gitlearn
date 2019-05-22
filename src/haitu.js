const request = require('request-promise-native')
const fs = require('fs')
const path = require('path')

async function fetch (params) {
  let url = await getShareUrl(params)
  let htm = await fetchSharePage(url)
  let urlPrex = url.match(/^.*\.[^./]*/)
  if (!urlPrex) {
    throw new Error('share url get fail ' + url)
  }
  urlPrex = urlPrex[0]
  let m3u8 = htm.match(/[^'"]*index\.m3u8[^'"]*/)
  if (m3u8) {
    m3u8 = urlPrex + m3u8[0]
    return m3u8
  } else {
    throw new Error('m3u8 not found')
  }
}

function fetchSharePage (url) {
  let opts = {
    url: url,
    gzip: true,
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml,text/plain, */*'
    }
  }
  return request(opts)
}

async function getShareUrl (data) {
  let opts = {
    url: 'http://www.haitum.com/common/api_getNewHost.php',
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.157 Safari/537.36',
      'accept': '*/*',
      'referer': 'http://www.haitum.com'
    },
    form: data
  }
  let body = await request.post(opts)
  // console.log(body)
  let o = JSON.parse(body.trim())
  return o.data.url
}

async function fetchAll (current) {
  // http://www.haitum.com/dianshiju

  let m3u = ['#EXTM3U']
  for (var i = 0; i < current.cnt; i++) {
    let url = current.url + i
    let found = url.match(/(\d+)-(\d+).html&play=(\d+)-(\d+)/i)
    // console.log(found)
    let params = {}
    if (found) {
      params = {
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
    } else {
      found = url.match(/(\d+).html&play=(\d+)-(\d+)/i)
      if (found) {
        params = {
          order: 'getNewHost',
          aid: found[1],
          sid: '',
          mid: '',
          isstatic: 1,
          target: 'movieDetails',
          rp0: found[2],
          rp1: found[3],
          isBackServerRsData: 1
        }
      } else {
        throw new Error('parse url error: ' + url)
      }
    }
    let m3u8 = await fetch(params)
    console.log(i, m3u8)
    m3u.push('#EXTINF:0,' + current.cname + ' - ' + (i + 1))
    m3u.push(m3u8)
  }
  fs.writeFileSync(path.join(__dirname, '../data/' + current.name + '.m3u'), m3u.join('\r\n'))
}

;(function () {
  let jujis = [{
    cname: '破冰行动',
    name: 'pobingxingdong',
    url: 'http://www.haitum.com/movie/10571.html&play=0-',
    cnt: 30
  }, {
    cname: '权游1',
    name: 'quanyou1',
    url: 'http://www.haitum.com/movie/201-73620.html&play=0-',
    cnt: 10
  }, {
    cname: '权游2',
    name: 'quanyou2',
    url: 'http://www.haitum.com/movie/201-73618.html&play=0-',
    cnt: 10
  }, {
    cname: '权游3',
    name: 'quanyou3',
    url: 'http://www.haitum.com/movie/201-73619.html&play=0-',
    cnt: 10
  }, {
    cname: '权游4',
    name: 'quanyou4',
    url: 'http://www.haitum.com/movie/201-73625.html&play=0-',
    cnt: 10
  }, {
    cname: '权游5',
    name: 'quanyou5',
    url: 'http://www.haitum.com/movie/201-73622.html&play=0-',
    cnt: 10
  }, {
    cname: '权游6',
    name: 'quanyou6',
    url: 'http://www.haitum.com/movie/201-73623.html&play=0-',
    cnt: 10
  }, {
    cname: '权游7',
    name: 'quanyou7',
    url: 'http://www.haitum.com/movie/201-72629.html&play=0-',
    cnt: 7
  }, {
    cname: '权游8',
    name: 'quanyou8',
    url: 'http://www.haitum.com/movie/201-115422.html&play=1-',
    cnt: 23
  }]
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  switch (command) {
    case 'fetch':
      let current = jujis[7]
      fetchAll(current)
      break
    case 'build':

      break
    default:
      break
  }
})()
