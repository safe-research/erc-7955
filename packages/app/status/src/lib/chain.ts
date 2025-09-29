import { factory } from "@safe-research/erc-7955";
import {
  type Address,
  bytesToHex,
  type CallErrorType,
  type Client,
  concat,
  createClient,
  defineChain,
  fallback,
  getAddress,
  getContractAddress,
  http,
} from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  signAuthorization,
} from "viem/accounts";
import { call, getCode } from "viem/actions";

interface Chain {
  chainId: number;
  rpc: { url: string }[];
}

type Status = "deployed" | "supported" | "notsupported" | "unavailable";

async function detectStatus({ chainId, rpc }: Chain): Promise<Status> {
  const client = createClientForChain({ chainId, rpc });
  try {
    if (await isErc7955Deployed({ client })) {
      return "deployed";
    }
    if (await isEip7702Supported({ client })) {
      return "supported";
    }
    return "notsupported";
  } catch {
    return "unavailable";
  }
}

function createClientForChain({ chainId, rpc }: Chain) {
  const chain = defineChain({
    id: chainId,
    name: "unknown",
    nativeCurrency: {
      name: "unknown",
      symbol: "UNKN",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [],
      },
    },
  });
  const transport = fallback(
    rpc
      .map(({ url }) => (url.startsWith("https://") ? http(url) : null))
      .filter((transport) => !!transport),
  );
  const client = createClient({
    chain,
    transport,
  });
  return client;
}

async function isErc7955Deployed({ client }: { client: Client }) {
  const bytecode = await getCode(client, factory);
  return bytecode === factory.runtimeCode;
}

async function isEip7702Supported({ client }: { client: Client }) {
  const { request, response } = await eip7702PreferredCall({ client });
  try {
    const { data } = await call(client, request);
    return data === response.data;
  } catch (e) {
    const err = e as CallErrorType;
    switch (err.cause.name) {
      case "HttpRequestError":
      case "TimeoutError":
        throw err;
      default:
        // Any other error means that the node responded, but either didn't like
        // our type `0x4` transaction, so we assume that 7702 is not supported.
        return false;
    }
  }
}

async function eip7702PreferredCall({ client }: { client: Client }) {
  // We have two kinds of `eth_call`s that we can do to detect EIP-7702 support
  // on a chain:
  // 1. Call with a delegation to a known contract (we use CREATE2 deployers
  //    as they are very widely available on chains)
  // 2. Call with a delegation to a state override
  //
  // We prefer 1, as not all RPCs support state overrides. Try to find a
  // deployed contract that we can use.
  const contractCalls = await Promise.all([
    ERC7702_CALLS.safeSingletonFactory,
    ERC7702_CALLS.nicksDeployer,
  ]);
  const contractAddresses = contractCalls.map(
    ({ request }) => request.authorizationList[0],
  );
  const contractCodes = await Promise.all(
    contractAddresses.map((address) => getCode(client, address)),
  );
  for (let i = 0; i < contractCalls.length; i++) {
    if (contractCodes[i] !== undefined) {
      return contractCalls[i];
    }
  }

  // None of the contracts are deployed, so fall back to using a state override.
  return await ERC7702_CALLS.echo;
}

async function eip7702RandomAuthorization(contract: { address: Address }) {
  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  const authorization = await signAuthorization({
    privateKey,
    chainId: 0,
    address: contract.address,
    nonce: 0,
  });

  return { address, authorization };
}

async function eip7702Create2FactoryCall(factory: { address: Address }) {
  const { address, authorization } = await eip7702RandomAuthorization(factory);

  const salt = `0x${"5afe".repeat(16)}` as const;
  // For the bytecode, we just prefix it with `0x00`, which is the opcode for
  // `STOP` and will cause this init code to deploy contracts with empty
  // runtime code. The extra bytes after the `STOP` are just there for adding
  // another easter egg to the project :P.
  const bytecode = bytesToHex(
    new TextEncoder().encode(
      "\0May the wind under the wings bear you where the sun sails and the moon walks.",
    ),
  );
  const create = getContractAddress({
    opcode: "CREATE2",
    from: address,
    salt,
    bytecode,
  });

  return {
    request: {
      to: address,
      data: concat([salt, bytecode]),
      authorizationList: [authorization],
    },
    response: {
      data: create.toLowerCase(),
    },
  };
}

async function eip7702EchoCall() {
  const echo = {
    address: getAddress(`0x${"ee".repeat(20)}`),
    code: "0x363d3d37363df3",
  } as const;

  const { address, authorization } = await eip7702RandomAuthorization(echo);

  const message = bytesToHex(
    new TextEncoder().encode("I am Gandalf, and Gandalf means me."),
  );

  return {
    request: {
      to: address,
      data: message,
      authorizationList: [authorization],
      stateOverride: [echo],
    },
    response: {
      data: message,
    },
  };
}

// Pre-bake some calls for detecting EIP-7702 support as they get used by all
// chains and we don't want to compute signatures and hashes thousands of times.
const ERC7702_CALLS = {
  safeSingletonFactory: eip7702Create2FactoryCall({
    address: "0x914d7Fec6aaC8cd542e72Bca78B30650d45643d7",
  }),
  nicksDeployer: eip7702Create2FactoryCall({
    address: "0x4e59b44847b379578588920cA78FbF26c0B4956C",
  }),
  echo: eip7702EchoCall(),
};

export type { Chain, Status };
export { detectStatus };
