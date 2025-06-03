// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Box,
    Button,
    Stack,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Flex,
    useDisclosure,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    HStack
} from "@open-pioneer/chakra-integration";
import { FiMoreVertical } from "react-icons/fi";
import { TimeseriesAddBtn } from "./TimeseriesAddBtn";
import { Job, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {
    const title = "Timeseries";
    const navigate = useNavigate();

    const { getJobLog } = useServices();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [log, setLog] = useState<object[]>([]);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const viewLog = async (ts: Timeseries, job: Job) => {
        setLog(await getJobLog("1", job));
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
                <Accordion allowToggle allowMultiple>
                    {timeseries?.map((ts, key) => (
                        <AccordionItem key={key}>
                            <AccordionButton bg="white" display="flex" alignItems="center">
                                <Box as="span" flex="1" textAlign="left" fontWeight="700">
                                    {ts.name}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4} bg="white">
                                <Flex justify="space-between" align="center" mb={1}>
                                    <Text fontWeight="medium">Description:</Text>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<FiMoreVertical />}
                                            variant="ghost"
                                            aria-label="Options"
                                        />
                                        <MenuList>
                                            <MenuItem onClick={() => handleDelete(ts)}>Delete</MenuItem>
                                            <MenuItem onClick={() => handleArchive(ts)}>Archive</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                                <Text mb={4} whiteSpace="pre-wrap">{ts.description}</Text>
                                {ts.jobs &&
                                    <>
                                        <Text mb={4} whiteSpace="pre-wrap"></Text>Jobs:<br></br>
                                        {ts.jobs.map((job, _) => (
                                            <>
                                                <Text key={job.id} mb={4} whiteSpace="pre-wrap">
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
                                                <Button onClick={() => viewLog(ts, job)}>View Log</Button>
                                                {log && isOpen &&
                                                    <Modal size="full" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
                                                        <ModalOverlay />
                                                        <ModalContent>
                                                            <ModalHeader>Log</ModalHeader>
                                                            <ModalCloseButton />
                                                            <ModalBody>
                                                                {log!.map((l) => (
                                                                    <>
                                                                        {l.time}
                                                                        {l.level}
                                                                        {l.message}
                                                                        <br></br>
                                                                    </>
                                                                ))}
                                                            </ModalBody>

                                                            <ModalFooter>
                                                                <Button colorScheme='blue' mr={3} onClick={onClose}>
                                                                    Close
                                                                </Button>
                                                            </ModalFooter>
                                                        </ModalContent>
                                                    </Modal>
                                                }
                                            </>
                                        ))}
                                    </>
                                }

                                <HStack spacing={4}>
                                    <Button onClick={() => navigate("timeseries/" + ts.id + "/createJob")}>Start Processing</Button>

                                    <Button onClick={() => select(ts)}>View Details</Button>
                                </HStack>


                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
                <TimeseriesAddBtn />
            </Stack>
        </Box>
    );
}
