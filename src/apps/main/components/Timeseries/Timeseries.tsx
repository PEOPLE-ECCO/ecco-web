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

import { LuChevronDown } from "react-icons/lu";
import { useState } from "react";
import { Ellipsis } from "lucide-react";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService, Notifier } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Timeseries } from "../definitions";
import { ViewJobDetails } from "./TimeseriesViewJobDialogs";


interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries | undefined) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(false);
    //const tsselectedemitter = new EventEmitter();
    //const events = [];
    //const handletsselection = tsselectedemitter.on("tsselected", (selectts: Timeseries) => observed.push(selectts));

    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const checkJobCount = (ts: Timeseries) => {
        console.log("Check Process start");
        setViewResultsButtonDisabled(false);
        console.log(ts.name);
        onSelect(ts);
        //handletsselection;
        //tsselectedemitter.emit("tsselected", ts);

        if (ts.jobs!.length < 1) {
            console.log("count check");
            setViewResultsButtonDisabled(true);
        };
        console.log("Check Done");
    };

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
                                        onSelect(undefined);
                                        checkJobCount(ts);
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
                                                                        <Menu.Item
                                                                            value="delete"
                                                                            onClick={() => notificationService.notify({
                                                                                title: "Deleted",
                                                                                message: ts.name,
                                                                                level: "info",
                                                                                displayDuration: 5000,
                                                                            })}>
                                                                            Delete</Menu.Item>
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
                                                                            }}>Archive</Menu.Item>
                                                                    </Menu.Content>
                                                                </Menu.Positioner>
                                                            </Portal>
                                                        </Menu.Root>
                                                    </Flex>
                                                    <Collapsible.Content>

                                                        <ViewJobDetails timeseries={ts} />

                                                    </Collapsible.Content>
                                                </Collapsible.Root>
                                            </Accordion.ItemContent>
                                        </Accordion.Item>
                                    ))}
                                </Accordion.Root>

                                <CreateTimeseries />

                            </Stack>
                        </Box>

                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar>
                    <ScrollArea.Thumb />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner />
            </ScrollArea.Root>
        </>
    );
}
