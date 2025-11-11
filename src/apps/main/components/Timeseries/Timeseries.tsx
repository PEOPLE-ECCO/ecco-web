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
    CloseButton,
    Switch,
} from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";

import { useEffect, useId, useState } from "react";
import { Ellipsis } from "lucide-react";
import { LuChevronDown, LuDownload, LuEye, LuEyeClosed, LuMap } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Job, Timeseries } from "../definitions";
import { ViewJobDetails } from "./TimeseriesViewJobDialogs";
import { time } from "console";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { useServices } from "../../services/Services";
import { useParams } from "react-router";
import { TimeseriesControl } from "./TimeseriesControl";
import { ActionButton } from "./ActionButton";
import { DownloadAllButton } from "./TimeseriesActions";


interface TimeseriesProps {
    timeseries?: Timeseries[];
    eventListener: EventEmitter<Events>;
    onDownloadAll: () => void;
    onDownloadCurrent: () => void;
}

export function TimeseriesItem({ timeseries, eventListener, onDownloadAll, onDownloadCurrent }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(false);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    //const observed: Events["selectedTimeseries"][] = [];
    //eventListener.on("selectedTimeseries", (event) => observed.push(event));

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

    const setJobCheck = (job: Job) => {
        if (job.visible == false || job.visible == undefined) {
            job.visible = true;
            // set Image visible
        }
        else
            job.visible = false;
        // set Image invisible

        console.log(job.id, job.visible);

        return job.visible;
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

                                                        <Dialog.Root size="lg" placement="center">
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
                                                                            <Dialog.Title>View Job Information of Timeseries &quot;{ts.name}&quot;</Dialog.Title>
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
                                                            {selectedTimeseries?.jobs?.map((job) =>
                                                                <>

                                                                    <Switch.Root colorPalette="teal" size="lg" pr="4" checked={job.visible}
                                                                        onCheckedChange={() => { setJobCheck(job); }}>
                                                                        <Switch.HiddenInput />
                                                                        <Switch.Label pr="4">
                                                                            <Text key={job.id}>
                                                                                Job {job.id}
                                                                                : {new Date(job.start_time).toISOString().split("T")[0]}
                                                                                &nbsp;- {new Date(job.start_time).toISOString().split("T")[1]!.split(".")[0]}
                                                                            </Text>
                                                                        </Switch.Label>
                                                                        <Tooltip content="Show Image on Map">
                                                                            <Switch.Control>
                                                                                <Switch.Thumb>
                                                                                    <Switch.ThumbIndicator fallback={<LuMap />}>
                                                                                        <LuMap />
                                                                                    </Switch.ThumbIndicator>
                                                                                </Switch.Thumb>
                                                                            </Switch.Control>
                                                                        </Tooltip>
                                                                    </Switch.Root>

                                                                    <Tooltip content="Download current Result">
                                                                        <Button
                                                                            color="black"
                                                                            _hover={{ bg: "teal.50" }}
                                                                            size="xs"
                                                                            variant="ghost"
                                                                            onClick={onDownloadCurrent}>
                                                                            <LuDownload />
                                                                        </Button>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            <Box mt="4" padding="2">

                                                                <DownloadAllButton onDownloadAll={onDownloadAll}></DownloadAllButton>

                                                            </Box>
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
