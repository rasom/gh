#!/usr/bin/env node

const app = require('./dist/app')

if (process.stdin.isTTY) {
  console.log('process.argv.slice(2)', process.argv.slice(2))
  app.run(process.argv.slice(2))
} else {
  app.runFromPipedData()
}
