import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
if (typeof window !== "undefined") {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const Errors = {
    1: { message: "EmptyName" },
    2: { message: "NameTooLong" },
    3: { message: "DescriptionTooLong" },
    4: { message: "MessageTooLong" },
    5: { message: "InvalidAmount" },
    6: { message: "ProjectNotFound" },
    7: { message: "NotOwner" },
    8: { message: "ZeroBalance" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Constructor/Initialization Args for the contract's `__constructor` method */
    { xlm_token, platform }, 
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy({ xlm_token, platform }, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAAA1RpcAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABGZyb20AAAATAAAAAAAAAAJpZAAAAAAABgAAAAAAAAAHbWVzc2FnZQAAAAAQAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAAJRW1wdHlOYW1lAAAAAAAAAQAAAAAAAAALTmFtZVRvb0xvbmcAAAAAAgAAAAAAAAASRGVzY3JpcHRpb25Ub29Mb25nAAAAAAADAAAAAAAAAA5NZXNzYWdlVG9vTG9uZwAAAAAABAAAAAAAAAANSW52YWxpZEFtb3VudAAAAAAAAAUAAAAAAAAAD1Byb2plY3ROb3RGb3VuZAAAAAAGAAAAAAAAAAhOb3RPd25lcgAAAAcAAAAAAAAAC1plcm9CYWxhbmNlAAAAAAg=",
            "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAABAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAYAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABM=",
            "AAAAAAAAAAAAAAADdGlwAAAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAB21lc3NhZ2UAAAAAEAAAAAEAAAPpAAAAAgAAAAM=",
            "AAAAAAAAAAAAAAAIZ2V0X3RpcHMAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAGAAAAAQAAA+kAAAPqAAAH0AAAAANUaXAAAAAAAw==",
            "AAAAAAAAAAAAAAAId2l0aGRyYXcAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAYAAAABAAAD6QAAAAIAAAAD",
            "AAAAAAAAAAAAAAALZ2V0X2JhbGFuY2UAAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAABgAAAAEAAAPpAAAACwAAAAM=",
            "AAAAAAAAAAAAAAALZ2V0X3Byb2plY3QAAAAAAQAAAAAAAAACaWQAAAAAAAYAAAABAAAD6QAAB9AAAAAHUHJvamVjdAAAAAAD",
            "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAAAAAAEAAAPqAAAH0AAAAAdQcm9qZWN0AA==",
            "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAACXhsbV90b2tlbgAAAAAAABMAAAAAAAAACHBsYXRmb3JtAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAOY3JlYXRlX3Byb2plY3QAAAAAAAMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAABAAAD6QAAAAYAAAAD"]), options);
        this.options = options;
    }
    fromJSON = {
        tip: (this.txFromJSON),
        get_tips: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        get_balance: (this.txFromJSON),
        get_project: (this.txFromJSON),
        get_projects: (this.txFromJSON),
        create_project: (this.txFromJSON)
    };
}
