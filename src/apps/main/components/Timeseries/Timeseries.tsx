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
    Table
} from "@chakra-ui/react";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Job, Timeseries, JobParameters } from "../definitions";
import { useServices } from "../../services/Services";

import { ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Ellipsis } from "lucide-react";


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

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const viewLog = async (job: Job) => {
        const log = await getJobLog(selectedTimeseries!.scenario_id, job);
        setModalContent(
            <>
                <Button onClick={(_) => console.log("TODO: handle this button")}>ALL</Button>
                <Button onClick={(_) => console.log("TODO: handle this button")}>DEBUG</Button>
                <Button onClick={(_) => console.log("TODO: handle this button")}>WARNING</Button>
                <Button onClick={(_) => console.log("TODO: handle this button")}>ERROR</Button>
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
            <Code>
                {JSON.stringify(job)}
            </Code>
        );

        setModalContent([content]);
        onOpen();
    };

    const select = (ts: Timeseries) => {
        setSelectedTimeseries(ts);
        onSelect(ts);
    };

    const handleExitClick = () => {
        navigate(0);
    };


    /*

    // Expand TimeSeries 
    const { createJob } = useServices();
    const [expandButtonDisabled, setExpandButtonDisabled] = useState<boolean>(true);

    const [startDate, setStartDate] = useState<Date | null>();
    const [endDate, setEndDate] = useState<Date | null>();
    const [jobParams, setJobParams] = useState<JobParameters>();


    useEffect(() => {
        if (startDate != null && endDate != null) {
            setExpandButtonDisabled(false);
            setJobParams([startDate, endDate]);
        }
        else {
            setExpandButtonDisabled(true);
        }
    }, [startDate, endDate]);

    const createJ = async (buttonType: string) => {
        console.log(`Button clicked: ${buttonType} ${selectedTimeseries?.id}`);

        const created = await createJob(selectedTimeseries!.scenario_id, selectedTimeseries!.id!, jobParams!.timespan!);

        alert("Created Job: " + created);
        handleExitClick();
    };

    */


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
                                    <Text fontWeight="medium" pb="2">Description:</Text>
                                    <Text whiteSpace="pre-wrap" pb="2">{ts.description}</Text>
                                </HStack>

                                <HStack>
                                    <Flex justify="space-between">
                                        <Button size="md" width="35%" bg="#2C7D75" onClick={() => select(ts)}>
                                            View Results
                                        </Button>

                                        <CreateJob timeseries={ts}/>
                                        
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="outline" size="md">
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
                                                            <Table.Cell><Button onClick={() => viewDetails(job)}>Details</Button></Table.Cell>
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

                <CreateTimeseries />

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
