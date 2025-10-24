// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Stack,
    Text,
    Menu,
    IconButton,
    Flex,
    useDisclosure,
    HStack,
    Accordion,
    Portal,
    Dialog,
    Table,
    Collapsible,
    CloseButton,
    Status,
    Listbox,
    createListCollection
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Job, Timeseries, Item } from "../definitions";
import { useServices } from "../../services/Services";

import { ReactNode, useState, useEffect, Key } from "react";
import { Ellipsis, Heading } from "lucide-react";

interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries | undefined) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {
    const { getJobLog } = useServices();
    const { open, onOpen, onClose } = useDisclosure();
    const [modalContent, setModalContent] = useState<ReactNode>();
    const [logViewContent, setLogViewContent] = useState<ReactNode>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const [modalHeading, setModalHeading] = useState<string>("");
    const [selectedLogs, setSelectedLogs] = useState<Array<Item>>([]);
    const [timeseriesOpen, setTimeseriesOpen] = useState<boolean>(false);


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

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    useEffect(() => {
        console.log(selectedLogs);
    }, [selectedLogs]);

    useEffect(() => {
        console.log(timeseriesOpen);
    }, [timeseriesOpen]);



    const viewLog = async (job: Job) => {
        console.log("viewlog start");
        const log = await getJobLog(selectedTimeseries!.scenario_id, job);
        const debugs = log.filter((e: { level: number; }) => e.level <= 20);
        const warnings = log.filter((e: { level: number; }) => e.level <= 40 && e.level > 20);
        const errors = log.filter((e: { level: number; }) => e.level > 40);

        setSelectedLogs(log);

        /*
        const handleSelection = () => {
            if (buttonSelected === "DEBUGS") {
                setSelectedLogs(debugs);
            }
            else if (buttonSelected === "WARNINGS") {
                setSelectedLogs(warnings);
            }
            else if (buttonSelected === "ERRORS") {
                setSelectedLogs(errors);
            }
            else {
                setSelectedLogs(log);
            }
            console.log(selectedLogs);
        };
        */

        const logTableContent = createListCollection({
            items: [
                { label: "ALL", value: log, bg: "blue.100", color: "black", border: "1px solid black" },
                { label: "DEBUGS", value: debugs, bg: "green.100", color: "black", border: "1px solid black", hover: { bg: "teal.50" } },
                { label: "WARNINGS", value: warnings, bg: "orange.100", color: "black", border: "1px solid black" },
                { label: "ERRORS", value: errors, bg: "red.100", color: "black", border: "1px solid black" }
            ],
        }
        );

        console.log("viewlog next set content");

        setLogViewContent(
            <>
                <HStack pb="4" gap="6">
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

                <Listbox.Root
                    collection={logTableContent}
                    //value={[log]}
                    //onValueChange={() => handleSelection()}
                    orientation="horizontal"
                    maxW="xl"
                    pb="4"
                >
                    <Listbox.Label><Text fontSize="md">Filter Levels:</Text></Listbox.Label>
                    <Listbox.Content>
                        {logTableContent.items.map((item) => (
                            <Listbox.Item
                                item={item}
                                key={item.value}
                                flexDirection="row"
                                alignItems="flex-start"
                                gap="2"
                                position="relative">
                                <Button
                                    bg={item.bg}
                                    width="100px"
                                    color={item.color}
                                    onClick={() => { setSelectedLogs(item.value); }}>
                                    {item.label}
                                </Button>
                                <Listbox.ItemText></Listbox.ItemText>
                                <Listbox.ItemIndicator />
                            </Listbox.Item>
                        ))}
                    </Listbox.Content>
                </Listbox.Root>


            </>
        );
    };

    const viewDetails = async (job: Job) => {
        console.log(job);
        const tabledata = Object.entries(job).map(([key, value]) => ({
            key: key,
            value: value
        }));

        const content = (
            <>
                <Table.Root size="lg" variant="outline">
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

        setModalContent([content]);
        setModalHeading("View Job Details");
        onOpen();
    };

    const select = (ts: Timeseries) => {
        console.log(ts.name);
        setSelectedTimeseries(ts);
        onSelect(ts);
        if (timeseriesOpen) {
            deselect(ts);
        }
    };

    const deselect = (ts: Timeseries) => {
        onSelect(undefined);
    };


    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
            <Stack gap="4">
                <Text fontWeight="700" fontSize={22}>Timeseries</Text>
                <Accordion.Root collapsible>
                    {timeseries?.map((ts, key) => (
                        <Accordion.Item value={ts.id} key={key}>
                            <Accordion.ItemTrigger bg="white" display="flex" alignItems="center">
                                <Box as="span" flex="1" textAlign="left" fontWeight="700">
                                    {ts.name}
                                </Box>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent pb={4} bg="white">

                                <HStack>
                                    <Text fontWeight="medium" pb="2">Description:</Text>
                                    <Text whiteSpace="pre-wrap" pb="2">{ts.description}</Text>
                                </HStack>

                                <Collapsible.Root open={timeseriesOpen} onOpenChange={(e) => { setTimeseriesOpen(e.open); select(ts); }}>
                                    <Flex pb="2" gap="1" justify="flex-start" direction="row">
                                        <Collapsible.Trigger>
                                            <Button
                                                size="md"
                                                width="100%"
                                                bg="#2C7D75"
                                                _hover={{ bg: "teal.700" }}
                                                onClick={() => { }}>
                                                View Results
                                                <Collapsible.Indicator
                                                    transition="transform 0.2s"
                                                    _open={{ transform: "rotate(180deg)" }}>
                                                    <LuChevronDown />
                                                </Collapsible.Indicator>
                                            </Button>
                                        </Collapsible.Trigger>

                                        <CreateJob timeseries={ts} />

                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="outline" size="md" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }}>
                                                    <Ellipsis />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content>
                                                        <Menu.Item value="delete" onClick={() => handleDelete(ts)}>Delete</Menu.Item>
                                                        <Menu.Item value="archive" onClick={() => handleArchive(ts)}>Archive</Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Flex>

                                    <Collapsible.Content>
                                        <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                            {ts.jobs &&
                                                <>
                                                    <Table.Root>
                                                        <Table.Header>Job-ID:</Table.Header>
                                                        <Table.Body>
                                                            {ts.jobs.map((job) => (
                                                                <Table.Row key={job.id}>
                                                                    <Table.Cell><Box width="25px"></Box>{job.id}</Table.Cell>
                                                                    <Table.Cell>
                                                                        <Button
                                                                            width="90px"
                                                                            variant="outline"
                                                                            color="black"
                                                                            border="1px solid #2C7D75"
                                                                            _hover={{ bg: "teal.50" }}
                                                                            onClick={() => viewDetails(job)}>
                                                                            Details
                                                                        </Button>
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
                                                                                            <Dialog.Title>
                                                                                                <Dialog.Title>View Logs</Dialog.Title>
                                                                                            </Dialog.Title>
                                                                                        </Dialog.Header>
                                                                                        <Dialog.Body>
                                                                                            {logViewContent}
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
                                                                                            <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
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
                                    </Collapsible.Content>
                                </Collapsible.Root>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

                <CreateTimeseries />

                {modalContent && open &&
                    <Dialog.Root size="xl" open={open} onExitComplete={onClose} scrollBehavior="inside">
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title>{modalHeading}</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.CloseTrigger />
                                <Dialog.Body>
                                    {modalContent}
                                </Dialog.Body>
                                <Dialog.Footer>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} onClick={onClose} />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>
                }
            </Stack>
        </Box >
    );
}
