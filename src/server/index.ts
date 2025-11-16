import { startService } from './app'

const port = Number(process.argv[2])

startService(isNaN(port) ? 4434 : port)
