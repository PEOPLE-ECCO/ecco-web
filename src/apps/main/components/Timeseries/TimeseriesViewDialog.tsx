// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Heading,
    Button,
    Flex,
    Dialog,
    Portal,
    Text,
    Table,
    Code,
    useDisclosure,
    Box
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { useServices } from "../../services/Services";

import { setHeapSnapshotNearHeapLimit } from "v8";
import { CloseButton } from "@chakra-ui/react";

import { useState } from "react";
import { Job, Timeseries } from "../definitions";


interface ViewResultsProps {
    timeseries: Timeseries;
}

export const ViewResults = (props: ViewResultsProps) => {
    const [selectedTimeseries, _] = useState<Timeseries>(props.timeseries);
    const { getJobLog } = useServices();
    const { open, onOpen, onClose } = useDisclosure();
    const [modalContent, setModalContent] = useState<ReactNode>();

    const navigate = useNavigate();
    const handleExitClick = () => {
        navigate(0);
    };

    const viewLog = async (job: Job) => {
        const log = await getJobLog(selectedTimeseries!.id, job);
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


    return (
        <>
            <Dialog.Root size="md" placement="center">
                <Dialog.Trigger asChild>
                    <Button size="md" width="35%" bg="#2C7D75" _hover={{ bg: "teal.700" }}>
                        View Results
                    </Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <Flex gap="4">
                                        <Heading height="12" size="lg" order="1">
                                            View Results
                                        </Heading>
                                    </Flex>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text pb="2" textStyle="lg">Jobs:</Text>
                                <Box>
                                    {selectedTimeseries.jobs &&
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
                                                    {selectedTimeseries.jobs.map((job) => (
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
                            </Dialog.Body>
                            <Dialog.Footer>

                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" onClick={handleExitClick} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

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
                                <Button colorPalette='teal' mr={3} onClick={onClose}>
                                    Close
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Dialog.Root>
            }
        </>
    );
};