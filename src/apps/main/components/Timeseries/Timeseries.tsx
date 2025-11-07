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
    HStack,
    Accordion,
    Portal,
    Collapsible,
    ScrollArea,
    Dialog,
    CloseButton
} from "@chakra-ui/react";

import { LuChevronDown } from "react-icons/lu";
import { useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Timeseries } from "../definitions";
import { ViewJobDetails } from "./TimeseriesViewJobDialogs";
import { time } from "console";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { useServices } from "../../services/Services";
import { useParams } from "react-router";


interface TimeseriesProps {
    timeseries?: Timeseries[];
    eventListener: EventEmitter<Events>;
}

export function TimeseriesItem({ timeseries, eventListener }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(false);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const observed: Events["selectedTimeseries"][] = [];
    eventListener.on("selectedTimeseries", (event) => observed.push(event));

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const timeseriesSelection = (ts: Timeseries) => {
        setViewResultsButtonDisabled(true);
        eventListener.emit("selectedTimeseries", ts);
        setSelectedTimeseries(ts);
    };

    const viewDetailsDisabling = (ts: Timeseries) => {
        if (ts?.jobs?.length !== undefined) {
            if (selectedTimeseries?.jobs?.length !== 0) {
                setViewResultsButtonDisabled(false);
            }
        };
    };

    useEffect(() => {
        viewDetailsDisabling(selectedTimeseries!);
    }, [selectedTimeseries?.jobs]);

    return (
        <>
            <ScrollArea.Root maxW="sm" height="47rem" variant="always">
                <ScrollArea.Viewport>
                    <ScrollArea.Content spaceY="4">
                        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
                            <Stack gap="4">
                                <Text fontWeight="700" fontSize={22}>Timeseries</Text>

                                <Accordion.Root
                                    collapsible
                                    onValueChange={(e) => {
                                        const ts: Timeseries = timeseries![e.value[0]!];
                                        timeseriesSelection(ts);
                                    }}>
                                    {timeseries?.map((ts, key) => (
                                        <Accordion.Item value={key} key={key}>
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
                                                    <Flex pb="2" gap="1" justify="flex-start" direction="row">
                                                        <Collapsible.Trigger>
                                                            <Button
                                                                size="md"
                                                                width="100%"
                                                                bg="#2C7D75"
                                                                _hover={{ bg: "teal.700" }}
                                                                disabled={viewResultsButtonDisabled}>
                                                                View Results
                                                                <Collapsible.Indicator
                                                                    transition="transform 0.2s"
                                                                    _open={{ transform: "rotate(180deg)" }}>
                                                                    <LuChevronDown />
                                                                </Collapsible.Indicator>
                                                            </Button>
                                                        </Collapsible.Trigger>

                                                        <CreateJob timeseries={ts} eventListener={eventListener} />

                                                        <Dialog.Root size="sm" placement="center">
                                                            <Menu.Root>
                                                                <Menu.Trigger asChild>
                                                                    <IconButton variant="outline" size="md" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }}>
                                                                        <Ellipsis />
                                                                    </IconButton>
                                                                </Menu.Trigger>
                                                                <Portal>
                                                                    <Menu.Positioner>
                                                                        <Menu.Content>
                                                                            <Dialog.Trigger asChild>
                                                                                <Menu.Item
                                                                                    value="details">
                                                                                    View Jobs
                                                                                </Menu.Item>
                                                                            </Dialog.Trigger>
                                                                            <Menu.Item
                                                                                value="delete"
                                                                                onClick={() => {
                                                                                    handleDelete(ts);
                                                                                    notificationService.notify({
                                                                                        title: "Deleted",
                                                                                        message: ts.name,
                                                                                        level: "info",
                                                                                        displayDuration: 5000,
                                                                                    });
                                                                                }}>
                                                                                Delete
                                                                            </Menu.Item>
                                                                            <Menu.Item
                                                                                value="archive"
                                                                                onClick={() => {
                                                                                    handleArchive(ts);
                                                                                    notificationService.notify({
                                                                                        title: "Archived",
                                                                                        message: ts.name,
                                                                                        level: "info",
                                                                                        displayDuration: 5000,
                                                                                    });
                                                                                }}>
                                                                                Archive
                                                                            </Menu.Item>
                                                                        </Menu.Content>
                                                                    </Menu.Positioner>
                                                                </Portal>
                                                            </Menu.Root>
                                                            <Portal>
                                                                <Dialog.Backdrop />
                                                                <Dialog.Positioner>
                                                                    <Dialog.Content>
                                                                        <Dialog.Header>
                                                                            <Dialog.Title>View Job Information of {ts.name}</Dialog.Title>
                                                                            <Dialog.CloseTrigger asChild>
                                                                                <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                                            </Dialog.CloseTrigger>
                                                                        </Dialog.Header>
                                                                        <Dialog.Body>
                                                                            <ViewJobDetails timeseries={ts} eventListener={eventListener} />
                                                                        </Dialog.Body>
                                                                    </Dialog.Content>
                                                                </Dialog.Positioner>
                                                            </Portal>
                                                        </Dialog.Root>
                                                    </Flex>
                                                    <Collapsible.Content>
                                                        <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                                        <Text>Example Result File</Text>
                                                        </Box>
                                                    </Collapsible.Content>
                                                </Collapsible.Root>
                                            </Accordion.ItemContent>
                                        </Accordion.Item>
                                    ))}
                                </Accordion.Root>

                                <CreateTimeseries eventListener={eventListener} />

                            </Stack>
                        </Box>

                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar>
                    <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner />
            </ScrollArea.Root >
        </>
    );
}
