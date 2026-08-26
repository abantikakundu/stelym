import { Client, Errors, type Project, type Tip } from "bindings";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";
import type { Result } from "@stellar/stellar-sdk/contract";
import {
  CONTRACT_ID,
  NETWORK_PASSPHRASE,
  RPC_URL,
} from "@/lib/stellar";

type SignTransaction = NonNullable<
  ConstructorParameters<typeof Client>[0]["signTransaction"]
>;

export function createContractClient(
  publicKey?: string,
  signTransaction?: SignTransaction,
): Client {
  return new Client({
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    ...(publicKey ? { publicKey } : {}),
    ...(signTransaction ? { signTransaction } : {}),
  });
}

function unwrapResult<T>(result: Result<T> | T | undefined, fallback: string): T {
  if (result === undefined) {
    throw new Error(fallback);
  }
  if (
    typeof result === "object" &&
    result !== null &&
    "isErr" in result &&
    typeof result.isErr === "function"
  ) {
    const rustResult = result as Result<T>;
    if (rustResult.isErr()) {
      const err = rustResult.unwrapErr();
      throw new Error(err.message || fallback);
    }
    return rustResult.unwrap();
  }
  return result as T;
}

export async function fetchProjects(): Promise<Project[]> {
  const client = createContractClient();
  const tx = await client.get_projects();
  return tx.result ?? [];
}

export async function fetchProject(id: bigint): Promise<Project> {
  const client = createContractClient();
  const tx = await client.get_project({ id });
  return unwrapResult(tx.result, Errors[6].message);
}

export async function fetchBalance(projectId: bigint): Promise<bigint> {
  const client = createContractClient();
  const tx = await client.get_balance({ project_id: projectId });
  return unwrapResult(tx.result, Errors[6].message);
}

export async function fetchTips(projectId: bigint): Promise<Tip[]> {
  const client = createContractClient();
  const tx = await client.get_tips({ project_id: projectId });
  return unwrapResult(tx.result, Errors[6].message);
}

export async function fetchProjectsWithBalances(): Promise<
  Array<Project & { balance: bigint }>
> {
  const projects = await fetchProjects();
  const balances = await Promise.all(projects.map((project) => fetchBalance(project.id)));
  return projects.map((project, index) => ({
    ...project,
    balance: balances[index],
  }));
}

export async function createProject(
  publicKey: string,
  signTransaction: SignTransaction,
  input: { name: string; description: string },
): Promise<bigint> {
  const client = createContractClient(publicKey, signTransaction);
  const tx = await client.create_project({
    owner: publicKey,
    name: input.name,
    description: input.description,
  });
  const sent = await signAndSend(tx);
  return unwrapResult(sent.result, "Failed to create project");
}

export async function sendTip(
  publicKey: string,
  signTransaction: SignTransaction,
  input: { projectId: bigint; amount: bigint; message: string },
): Promise<void> {
  const client = createContractClient(publicKey, signTransaction);
  const tx = await client.tip({
    from: publicKey,
    project_id: input.projectId,
    amount: input.amount,
    message: input.message,
  });
  const sent = await signAndSend(tx);
  unwrapResult(sent.result, "Failed to send tip");
}

export async function withdrawBalance(
  publicKey: string,
  signTransaction: SignTransaction,
  projectId: bigint,
): Promise<void> {
  const client = createContractClient(publicKey, signTransaction);
  const tx = await client.withdraw({
    caller: publicKey,
    project_id: projectId,
  });
  const sent = await signAndSend(tx);
  unwrapResult(sent.result, "Failed to withdraw");
}

async function signAndSend<T>(tx: AssembledTransaction<T>) {
  return tx.signAndSend();
}

export type { Project, Tip };
