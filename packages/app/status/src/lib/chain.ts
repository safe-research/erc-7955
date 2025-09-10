import { factory } from "@safe-research/erc-7955";
import {
  bytesToHex,
  type CallErrorType,
  type Client,
  createClient,
  defineChain,
  fallback,
  getAddress,
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
    if (await isErc7702Supported({ client })) {
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

const echoRequest = (async () => {
  const echo = {
    address: getAddress(`0x${"ee".repeat(20)}`),
    code: "0x363d3d37363df3",
  } as const;

  const privateKey = generatePrivateKey();
  const { address } = privateKeyToAccount(privateKey);
  const authorization = await signAuthorization({
    privateKey,
    chainId: 0,
    address: echo.address,
    nonce: 0,
  });

  const message = bytesToHex(
    new TextEncoder().encode("The wise speak only of what they know."),
  );

  return {
    to: address,
    data: message,
    authorizationList: [authorization],
    stateOverride: [echo],
  };
})();

async function isErc7702Supported({ client }: { client: Client }) {
  try {
    const request = await echoRequest;
    const response = await call(client, request);
    return response.data === request.data;
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

export type { Chain, Status };
export { detectStatus };
