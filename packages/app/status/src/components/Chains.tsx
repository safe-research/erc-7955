import {
  Badge,
  Center,
  Container,
  Image,
  Input,
  Loader,
  Notification,
  Progress,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useState } from "react";
import {
  ChainStatusProvider,
  useChainStatus,
  useChainStatusCounters,
} from "$status/contexts/ChainStatus.tsx";
import { type Chain, useChainList } from "$status/hooks/useChainList.ts";
import { useFilteredList } from "$status/hooks/useFilteredList.ts";

function Summary() {
  const counters = useChainStatusCounters();

  const percent = (key: keyof typeof counters) => {
    return 100 * (counters[key] / counters.total);
  };
  return (
    <Progress.Root size="xxl">
      <Tooltip label={`Deployed: ${counters.deployed}`}>
        <Progress.Section value={percent("deployed")} color="green">
          <Progress.Label>Deployed</Progress.Label>
        </Progress.Section>
      </Tooltip>
      <Tooltip label={`Supported: ${counters.supported}`}>
        <Progress.Section value={percent("supported")} color="cyan">
          <Progress.Label>Supported</Progress.Label>
        </Progress.Section>
      </Tooltip>
      <Tooltip label={`Not supported: ${counters.notsupported}`}>
        <Progress.Section value={percent("notsupported")} color="red">
          <Progress.Label>Not Supported</Progress.Label>
        </Progress.Section>
      </Tooltip>
      <Tooltip label={`Unavailable: ${counters.unavailable}`}>
        <Progress.Section value={percent("unavailable")} color="yellow">
          <Progress.Label>Unavailable</Progress.Label>
        </Progress.Section>
      </Tooltip>
      <Progress.Section value={percent("pending")} color="gray" animated={true}>
        <Progress.Label>&nbsp;</Progress.Label>
      </Progress.Section>
    </Progress.Root>
  );
}

function ChainItem({ chain }: { chain: Chain }) {
  const status = useChainStatus({ chain });

  return (
    <Table.Tr>
      <Table.Td w="xs">
        {chain.icon && (
          <Image
            radius="md"
            h={20}
            w={20}
            src={`https://icons.llamao.fi/icons/chains/rsz_${chain.icon}.jpg`}
          />
        )}
      </Table.Td>
      <Table.Td>
        <Tooltip label={`Chain ID: ${chain.chainId}`}>
          <Text display="inline-block">{chain.name}</Text>
        </Tooltip>
      </Table.Td>
      <Table.Td align="right">
        <Center w={128}>
          {status === "deployed" ? (
            <Badge color="green" w="100%">
              Deployed
            </Badge>
          ) : status === "supported" ? (
            <Badge color="cyan" w="100%">
              Supported
            </Badge>
          ) : status === "notsupported" ? (
            <Badge color="red" w="100%">
              Not Supported
            </Badge>
          ) : status === "unavailable" ? (
            <Badge color="yellow" w="100%">
              Unavailable
            </Badge>
          ) : (
            <Loader size="xs" />
          )}
        </Center>
      </Table.Td>
    </Table.Tr>
  );
}

function FilteredChains({ chains }: { chains: Chain[] }) {
  const [search, setSearch] = useState("");
  const re = new RegExp(search, "i");
  const filtered = useFilteredList({
    list: chains,
    predicate: ({ name }) => !!name.match(re),
    max: 25,
  });

  return (
    <Container size="s" mt="lg">
      <Stack>
        <Input
          placeholder="🔍 Search"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <Table stickyHeader stickyHeaderOffset={60}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Chain</Table.Th>
              <Table.Th w={128} ta="center">
                Status
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((chain) => (
              <ChainItem key={chain.chainId} chain={chain} />
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Container>
  );
}

function Chains() {
  const { data: chains, isLoading, error } = useChainList();

  return (
    <Container>
      {chains && (
        <ChainStatusProvider chains={chains}>
          <Summary />
          <FilteredChains chains={chains} />
        </ChainStatusProvider>
      )}
      {isLoading && (
        <Center>
          <Loader />
        </Center>
      )}
      {error && (
        <Notification
          color="red"
          title="Error loading ChainList"
          withCloseButton={false}
        >
          {error.message ?? "Unknown error."}
        </Notification>
      )}
    </Container>
  );
}

export { Chains };
