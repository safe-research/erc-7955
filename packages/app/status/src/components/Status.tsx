import { Anchor, AppShell, Group, Text } from "@mantine/core";
import { Chains } from "$status/components/Chains.tsx";

function Status() {
  return (
    <AppShell header={{ height: 60 }} footer={{ height: 42 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md">
          <Text>Are We 7955 Yet?</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Chains />
      </AppShell.Main>
      <AppShell.Footer>
        <Group h="100%" justify="center">
          <Anchor
            target="_blank"
            rel="noopener noreferrer"
            href="https://safe.dev"
          >
            Built by Safe Research
          </Anchor>
          <Text>&nbsp;&hearts;&nbsp;</Text>
          <Anchor
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/safe-research/erc-7955"
          >
            Source on GitHub
          </Anchor>
          <Text>&nbsp;&hearts;&nbsp;</Text>
          <Anchor href={`${import.meta.env.BASE_URL}`}>App</Anchor>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}

export { Status };
