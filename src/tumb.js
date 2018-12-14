const request = require('request')
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')

const gConfig = {
  api_key: 'U6r5496nG2OZXMWbV1F1tjVgGZf9drv6SvbN8FzwcVE5PQLdBe'
}

function fetch(blogId, offset) {
  return new Promise((resolve, reject) => {
    let url = `https://api.tumblr.com/v2/blog/${blogId}.tumblr.com/posts/video?api_key=${gConfig.api_key}&offset=${offset}&limit=50`
    console.log('url: ' + url)
    request(url, (err, response, body) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        if (response.statusCode === 200) {
          var o = JSON.parse(body)
          if (o.meta.status === 200) {
            resolve({
              total: o.response.total_posts,
              posts: o.response.posts
            })
          } else {
            reject(o.meta.msg)
          }
        } else {
            reject('statusCode: ' + response.statusCode)
        }
      }
    })
  })
}

function fetchAll(blogId, offset = 0, posts = []) {
  console.log(offset + ' len:' + posts.length)
  return fetch(blogId, offset).then(data => {
    posts = posts.concat(data.posts)
    let newOffset = offset + 50
    if (data.total > newOffset) {
      return fetchAll(blogId, newOffset, posts)
    } else {
      return Promise.resolve(posts)
    }
  })
}

function parse(blogId) {
  var data = fs.readFileSync(path.join(__dirname, `../twit/${blogId}.json`), 'utf8')
  var posts = JSON.parse(data)
  var links = new Set()
  posts.forEach(post => {
    var o = {
      date: post.date,
      type: post.type,
      title: post.title || post.source_title || post.summary || post.slug || ''
    }
    if (post.type === 'text') {
      $ = cheerio.load(post.body)
      o.url = $('video source').attr('src')
    } else if (post.type === 'video') {
      o.url = post.video_url
    }
    if (o.url) {
      links.add(o.url)
    }
  })
  console.log('posts.length: ' + posts.length + ' links.size: ' + links.size)

  // fs.writeFileSync(path.join(__dirname, `../twit/${blogId}_parse.json`), JSON.stringify([...links.values()], null, '\t'))
  fs.writeFileSync(path.join(__dirname, `../twit/${blogId}_aria2.txt`), [...links.values()].join('\r\n'))
}


function main() {
  let command = process.argv.length > 2 ? process.argv[2] : 'fetch'
  let blogIds = ['yesge', 'moxiaomei', 'zlsgc', 'gggggg3b0']
  let blogId = blogIds[3]
  switch (command) {
    case 'fetch':
      fetchAll(blogId).then(data => {
        console.log(data.length)
        fs.writeFileSync(path.join(__dirname, `../twit/${blogId}.json`), JSON.stringify(data, null, '\t'))
      })
      break
    case 'parse':
      parse(blogId)
      break
    default:
      break;
  }
}

main()