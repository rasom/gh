// https://oclif.io/docs/base_class.html

import * as simpleGit from 'simple-git/promise'
import { find } from 'lodash'
import Command, { flags } from '@oclif/command'
import * as fs from 'fs'
import * as userhome from 'userhome'

const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))

const git = simpleGit()

export default abstract class extends Command {
  public static flags = {
    loglevel: flags.string({ options: ['error', 'warn', 'info', 'debug'] }),
    remote: flags.string({
      description: 'Override the default_remote setting in ~/.default.gh.json',
    }),
  }

  public flags
  public remoteUser
  public remoteRepo
  public client

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

    // this.setGlobalFlags()
    const { flags } = this.parse(this.constructor)

    this.flags = flags

    await this.setUserAndRepo()
  }

  public async catch(err) {
    throw new Error(err)
    // handle any error from the command
  }

  public async finally() {
    // called after run and catch regardless of whether or not the command errored
  }

  private setGlobalFlags() {
    // @ts-ignore: need to figure out if this error is benign
    const { flags } = this.parse(this.constructor)

    this.flags = flags
  }

  private async setUserAndRepo() {
    // TODO: add default remote to config https://github.com/node-gh/gh/issues/85
    try {
      var remotesArr = await git.getRemotes(true)
    } catch (e) {
      throw new Error(`Error when looking up your local git remotes: ${e}`)
    }

    const remoteName = this.flags.remote || config.default_remote || 'origin'

    try {
      // @ts-ignore: https://github.com/steveukx/git-js/pull/283
      var remote = find(remotesArr, { name: remoteName }).refs.fetch
    } catch (e) {
      throw new Error(
        `No remote with name: ${remoteName}. Try adding one with \`git remote add origin your_repo_fetch_url\``
      )
    }

    // @ts-ignore: https://github.com/steveukx/git-js/pull/283
    if (remotesArr.length === 1) {
      remote = remotesArr[0].refs.fetch
    }

    this.remoteUser = remote.match('github[.]com.(.*)/')![1]
    this.remoteRepo = remote.match(`${this.remoteUser}/(.*)[.]git`)![1]
    console.log('remote', this.remoteRepo, this.remoteUser)
  }
}
