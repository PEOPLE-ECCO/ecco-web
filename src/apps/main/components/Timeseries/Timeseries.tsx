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
    ScrollArea
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { LuChevronDown } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";

import { JobTree } from "./JobTree";
import { ResultTree } from "./ResultTree";


interface TimeseriesProps {
    timeseries?: Timeseries[]
    eventListener: EventEmitter<Events>
}

export function TimeseriesItem({ timeseries, eventListener }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(true);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();

    useEffect(() => {
        if (!selectedTimeseries || !selectedTimeseries!.jobs) {
            return;
        }
        viewResultsDisabling(selectedTimeseries!);
    }, [selectedTimeseries?.jobs]);

    const timeseriesSelection = (ts: Timeseries) => {
        setViewResultsButtonDisabled(true);
        eventListener.emit("selectedTimeseries", ts);
        setSelectedTimeseries(ts);
    };

    const viewResultsDisabling = (ts: Timeseries) => {
        if (ts?.jobs?.length !== undefined) {
            if (selectedTimeseries?.jobs?.length !== 0) {
                setViewResultsButtonDisabled(false);
            }
        };
    };

    /*
    function downloadAllResults() {
        const downloadLinks = [];
        for (const result of jobResults) {
            if (!result.href)
                return;
            const href = result.href;
            // Add link to List
            downloadLinks.push(href);
        }
        console.log(downloadLinks);

        // zip the list
        // download zip
    }
    */

    return (
        <>
            <ScrollArea.Root maxW="md" h="86vh" variant="hover">
                <ScrollArea.Viewport>
                    <ScrollArea.Content spaceY="4">
                        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
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
                                                {ts.id == selectedTimeseries?.id &&
                                                    <>
                                                        <HStack>
                                                            <Text fontWeight="medium" pb="2">Description:</Text>
                                                            <Text whiteSpace="pre-wrap" pb="2">{ts.description}</Text>
                                                        </HStack>
                                                        {/* {false &&
                                                            <Collapsible.Root>
                                                                <Flex pb="2" gap="1" justify="flex-start" direction="row">
                                                                    <Collapsible.Trigger>
                                                                        <Button
                                                                            size="md"
                                                                            width="100%"
                                                                            bg="#2C7D75"
                                                                            _hover={{ bg: "teal.700" }}
                                                                            disabled={false}>
                                                                            View Jobs
                                                                            <Collapsible.Indicator
                                                                                transition="transform 0.2s"
                                                                                _open={{ transform: "rotate(180deg)" }}>
                                                                                <LuChevronDown />
                                                                            </Collapsible.Indicator>
                                                                        </Button>
                                                                    </Collapsible.Trigger>
                                                                    <CreateJob timeseries={ts} eventListener={eventListener} />
                                                                    <MenuContent ts={ts} el={eventListener} />
                                                                </Flex>
                                                                <Collapsible.Content>
                                                                    <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                                                        <JobTree jobs={ts.jobs} eventListener={eventListener}></JobTree>
                                                                    </Box>
                                                                </Collapsible.Content>
                                                            </Collapsible.Root>
                                                        } */}
                                                        <Collapsible.Root defaultOpen>
                                                            <Flex pb="2" gap="1" justify="flex-start" direction="row">
                                                                <Collapsible.Trigger>
                                                                    <Button
                                                                        size="md"
                                                                        width="100%"
                                                                        bg="#2C7D75"
                                                                        _hover={{ bg: "teal.700" }}
                                                                        disabled={false}>
                                                                        View Results
                                                                        <Collapsible.Indicator
                                                                            transition="transform 0.2s"
                                                                            _open={{ transform: "rotate(180deg)" }}>
                                                                            <LuChevronDown />
                                                                        </Collapsible.Indicator>
                                                                    </Button>
                                                                </Collapsible.Trigger>
                                                                <CreateJob timeseries={ts} eventListener={eventListener} />
                                                                <MenuContent ts={ts} el={eventListener} />
                                                            </Flex>
                                                            <Collapsible.Content>
                                                                <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                                                    <ResultTree timeseries={ts} eventListener={eventListener}></ResultTree>
                                                                </Box>
                                                            </Collapsible.Content>
                                                        </Collapsible.Root>
                                                    </>
                                                }
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

interface MenuContentProps {
    ts: Timeseries
    el: EventEmitter<Events>
}

function MenuContent({ ts }: MenuContentProps) {
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    return (
        <>
            <Menu.Root>
                <Menu.Trigger disabled asChild>
                    <IconButton variant="outline" size="md" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }}>
                        <Ellipsis />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content>
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
            </Menu.Root >
        </>
    );
}