'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled (value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected (value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step (result) {
        result.done
          ? resolve(result.value)
          : new P(function (resolve) {
            resolve(result.value)
          }).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb (n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step (op) {
      if (f) throw new TypeError('Generator is already executing.')
      while (_) {
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          ) {
            return t
          }
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var yargs = require('yargs')
var graphql_request_1 = require('graphql-request')
var fs = require('fs')
var userhome = require('userhome')
var simpleGit = require('simple-git/promise')
var lodash_1 = require('lodash')
var git = simpleGit()
// let remoteUser
// let remoteRepo
function initialize () {
  return __awaiter(this, void 0, void 0, function () {
    var isGitRepo, remotes, e_1, e_2, remote, userOrOrg, repo
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3])
          return [4 /* yield */, git.checkIsRepo()]
        case 1:
          isGitRepo = _a.sent()
          return [3 /* break */, 3]
        case 2:
          e_1 = _a.sent()
          throw new Error(
            'Error when checking if current dir is a git repository: ' + e_1
          )
        case 3:
          if (!isGitRepo) {
            throw new Error('Current directory is not a git repo')
          }
          _a.label = 4
        case 4:
          _a.trys.push([4, 6, , 7])
          return [4 /* yield */, git.getRemotes(true)]
        case 5:
          remotes = _a.sent()
          return [3 /* break */, 7]
        case 6:
          e_2 = _a.sent()
          throw new Error(
            'Error when looking up your local git remotes: ' + e_2
          )
        case 7:
          remote = lodash_1.find(remotes, { name: 'origin' }).refs.fetch
          if (!remote || remotes.length === 1) {
            remote = remotes[0].refs.fetch
          }
          userOrOrg = remote.match('github[.]com.(.*)/')[1]
          repo = remote.match(userOrOrg + '/(.*)[.]git')[1]
          console.log('userOrOrg', userOrOrg, repo)
          return [2 /* return */]
      }
    })
  })
}
initialize()
var config = JSON.parse(
  fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' })
)
var client = new graphql_request_1.GraphQLClient(
  'https://api.github.com/graphql',
  {
    headers: {
      Authorization: 'Bearer ' + config.github_token
    }
  }
)
exports.run = function () {
  var parsedArgs = yargs
    .command({
      command: 'issue [--list|-l] [--owner|-o]',
      aliases: ['is'],
      desc: 'List issues from Github repository',
      handler: function (argv) {
        if (argv.l || argv.list) {
          var query =
            'query($owner: String!) {\n            repository(owner:$owner, name:"gh") {\n              issues(last:100, states:OPEN) {\n                edges {\n                  node {\n                    title\n                    url\n                  }\n                }\n              }\n            }\n          }'
          var variables = {
            owner: argv.owner || argv.o
          }
          client.request(query, variables).then(function (data) {
            return console.log('data', data.repository.issues.edges)
          })
          console.log('list')
        }
      }
    })
    .help().argv
  console.log('parsedArgs', parsedArgs)
}
