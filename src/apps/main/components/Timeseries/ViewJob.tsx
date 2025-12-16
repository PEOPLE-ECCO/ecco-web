// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    Stack,
    Dialog,
    Portal,
    Text,
    Box,
    Table,
    createListCollection,
    HStack,
    Listbox,
    Status,
    CloseButton
} from "@chakra-ui/react";

import { LuInfo, LuLogs } from "react-icons/lu";

import { useState, ReactNode, Key } from "react";

import { Job, LogLine, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ReadonlyReactiveArray, watchValue } from "@conterra/reactivity-core";
import { JobInTree } from "./JobTree";
import { Tooltip } from "../tooltip";


export interface ViewLogProps {
    job: Job | undefined
}

export function ViewLog({ job }: ViewLogProps) {
    const [selectedLogs, setSelectedLogs] = useState<ReadonlyReactiveArray<LogLine>>();
    const [viewLogVisible, setViewLogVisible] = useState(false);
    const [logs, setLogs] = useState<Array<Array<LogLine>>>([[], [], [], []]);

    watchValue(
        () => [job!.logs.length],
        () => {
            const alllogs = job!.logs.getItems();
            setLogs(
                [
                    alllogs,
                    alllogs.filter((e: { level: number; }) => e.level <= 20),
                    alllogs.filter((e: { level: number; }) => e.level <= 40 && e.level > 20),
                    alllogs.filter((e: { level: number; }) => e.level > 40)
                ]
            );
        }
    );

    const filterLevels = createListCollection({
        items: [
            { label: "ALL", value: 0, bg: "blue.100", color: "black", border: "1px solid black" },
            { label: "DEBUGS", value: 1, bg: "green.100", color: "black", border: "1px solid black" },
            { label: "WARNINGS", value: 2, bg: "orange.100", color: "black", border: "1px solid black" },
            { label: "ERRORS", value: 3, bg: "red.100", color: "black", border: "1px solid black" }
        ],
    });

    function logLevelcolor(item: LogLine) {
        if (item.level == 20) {
            return "green.100";
        }
        else if (item.level == 40) {
            return "orange.100";
        }
        else {
            return "red.100";
        }
    };

    return (
        <Dialog.Root size="cover" scrollBehavior="inside">
            <Dialog.Trigger asChild>
                <Tooltip content="View Job Logs">
                <Button
                    color="black"
                    _hover={{ bg: "teal.50" }}
                    size="xs"
                    variant="ghost"
                    onClick={() => setViewLogVisible(!viewLogVisible)}>
                    <LuLogs />
                </Button>
                </Tooltip>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Stack>
                                <Box pb="4">
                                    <Dialog.Title>View Logs of Job: {job!.name}</Dialog.Title>
                                </Box>
                                <Box>
                                    <HStack pb="4" gap="6">
                                        <Text fontSize="md">Backgound coloring: </Text>
                                        <Status.Root size="lg">
                                            <Status.Indicator border="1px solid black" bg="green.200" />
                                            Debug
                                        </Status.Root>
                                        <Status.Root size="lg">
                                            <Status.Indicator border="1px solid black" bg="orange.200" />
                                            Warning
                                        </Status.Root>
                                        <Status.Root size="lg">
                                            <Status.Indicator border="1px solid black" bg="red.200" />
                                            Error
                                        </Status.Root>
                                    </HStack>
                                </Box>
                                <Box>
                                    <Listbox.Root
                                        collection={filterLevels}
                                        orientation="horizontal"
                                        maxW="150%"
                                        defaultValue={["ERRORS"]}
                                    >
                                        <Listbox.Label><Text fontSize="md">Filter Levels:</Text></Listbox.Label>
                                        <Listbox.Content>
                                            {filterLevels.items.map((item) => (
                                                <Listbox.Item
                                                    item={item}
                                                    key={item.label}
                                                    flexDirection="row"
                                                    alignItems="flex-start"
                                                    gap="1">
                                                    <Button
                                                        bg={item.bg}
                                                        width="120px"
                                                        color={item.color}
                                                        onClick={() => { setSelectedLogs(logs[item.value]); }}>
                                                        <HStack>
                                                            <Box width="70px">{item.label}</Box>
                                                            <Box width="30px"><Listbox.ItemIndicator /></Box>
                                                        </HStack>
                                                    </Button>
                                                    <Listbox.ItemText></Listbox.ItemText>
                                                </Listbox.Item>
                                            ))}
                                        </Listbox.Content>
                                    </Listbox.Root>
                                </Box>

                            </Stack>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setViewLogVisible(false)} height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Table.Root variant="outline">
                                <Table.Header bg="gray.200">
                                    <Table.Row>
                                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                                        <Table.ColumnHeader>Level</Table.ColumnHeader>
                                        <Table.ColumnHeader>Message</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {selectedLogs?.map((item: LogLine, key: Key) => (
                                        <Table.Row key={key} bg={logLevelcolor(item)}>
                                            <Table.Cell>{item.timestamp}</Table.Cell>
                                            <Table.Cell>{item.level}</Table.Cell>
                                            <Table.Cell>{item.message}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Dialog.Body>
                        <Dialog.Footer />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};

export interface ViewDetailsProps {
    job: Job | undefined
}
export function ViewDetails({ job }: ViewDetailsProps) {
    const tabledata = Object.entries(job!).map(([key, value]) => ({
        key: key,
        value: value
    }));

    return (
        <Dialog.Root size="xl" scrollBehavior="inside">
            <Dialog.Trigger asChild>
                <Tooltip content="View Job Details">
                    <Button
                        color="black"
                        _hover={{ bg: "teal.50" }}
                        size="xs"
                        variant="ghost"
                    >
                        <LuInfo />
                    </Button>
                </Tooltip>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>View Details of Job: {job!.name}</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Table.Root size="md" variant="outline" scrollBehavior="inside">
                                <Table.Header bg="gray.200">
                                    <Table.Row>
                                        <Table.ColumnHeader>Key</Table.ColumnHeader>
                                        <Table.ColumnHeader>Value</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {tabledata.map((item) => (
                                        <Table.Row key={item.key}>
                                            <Table.Cell>{item.key}</Table.Cell>
                                            <Table.Cell>{String(item.value)}</Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Dialog.Body>
                        <Dialog.Footer />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}