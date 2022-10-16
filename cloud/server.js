const http = require('http')
const main = require('.')
const server = http.createServer(async (req, res) => {
  await main()
  res.end()
})
server.listen(9000)
