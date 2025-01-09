/* eslint-disable @typescript-eslint/no-extraneous-class */
export enum LogColor {
  Green = '\x1b[32m',
  Red = '\x1b[31m',
  Yellow = '\x1b[33m',
  Blue = '\x1b[34m',
  Magenta = '\x1b[35m',
  Cyan = '\x1b[36m',
  White = '\x1b[37m',
  Black = '\x1b[30m',
  Reset = '\x1b[0m'
}

export class Server {
  public static log(message: any, color: LogColor = LogColor.Yellow): void {
    const timeStamp = new Date().toISOString()
    const colorCode = color
    console.log(`${colorCode}%s${LogColor.Reset}`, timeStamp + ' || ' + message)
  }
}
