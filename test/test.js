const fs = require('fs')
var htm = fs.readFileSync('./htm.txt', 'utf8')

console.log(htm.length)

const m  = htm.match(/<div class="i_content">(.*?)<\/div>/)

console.log(m)