import * as fs from 'fs'
import * as userhome from 'userhome'

export const config = JSON.parse(fs.readFileSync(userhome('.gh.json'), { encoding: 'utf8' }))
