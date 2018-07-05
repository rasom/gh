'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var yargs = require('yargs')
exports.run = function () {
  var parsedArgs = yargs
    .command({
      command: 'issue [--list|-l]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: function (argv) {
        console.log('argv', argv)
      }
    })
    .help().argv
  console.log('parsedArgs', parsedArgs)
}
