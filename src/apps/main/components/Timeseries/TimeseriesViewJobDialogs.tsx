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

import { useState, useEffect, ReactNode, Key } from "react";

import { Item, Job, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";


interface JobProps {
    timeseries: Timeseries;
}

export const ViewJobDetails = (props: JobProps) => {
    const { getJobLog } = useServices();
    const [ logViewContent, setLogViewContent ] = useState<ReactNode>();
    const [ detailsContent, setDetailsContent ] = useState<ReactNode>();
    const [ selectedLogs, setSelectedLogs ] = useState<Array<Item>>([]);

    function logLevelcolor(item: Item) {
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

    const handleExitLogviewClick = () => {
        setLogViewContent([]);
    };


    const viewLog = async (job: Job) => {
        const alllogs = await getJobLog(props.timeseries.scenario_id, job);
        const debugs = alllogs.filter((e: { level: number; }) => e.level <= 20);
        const warnings = alllogs.filter((e: { level: number; }) => e.level <= 40 && e.level > 20);
        const errors = alllogs.filter((e: { level: number; }) => e.level > 40);

        setSelectedLogs(alllogs);

        const logTableContent = createListCollection({
            items: [
                { label: "ALL", value: alllogs, bg: "blue.100", color: "black", border: "1px solid black" },
                { label: "DEBUGS", value: debugs, bg: "green.100", color: "black", border: "1px solid black" },
                { label: "WARNINGS", value: warnings, bg: "orange.100", color: "black", border: "1px solid black" },
                { label: "ERRORS", value: errors, bg: "red.100", color: "black", border: "1px solid black" }
                ],
            }
        );

        setLogViewContent(
            <>
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
                        collection={logTableContent}
                        orientation="horizontal"
                        maxW="150%"
                        //selectionMode="multiple"
                    >
                        <Listbox.Label><Text fontSize="md">Filter Levels:</Text></Listbox.Label>
                        <Listbox.Content>
                            {logTableContent.items.map((item) => (
                                <Listbox.Item
                                    item={item}
                                    key={item.value}
                                    flexDirection="row"
                                    alignItems="flex-start"
                                    gap="1">
                                    <Button
                                        bg={item.bg}
                                        width="120px"
                                        color={item.color}
                                        onClick={() => { setSelectedLogs(item.value); }}>
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
            </>
        );
    };

    const viewDetails = async (job: Job) => {
        const tabledata = Object.entries(job).map(([key, value]) => ({
            key: key,
            value: value
        }));

        const content = (
            <>
                <Table.Root size="md" variant="outline" scrollBehavior="inside">
                    <Table.Header bg="teal.50">
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
            </>
        );

        setDetailsContent([content]);
    };

    return (
        <>
            <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                {props.timeseries.jobs &&
                    <>
                        <Table.Root>
                            <Table.Header>Job-ID:</Table.Header>
                            <Table.Body>
                                {props.timeseries.jobs.map((job) => (
                                    <Table.Row key={job.id}>
                                        <Table.Cell><Box width="25px"></Box>{job.id}</Table.Cell>
                                        <Table.Cell>
                                            <Dialog.Root size="xl" scrollBehavior="inside">
                                                <Dialog.Trigger asChild>
                                                    <Button
                                                        width="90px"
                                                        variant="outline"
                                                        color="black"
                                                        border="1px solid #2C7D75"
                                                        _hover={{ bg: "teal.50" }}
                                                        onClick={() => viewDetails(job)}>
                                                        Details
                                                    </Button>
                                                </Dialog.Trigger>
                                                <Portal>
                                                    <Dialog.Backdrop />
                                                    <Dialog.Positioner>
                                                        <Dialog.Content>
                                                            <Dialog.Header>
                                                                <Stack>
                                                                    <Dialog.Title>View Details</Dialog.Title>
                                                                </Stack>
                                                            </Dialog.Header>
                                                            <Dialog.Body>
                                                                {detailsContent}
                                                            </Dialog.Body>
                                                            <Dialog.Footer></Dialog.Footer>
                                                            <Dialog.CloseTrigger asChild>
                                                                <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                            </Dialog.CloseTrigger>
                                                        </Dialog.Content>
                                                    </Dialog.Positioner>
                                                </Portal>
                                            </Dialog.Root>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Dialog.Root size="cover" scrollBehavior="inside">
                                                <Dialog.Trigger asChild>
                                                    <Button
                                                        width="90px"
                                                        variant="outline"
                                                        color="black"
                                                        border="1px solid #2C7D75"
                                                        _hover={{ bg: "teal.50" }}
                                                        onClick={() => viewLog(job)}>
                                                        Log
                                                    </Button>
                                                </Dialog.Trigger>
                                                <Portal>
                                                    <Dialog.Backdrop />
                                                    <Dialog.Positioner>
                                                        <Dialog.Content>
                                                            <Dialog.Header>
                                                                <Stack>
                                                                    <Box pb="4">
                                                                        <Dialog.Title>View Logs</Dialog.Title>
                                                                    </Box>
                                                                    {logViewContent}
                                                                </Stack>
                                                            </Dialog.Header>
                                                            <Dialog.Body>
                                                                <Table.Root variant="outline">
                                                                    <Table.Caption />
                                                                    <Table.Header>
                                                                        <Table.Row>
                                                                            <Table.ColumnHeader fontWeight={16}>Time</Table.ColumnHeader>
                                                                            <Table.ColumnHeader>Level</Table.ColumnHeader>
                                                                            <Table.ColumnHeader>Message</Table.ColumnHeader>
                                                                        </Table.Row>
                                                                    </Table.Header>
                                                                    <Table.Body>
                                                                        {selectedLogs.map((item: Item, key: Key) => (
                                                                            <Table.Row key={key} bg={logLevelcolor(item)}>
                                                                                <Table.Cell>{item.timestamp}</Table.Cell>
                                                                                <Table.Cell>{item.level}</Table.Cell>
                                                                                <Table.Cell>{item.message}</Table.Cell>
                                                                            </Table.Row>
                                                                        ))}
                                                                    </Table.Body>
                                                                </Table.Root>
                                                            </Dialog.Body>
                                                            <Dialog.Footer></Dialog.Footer>
                                                            <Dialog.CloseTrigger asChild>
                                                                <CloseButton onClick={handleExitLogviewClick} height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                            </Dialog.CloseTrigger>
                                                        </Dialog.Content>
                                                    </Dialog.Positioner>
                                                </Portal>
                                            </Dialog.Root>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </>
                }
            </Box>
        </>
    );
};