/**
 * Types for the MDS Object used for building
 * interactive MiniDapps based off the MDS JS Library
 *
 */

/*
 * Minima Events that can be listend to
 */

export type MinimaEvents =
  | "inited"
  | "NEWBALANCE"
  | "NEWBLOCK"
  | "MINING"
  | "MINIMALOG"
  | "MAXIMA"
  | "MINING"
  | "MINIMALOG"
  | "MAXIMA"
  | "MDS_TIMER_1HOUR"
  | "MDS_TIMER_10SECONDS"
  | "MDS_SHUTDOWN"

export type BaseEvent<T extends MinimaEvents> = { event: T }
export type MdsOptions = { fileHost: string }

export type MdsForm = {
  getParams: (parameterName: string) => string | null
}

export type EventCallback<T extends BaseEvent<MinimaEvents>> = (msg: T) => void

export type FullEventCallback = EventCallback<BaseEvent<MinimaEvents>>

export type MDS_MAIN_CALLBACK = EventCallback<BaseEvent<MinimaEvents>> | null

export type DefaultCallback = (data: string) => void

export type HTTP_POST_ASYNC = {
  theUrl: string
  params: string
  callback: (msg: string) => void
}

export type Test = HTTP_POST_ASYNC

export type PostMdsFail<T, O, U> = {
  command: T
  params: O
  status: U
}

export type ErrorMsg<T, O, U> = {
  event: "MDSFAIL"
  data: PostMdsFail<T, O, U>
}

/*
 * File operations types for MDS
 */

export type Opts<F extends (...args: any[]) => void> = (
  ...args: Parameters<F>
) => void

export type Operation = (
  folder: string,
  text: string,
  callback: DefaultCallback
) => void

export type CommonOperation = (opt: string, callback: DefaultCallback) => void

export interface FileOpts {
  list: Opts<CommonOperation>
  save: Opts<Operation>
  savebinary: Opts<Operation>
  load: Opts<CommonOperation>
  loadbinary: Opts<CommonOperation>
  delete: Opts<CommonOperation>
  getpath: Opts<CommonOperation>
  makedir: Opts<CommonOperation>
  copy: Opts<Operation>
  move: Opts<Operation>
  download: Opts<CommonOperation>
  upload: Opts<CommonOperation>
  listweb: Opts<CommonOperation>
  copytoweb: Opts<Operation>
  deletefromweb: Opts<CommonOperation>
}

/*
 *  Util types for MDS
 */
export type HexToBase64 = (hex: string) => string
export type Base64ToHex = (base64: string) => string
export type Base64ToArrayBuffer = (base64: string) => ArrayBuffer
export type State = {
  port: number
  data: unknown
}
export type Coin = {
  state: State[]
}
export type StateVariable = (coin: Coin, port: number) => void

export interface UtilOpts {
  hexToBase64: Opts<HexToBase64>
  base64ToHex: Opts<Base64ToHex>
  base64ToArrayBuffer: Opts<Base64ToArrayBuffer>
  getStateVariable: Opts<StateVariable>
}
/** CMD Options for MDS */
export type GeneralCommands =
  | "block"
  | "status"
  | "balance"
  | "checkaddress"
  | "coincheck"
  | "coinimport"
  | "coinimportproof"
  | "cointrack"
  | "consolidate"
  | "getaddress"
  | "hashtest"
  | "history"
  | "keys"
  | "newaddress"
  | "printmmr"
  | "printtree"
  | "quit"
  | "status"
  | "tokencreate"
  | "tokenvalidate"
  | "trace"

/** Helper type for keys command */
type ActionType = { list?: "list"; checkkeys?: "checkkeys"; new?: "new" }
/** Helper type for keys command */
type ExclusiveAction<T extends keyof ActionType> = {
  action: { [K in T]: ActionType[T] } & {
    [K in Exclude<keyof ActionType, T>]?: never
  }
}
/** Show your total balance of Minima and tokens Ex: balance, balance tokenid:0xFED5.. confirmations:10, balance address:0xFF.. */
type BalanceOpts = {
  address?: string
  tokenid?: string
  confirmations?: string
}
/** Check the validity of an address and whether it belongs to your node. Ex: checkaddress address:0xFED... */
type CheckAddressOpts = { address: string }
/** The data of a coin. Can be found using the 'coinexport' command. */
type CoinCheckOpts = { data: string }
/** A coin can then be imported and tracked on another node using the 'coinimport' command. Ex: coinimport data:0x00000. */
type CoinImportOpts = { coinid: string }
/** Import a coin including its MMR proof. Ex: coinimport data:0x00000. */
type CoinImportProofOpts = { coinid: string; track: string }
/**Track a coin to keep its MMR proof up-to-date and know when it becomes spent. Stop tracking to remove it from your relevant coins list. Ex: cointrack enable:true coinid:0xCD34.. */
type CoinTrackOpts = { enable: "true" | "false"; coinid: string }
/** Must have at least 3 coins.
Useful to prevent having many coins of tiny value and to manage the number of coins you are tracking. Optionally set the minimum coin age (in blocks), maximum number of coins, and maximum number of signatures for the transaction*/
type ConsolidatedOpts = {
  tokenid: string
  coinage?: string
  maxcoins?: string
  maxsigs?: string
  burn?: string
  debug?: "true" | "false"
  dryrun?: "true" | "false"
}
/** Check the speed of hashing of this device. Ex: hashtest */
type HashTestOpts = { amount?: string }
/** Return all TxPoW relevant to you. */
type HistoryOpts = { max: string }
/** Get a list of all your public keys or create a new key.*/
type KeysOpts =
  | ExclusiveAction<"list">
  | ExclusiveAction<"new">
  | ExclusiveAction<"checkkeys">
  | { action: undefined }
  | { publickey?: string }
  | null
/** Print a tree representation of the blockchain.*/
type Print_TreeOpts = { depth?: string; cascade?: "true" | "false" }
/** Show the general status for Minima and your node. Optionally clean the RAM.*/
type StatusOpts = { clean?: "true" | "false" }
/** Create (mint) custom tokens or NFTs */
type TokenCreateOpts = {
  name: string
  amount: string
  decimals?: string
  script?: string
  state?: string
  signtoken?: string
  webvalidate?: string
  burn?: string
}
/** Validate the signature and webvalidate link in a token.*/
type TokenValidateOpts = { tokenid: string }
/** Show the message stacks of the internal Minima Engine with optional filter string.*/
type TraceOpts = {
  enable: "true" | "false"
  filter?: string
}

interface CommandOptionsMap {
  block: null
  balance: BalanceOpts
  checkaddress: CheckAddressOpts
  coincheck: CoinCheckOpts
  coinimport: CoinImportOpts
  coinimportproof: CoinImportProofOpts
  cointrack: CoinTrackOpts
  consolidate: ConsolidatedOpts
  getaddress: null
  hashtest: HashTestOpts
  history: HistoryOpts
  keys: KeysOpts
  newaddress: null
  printmmr: null
  printtree: Print_TreeOpts
  quit: null
  status: StatusOpts
  tokencreate: TokenCreateOpts
  tokenvalidate: TokenValidateOpts
  trace: TraceOpts
}

type CommandOptions<C extends GeneralCommands> =
  C extends keyof CommandOptionsMap ? CommandOptionsMap[C] : never

/*
 *  Types for the main MDS Object
 */

export type MDSObj = {
  init: (callback: EventCallback<BaseEvent<MinimaEvents>>) => void
  log: (data: string) => void
  filehost: string
  mainhost: string
  minidappuid: string | null
  logging: boolean
  DEBUG_HOST: string | null
  DEBUG_PORT: number
  DEBUG_MINIDAPPID: string
  form: MdsForm
  notify: (msg: string) => void
  notifycancel: () => void
  cmd: <C extends GeneralCommands>({
    command,
    params,
    callback,
  }: {
    command: C
    params: CommandOptions<C>
    callback: DefaultCallback
  }) => void

  sql: (command: string, callback: DefaultCallback) => void
  dapplink: (
    command: string,

    callback: FullEventCallback
  ) => void
  api: {
    call: (command: string, params: string, callback: FullEventCallback) => void
    reply: (
      dappname: string,
      id: string,
      data: string,
      callback: FullEventCallback
    ) => void
  }
  net: {
    GET: (url: string, callback: FullEventCallback) => void
    POST: (url: string, params: string, callback: FullEventCallback) => void
  }
  keypair: {
    get: (key: any, callback: FullEventCallback) => void
    set: (key: any, value: any, callback: FullEventCallback) => void
  }

  comms: {
    broadcast: (msg: string, callback: FullEventCallback) => void
    solo: (msg: string, callback: FullEventCallback) => void
  }
  file: FileOpts

  util: UtilOpts
}
