// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Collapsible,
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
    Table
} from "@chakra-ui/react";
import { TimeseriesAddBtn } from "./TimeseriesAddBtn";
import { Job, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router";
import { Ellipsis, Plus } from "lucide-react";

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
    const [_, setSelectedTimeseries] = useState<Timeseries>();

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const viewLog = async (job: Job) => {
        const log = await getJobLog("1", job);
        setModalContent(
            <>
                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Time</Table.ColumnHeader>
                            <Table.ColumnHeader>Level</Table.ColumnHeader>
                            <Table.ColumnHeader>Message</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {log.map((item, key) => (
                            <Table.Row key={key}>
                                <Table.Cell>{item.time}</Table.Cell>
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

    const vieDetails = async (job: Job) => {
        const content = (
            <Text>
                ID: {job.id}<br></br>
                Scheduled: {job.scheduleTime}<br></br>
                {job.usage && <>
                    Costs: {job.credits} Credits<br></br>
                    CPU: {job.usage?.cpu.value} {job.usage?.cpu.unit}<br></br>
                    Duration: {job.usage?.duration.value} {job.usage?.duration.unit}<br></br>
                    Memory: {job.usage?.memory.value} {job.usage?.memory.unit}<br></br>
                    SentinelHub: {job.usage?.sentinelhub.value} {job.usage?.sentinelhub.unit}<br></br>
                </>}
            </Text>
        );

        setModalContent([content]);
        onOpen();
    };

    const select = (ts: Timeseries) => {
        setSelectedTimeseries(ts);
        onSelect(ts);
    };


    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
            <Stack gap="4">
                <Text fontWeight="700" fontSize={18}>{title}</Text>
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
                                    <Text fontWeight="medium">Description:</Text>
                                    <Text whiteSpace="pre-wrap">{ts.description}</Text>
                                </HStack>

                                <HStack>
                                    <Flex justify="space-between">
                                        <Button size="sm" bg="#2C7D75" onClick={() => select(ts)}>
                                            View Results
                                        </Button>
                                        <IconButton size="sm" bg="#2C7D75" onClick={() => navigate("timeseries/" + ts.id + "/createJob")}>
                                            Expand Timeseries
                                        </IconButton>
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="outline" size="sm">
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
                                </HStack>
                                <Box>
                                    {ts.jobs &&
                                        <>
                                            <Table.Root>
                                                <Table.Header>Jobs:</Table.Header>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.ColumnHeader>Id</Table.ColumnHeader>
                                                        <Table.ColumnHeader>Details</Table.ColumnHeader>
                                                        <Table.ColumnHeader>Log</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {ts.jobs.map((job) => (
                                                        <Table.Row key={job.id}>
                                                            <Table.Cell>{job.id}</Table.Cell>
                                                            <Table.Cell><Button onClick={() => vieDetails(job)}>Details</Button></Table.Cell>
                                                            <Table.Cell><Button onClick={() => viewLog(job)}>Log</Button></Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </>
                                    }
                                </Box>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

                <TimeseriesAddBtn />

                {modalContent && open &&
                    <Dialog.Root size="full" open={open} onExitComplete={onClose} scrollBehavior="inside">
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title></Dialog.Title>
                                </Dialog.Header>
                                <Dialog.CloseTrigger />
                                <Dialog.Body>
                                    {modalContent}
                                </Dialog.Body>

                                <Dialog.Footer>
                                    <Button colorPalette='blue' mr={3} onClick={onClose}>
                                        Close
                                    </Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>
                }
            </Stack>
        </Box >
    );
}
