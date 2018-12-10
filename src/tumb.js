const request = require('request')
const path = require('path')

const AUTH_KEY = {
  api_key: 'U6r5496nG2OZXMWbV1F1tjVgGZf9drv6SvbN8FzwcVE5PQLdBe'
}

function fetch(blogId = 'yesge') {  
  let url = `https://api.tumblr.com/v2/blog/${blogId}.tumblr.com/posts/video?api_key=${AUTH_KEY.api_key}`
  console.log('url: ' + url)
  request(url, (err, response, body) => {
    if (err) {
      console.log(err)      
    }
    if (!err && response.statusCode === 200) {
      console.log(body)
    }
  })  
}


function main() {  
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  switch (command) {
    case 'fetch':
      fetch()
      break
    case 'build':
      // getGameByCache()
      break
    case 'check':
      // reCheck()
      break
    case 'm3u8':
      // buildM3U8()
      break
    default:
      break;
  }
}

main()