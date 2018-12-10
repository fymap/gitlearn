const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

function getGames(page = 1, gameArr = []) {
  let pageSize = 120
  let opts = {
    // url: 'http://www.huya.com/cache.php?m=Game&do=ajaxGetGameLive&gameId=2135&page=1&pageSize=500',
    url: `https://m.huya.com/cache.php?m=Game&do=ajaxGetGameLive&gameId=2135&page=${page}&pageSize=${pageSize}`,
    headers: {
      'cookie': '__yasmid=0.7087910105860618; __yamid_tt1=0.7087910105860618; __yamid_new=C83CB24A56F00001892214B81C00E020; _yasids=__rootsid%3DC83CB24A573000016E467F0756E61A4D; Hm_lvt_3a022a5f11ac1cfb68c9bbffeb894709=1543496529; Hm_lpvt_3a022a5f11ac1cfb68c9bbffeb894709=1543544935',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'zh-CN,zh;q=0.9',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'referer': 'https://m.huya.com/g/2135',
      'authority': 'm.huya.com',
      'x-requested-with': 'XMLHttpRequest'
    }
  }
  request(opts, (err, response, body) => {
    if (err) {
      console.log(err)
    }
    if (!err && response.statusCode === 200) {
      let o = JSON.parse(body)
      let n = o.total % pageSize
      let pageNum = Math.ceil(o.total / pageSize)
      console.log(`当前页数: ${page} 总页数: ${pageNum}`)
      gameArr = gameArr.concat(o.profileList)
      console.log('o.profileList.length >> ' + o.profileList.length)
      if (page < pageNum) {
        getGames(page + 1, gameArr)
      } else {
        console.log('gameArr.length: ' + gameArr.length)
        fs.writeFileSync(path.join(__dirname, '../huya/huya_step_1.json'), JSON.stringify(gameArr, null, '\t'))
        console.log('数据保存成功')
        // geneList(gameArr)
      }
    }
  })
}

function getGameByCache() {
  let data = fs.readFileSync(path.join(__dirname, '../huya/huya_step_1.json'), 'utf8')
  geneList(JSON.parse(data))
}

function geneList(games, savedArr = []) {
  let arr = games.slice(0, 20)
  const promises = arr.map(el => {
    return new Promise((resolve, reject) => {
      request({
        url: 'https://m.huya.com/' + el.profileRoom,
        timeout: 20000,
        headers: {
          'authority': 'm.huya.com',
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
          'cookie': 'guid=7160c3aafeb4005ca94114ed15ed14cd; Hm_lvt_3a022a5f11ac1cfb68c9bbffeb894709=1543496529,1543550526,1543550722,1543551465; Hm_lpvt_3a022a5f11ac1cfb68c9bbffeb894709=1543551465'
        }
      }, (err, response, body) => {
        if (err) {
          console.log(err)
        }
        if (!err && response.statusCode === 200) {
          let $ = cheerio.load(body)
          let link = $('video').attr('src')
          if (link) {
            resolve({
              name: el.introduction,
              profileRoom: el.profileRoom,
              url: 'https:' + link
            })
          } else {
            resolve({
              name: el.introduction,
              profileRoom: el.profileRoom,
              url: 'not found'
            })
          }
        } else {
          resolve({
            name: el.introduction,
            profileRoom: el.profileRoom,
            url: ''
          })
        }
      })
    })
  })
  Promise.all(promises).then(links => {
    savedArr = savedArr.concat(links)
    let arr = games.slice(20)
    console.log('arr.len: ' + arr.length)
    if (arr.length > 0) {
      geneList(arr, savedArr)
    } else {
      fs.writeFileSync(path.join(__dirname, '../huya/huya_step_2.json'), JSON.stringify(savedArr, null, '\t'))
    }
  })
}

function reCheck() {
  var games = fs.readFileSync(path.join(__dirname, '../huya/huya_step_2.json'), 'utf8')
  games = JSON.parse(games)

  let promises = games.map(game => {
    return new Promise((resolve, reject) => {
      if (game.url === '') {    
        console.log('url: ' + 'https://m.huya.com/' + game.profileRoom)    
        request({
          url: 'https://m.huya.com/' + game.profileRoom,
          timeout: 20000,
          headers: {
            'authority': 'm.huya.com',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
            'cookie': 'guid=7160c3aafeb4005ca94114ed15ed14cd; Hm_lvt_3a022a5f11ac1cfb68c9bbffeb894709=1543496529,1543550526,1543550722,1543551465; Hm_lpvt_3a022a5f11ac1cfb68c9bbffeb894709=1543551465'
          }
        }, (err, response, body) => {
          if (err) {
            console.log(err)
          }          
          if (!err && response.statusCode === 200) {
            let $ = cheerio.load(body)
            let link = $('video').attr('src')            
            if (link) {
              game.url = 'https:' + link
              resolve(game)
            } else {
              game.url = 'no link'
              resolve(game)
            }            
          } else {
            reject(err)
          }
        })
      } else {
        resolve(game)
      }
    })
  })
  Promise.all(promises).then(function (games) {
    console.log('个数：' + games.length)
    fs.writeFileSync(path.join(__dirname, '../huya/huya_step_3.json'), JSON.stringify(games, null, '\t'))
  }).catch(reason => {
    console.log('失败原因: ' + reason)
  })
}

function buildM3U8 () {
  var games = fs.readFileSync(path.join(__dirname, '../huya/huya_step_3.json'), 'utf8')
  games = JSON.parse(games)
  var o = {
    "uuid": "64350b50-a810-4901-b86b-7a5106bdef2c",
    "title": "huya_all",
    "channels": []
  }
  var dsj = []
  games.forEach(game => {
    if (game.url !== '' && game.url !== 'not found' && game.url !== 'no link') {
      // console.log(game.name)
      o.channels.push({
        name: game.name.substr(0, 10),
        url: game.url
      })
      dsj.push(game.name + ',' + game.url)
    }
  });
  console.log('个数：' + dsj.length)
  fs.writeFileSync(path.join(__dirname, '../huya_all.json'), JSON.stringify(o, null, '\t'))
  // fs.writeFileSync(path.join(__dirname, '../channel.txt'), dsj.join('\r\n'))
}

function main() {
  // console.log(process.argv)
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  switch (command) {
    case 'fetch':
      getGames()
      break
    case 'build':
      getGameByCache()
      break
    case 'check':
      reCheck()
      break
    case 'm3u8':
      buildM3U8()
      break
    default:
      break;
  }
}

main()



