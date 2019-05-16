const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

function getYqkList (page = 1, yqwArr = []) {
  let opts = {
    url: `https://m.douyu.com/api/room/list?page=${page}&type=yqk`,
    headers: {
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      'accept': 'application/json, text/plain, */*',
      'referer': 'https://m.douyu.com/list/room?type=yqk',
      'x-requested-with': 'XMLHttpRequest'
    }
  }
  request(opts, (err, resp, body) => {
    if (err) {
      console.log(err)
    }
    if (!err && resp.statusCode === 200) {
      let o = JSON.parse(body)
      if (o.code === 0) {
        let pageNum = o.data.pageCount
        console.log(`当前页数: ${page} 总页数: ${pageNum}`)
        yqwArr = yqwArr.concat(o.data.list)
        console.log('o.data.list.length >> ' + o.data.list.length)
        if (page < pageNum) {
          getYqkList(page + 1, yqwArr)
        } else {
          console.log('yqwArr.length: ' + yqwArr.length)
          fs.writeFileSync(path.join(__dirname, '../douyu/douyu_step_1.json'), JSON.stringify(yqwArr, null, '\t'))
          console.log('数据保存成功')
        }
      }
    }
  })
}

async function getm3u8 (i = 0) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width: 414, height: 736 })
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1')

  var games = fs.readFileSync(path.join(__dirname, '../douyu/douyu_step_1.json'), 'utf8')
  games = JSON.parse(games)

  let o = await getVideoUrl(page, games.slice(0, 30))
  fs.writeFileSync(path.join(__dirname, '../douyu/douyu.json'), JSON.stringify(o, null, '\t'))
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
    // console.log(game)
    // console.log(`https://m.douyu.com/${rid}?type=yqk`)
    // await page.setRequestInterception(true)
    await page.goto(`https://m.douyu.com/${rid}?type=yqk`)
    // await page.waitForSelector('video')
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
    case 'check':
      break
    case 'm3u8':
      break
    default:
      break
  }
}

main()
