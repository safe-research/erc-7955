import { useQuery } from "@tanstack/react-query";
import { bytesToHex, getAddress } from "viem";
import {
  generatePrivateKey,
  privateKeyToAccount,
  signAuthorization,
} from "viem/accounts";
import { call } from "viem/actions";
import { useClient } from "wagmi";

const echo = {
  address: getAddress(`0x${"ee".repeat(20)}`),
  code: "0x363d3d37363df3",
} as const;

function useSupports7702() {
  const client = useClient();

  return useQuery({
    queryKey: ["chain:support:eip-7702", `${client?.chain?.id}`],
    queryFn: async () => {
      if (!client) {
        return null;
      }

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

      try {
        const { data: response } = await call(client, {
          to: address,
          data: message,
          authorizationList: [authorization],
          stateOverride: [echo],
        });
        return response === message;
      } catch {
        return false;
      }
    },
    enabled: !!client,
  });
}

export { useSupports7702 };
