const request = require('request-promise-native')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

async function getYqkList () {
  let yqkList = []
  let o = await reqYqk()
  yqkList = yqkList.concat(o.data.list)
  let pageCount = o.data.pageCount
  for (var i = 2; i <= pageCount; i++) {
    let o = await reqYqk(i)
    yqkList = yqkList.concat(o.data.list)
  }
  console.log('总数: ' + yqkList.length)
}

async function reqYqk (page = 1) {
  var opts = {
    url: `https://m.douyu.com/api/room/list?page=${page}&type=yqk`,
    headers: {
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      'accept': 'application/json, text/plain, */*',
      'referer': 'https://m.douyu.com/list/room?type=yqk',
      'x-requested-with': 'XMLHttpRequest'
    },
    json: true
  }
  console.log(`page: ${page}`)
  return request(opts)
}

async function getm3u8 (i = 0) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width: 414, height: 736 })
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')
  var games = fs.readFileSync(path.join(__dirname, '../douyu/douyu_step_1.json'), 'utf8')
  games = JSON.parse(games)
  let o = await getVideoUrl(page, games.slice(0, 30))
  fs.writeFileSync(path.join(__dirname, '../data/douyu.json'), JSON.stringify(o, null, '\t'))
  await browser.close()
}

async function getVideoUrl (page, games) {
  var o = {
    uuid: '64350b50-a810-4901-b86b-7a5106bdef2c',
    title: 'douyu',
    channels: []
  }
  while (games.length) {
    var game = games.shift()
    let rid = game.rid
    let rname = game.roomName
    await page.goto(`https://m.douyu.com/${rid}?type=yqk`)
    await page.waitFor(() => {
      var video = document.querySelector('video')
      if (video) {
        return !!video.src
      } else {
        return false
      }
    })
    const src = await page.$eval('video', el => el.src)
    console.log({ src, rid, rname })
    o.channels.push({
      name: rname,
      url: src
    })
  }
  return o
}

function main () {
  // console.log(process.argv)
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  switch (command) {
    case 'fetch':
      getYqkList()
      break
    case 'build':
      getm3u8()
      break
    default:
      break
  }
}

main()
