const request = require('request')
const fs = require('fs')
const path = require('path')
function getGames(page=1, gameArr = []) {
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
        fs.writeFileSync(path.join(__dirname, '../data/huya.json'), JSON.stringify(gameArr, null, '\t'))
        console.log('数据保存成功')
        geneList(gameArr)
      }      
    }
  })  
}

function getGameByCache () {
  let data = fs.readFileSync(path.join(__dirname, '../data/huya.json'), 'utf8')
  geneList(JSON.parse(data))
}

function geneList(games) {
  let m3u8Arr = {
    "uuid": "64350b50-a810-4901-b86b-7a5106bdef2c",
    "title": "频道-huya",
    "channels": []
  }
  games.forEach((game) => {
    m3u8Arr.channels.push({
      name: game.introduction,
      url: 'https://aldirect.hls.huya.com' + game.screenshot.substring(game.screenshot.indexOf('com') + 3, game.screenshot.lastIndexOf('/')) + '_1200.m3u8'
    })    
  })
  fs.writeFileSync(path.join(__dirname, '../huya_all.json'), JSON.stringify(m3u8Arr, null, '\t'))  
  console.log('m3u8文件生成完毕')
}

// getGames()
getGameByCache()
