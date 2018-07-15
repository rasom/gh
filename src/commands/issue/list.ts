import { flags } from '@oclif/command'
import Command from '../../base'

export default class List extends Command {
  public static description = 'describe the command here'

  public static flags = {
    help: flags.help({ char: 'h' }),
    name: flags.string({ char: 'n', description: 'name to print' }),
    all: flags.boolean({ char: 'a', description: 'list all issues' }),
  }

  public async run() {
    const { flags } = this.parse(List)

    const name = flags.name || 'world'
    const all = flags.all || ''

    this.log(`hello ${name} from ${this.remoteUser} ok`)
  }
}
