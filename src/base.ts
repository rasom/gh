// https://oclif.io/docs/base_class.html

import * as fs from 'fs'
import { GraphQLClient } from 'graphql-request'
import * as userhome from 'userhome'
import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'
import Command, { flags } from '@oclif/command'

const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))

const git = simpleGit()

export default abstract class extends Command {
  public static flags = {
    loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] }),
  }

  public remoteUser
  public remoteRepo
  public client
  public flags = { loglevel: 'minimal' }

  public log(...msg) {
    switch (this.flags.loglevel) {
      case 'warn':
        console.warn(...msg)
        break
      case 'info':
        console.log(...msg)
        break
      case 'debug':
        console.error(...msg)
        break
      default:
        console.log(...msg)
    }
  }

  public async init() {
    try {
      var isGitRepo = await git.checkIsRepo()
    } catch (e) {
      throw new Error(`Error when checking if current dir is a git repository: ${e}`)
    }

    if (!isGitRepo) {
      throw new Error('Current directory is not a git repo')
    }

    this.setFlags()
    this.setupGraphQLClient()
    await this.setUserAndRepo()
  }

  public async catch(err) {
    throw new Error(err)
    // handle any error from the command
  }

  public async finally() {
    // called after run and catch regardless of whether or not the command errored
  }

  private setFlags() {
    const { flags } = this.parse(this.constructor)

    this.flags = flags
  }

  private setupGraphQLClient() {
    const client = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        Authorization: `Bearer ${config.github_token}`,
      },
    })

    this.client = client
  }

  private async setUserAndRepo() {
    try {
      var remotes = await git.getRemotes(true)
    } catch (e) {
      throw new Error(`Error when looking up your local git remotes: ${e}`)
    }

    let remoteOrigin = find(remotes, { name: 'origin' })

    if (!remoteOrigin) {
      throw new Error(
        'No local remote. Try adding one with `git remote add origin your_repo_fetch_url`'
      )
    }

    let remote = remoteOrigin.refs.fetch

    if (!remote || remotes.length === 1) {
      remote = remotes[0].refs.fetch
    }

    this.remoteUser = remote.match('github[.]com.(.*)/')![1]
    this.remoteRepo = remote.match(`${this.remoteUser}/(.*)[.]git`)![1]
  }
}
