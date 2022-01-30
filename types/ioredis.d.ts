import 'ioredis'

declare module 'ioredis' {
  interface Commands {
    searchIndex: (key: string, q: string, top: number) => Promise<string[]>
  }
}
