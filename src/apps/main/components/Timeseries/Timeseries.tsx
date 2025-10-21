// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Code,
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
    Icon,
    Collapsible,
    CloseButton,
    Status
} from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Job, Timeseries, JobParameters, Item } from "../definitions";
import { useServices } from "../../services/Services";

import { ReactNode, useState, useEffect, Key } from "react";
import { useNavigate } from "react-router";
import { Ellipsis, Heading } from "lucide-react";


interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {
    const title = "Timeseries";
    const navigate = useNavigate();

    const { getJobLog } = useServices();
    const { open, onOpen, onClose } = useDisclosure();
    const [modalContent, setModalContent] = useState<ReactNode>();
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const [modalHeading, setModalHeading] = useState<string>("");

    function logLevelcolor(item: Item) {
        if (item.level <= 20) {
            return "green.100";
        }
        else if (item.level <= 40) {
            return "orange.100";
        }
        else {
            return "red.100";
        }
    }

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const viewLog = async (job: Job) => {
        const log = await getJobLog(selectedTimeseries!.scenario_id, job);
        setModalHeading("View Logs");
        setModalContent(
            <>
                <Flex pb="4" gap="4" justify="flex-start" direction="row">
                    <Text>Select: </Text>
                    <Button variant="outline" color="black" border="1px solid black" onClick={(_) => console.log("TODO: handle this button")}>ALL</Button>
                    <Button variant="outline" bg="green.100" color="black" border="1px solid black" onClick={(_) => console.log("TODO: handle this button")}>DEBUG</Button>
                    <Button variant="outline" bg="orange.100" color="black" border="1px solid black" onClick={(_) => console.log("TODO: handle this button")}>WARNING</Button>
                    <Button variant="outline" bg="red.100" color="black" border="1px solid black" onClick={(_) => console.log("TODO: handle this button")}>ERROR</Button>
                </Flex>

                <HStack pb="4" gap="6">
                    <Status.Root colorPalette="green">
                        <Status.Indicator />
                        Debug
                    </Status.Root>
                    <Status.Root colorPalette="orange">
                        <Status.Indicator />
                        Warning
                    </Status.Root>
                    <Status.Root colorPalette="red">
                        <Status.Indicator />
                        Error
                    </Status.Root>
                </HStack>

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
                        {log.map((item: Item, key: Key) => (
                            <Table.Row key={key} bg={logLevelcolor(item)}>
                                <Table.Cell>{item.timestamp}</Table.Cell>
                                <Table.Cell>{item.level}</Table.Cell>
                                <Table.Cell>{item.message}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </>
        );
        onOpen();
    };

    const viewDetails = async (job: Job) => {
        console.log(job);
        const content = (
            <>
                <Heading height="12" size="lg" order="1">
                    Job Details
                </Heading>
                <Text>Here is some JSON info:</Text>
                <Code>
                    {JSON.stringify(job)}
                </Code></>
        );

        setModalContent([content]);
        setModalHeading("View Job Details");
        onOpen();
    };

    const select = (ts: Timeseries) => {
        setSelectedTimeseries(ts);
        onSelect(ts);
    };


    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
            <Stack gap="4">
                <Text fontWeight="700" fontSize={22}>{title}</Text>
                <Accordion.Root collapsible multiple>
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

                                <Collapsible.Root>
                                    <Flex pb="2" justify="space-between" direction="row">
                                        <Collapsible.Trigger>
                                            <Button
                                                size="md"
                                                width="100%"
                                                bg="#2C7D75"
                                                _hover={{ bg: "teal.700" }}
                                                onClick={() => select(ts)}>
                                                View Results
                                                <Collapsible.Indicator
                                                    transition="transform 0.2s"
                                                    _open={{ transform: "rotate(180deg)" }}
                                                >
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
                                                                            onClick={() => viewDetails(job)}
                                                                        >Details</Button>
                                                                    </Table.Cell>
                                                                    <Table.Cell>
                                                                        <Button
                                                                            width="90px"
                                                                            variant="outline"
                                                                            color="black"
                                                                            border="1px solid #2C7D75"
                                                                            _hover={{ bg: "teal.50" }}
                                                                            onClick={() => viewLog(job)}
                                                                        >Log</Button>
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
                    <Dialog.Root size="cover" open={open} onExitComplete={onClose} scrollBehavior="inside">
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
