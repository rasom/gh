#!/usr/bin/env node

const app = require('./dist/app')

if (process.stdin.isTTY) {
  app.run()
}
