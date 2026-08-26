import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}





export interface Tip {
  amount: i128;
  from: string;
  id: u64;
  message: string;
  project_id: u64;
  timestamp: u64;
}

export const Errors = {
  1: {message:"EmptyName"},
  2: {message:"NameTooLong"},
  3: {message:"DescriptionTooLong"},
  4: {message:"MessageTooLong"},
  5: {message:"InvalidAmount"},
  6: {message:"ProjectNotFound"},
  7: {message:"NotOwner"},
  8: {message:"ZeroBalance"}
}


export interface Project {
  description: string;
  id: u64;
  name: string;
  owner: string;
}

export interface Client {
  /**
   * Construct and simulate a tip transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  tip: ({from, project_id, amount, message}: {from: string, project_id: u64, amount: i128, message: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_tips transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_tips: ({project_id}: {project_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<Tip>>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  withdraw: ({caller, project_id}: {caller: string, project_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_balance: ({project_id}: {project_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a get_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project: ({id}: {id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Project>>>

  /**
   * Construct and simulate a get_projects transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_projects: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Project>>>

  /**
   * Construct and simulate a create_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_project: ({owner, name, description}: {owner: string, name: string, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {xlm_token, platform}: {xlm_token: string, platform: string},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({xlm_token, platform}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAA1RpcAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABGZyb20AAAATAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAHbWVzc2FnZQAAAAAQAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAJRW1wdHlOYW1lAAAAAAAAAQAAAAAAAAALTmFtZVRvb0xvbmcAAAAAAgAAAAAAAAASRGVzY3JpcHRpb25Ub29Mb25nAAAAAAADAAAAAAAAAA5NZXNzYWdlVG9vTG9uZwAAAAAABAAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAUAAAAAAAAAD1Byb2plY3ROb3RGb3VuZAAAAAAGAAAAAAAAAAhOb3RPd25lcgAAAAcAAAAAAAAAC1plcm9CYWxhbmNlAAAAAAg=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAABAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAYAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABM=",
        "AAAAAAAAAAAAAAADdGlwAAAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAB21lc3NhZ2UAAAAAEAAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAAAAAAAIZ2V0X3RpcHMAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAA+kAAAPqAAAH0AAAAANUaXAAAAAAAw==",
        "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAPpAAAACwAAAAM=",
        "AAAAAAAAAAAAAAALZ2V0X3Byb2plY3QAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAD6QAAB9AAAAAHUHJvamVjdAAAAAAD",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAAAAAAEAAAPqAAAH0AAAAAdQcm9qZWN0AA==",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAACXhsbV90b2tlbgAAAAAAABMAAAAAAAAACHBsYXRmb3JtAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAOY3JlYXRlX3Byb2plY3QAAAAAAAMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAABAAAD6QAAAAYAAAAD" ]),
      options
    )
  }
  public readonly fromJSON = {
    tip: this.txFromJSON<Result<void>>,
        get_tips: this.txFromJSON<Result<Array<Tip>>>,
        withdraw: this.txFromJSON<Result<void>>,
        get_balance: this.txFromJSON<Result<i128>>,
        get_project: this.txFromJSON<Result<Project>>,
        get_projects: this.txFromJSON<Array<Project>>,
        create_project: this.txFromJSON<Result<u64>>
  }
}