// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Stack,
    Text,
    Menu,
    IconButton,
    Flex,
    Accordion,
    Portal,
    Dialog,
    HStack,
    Button
} from "@chakra-ui/react";

import { useCallback, useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { LuDownload } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";
import { MapModel } from "@open-pioneer/map";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { Job, JobResult, Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { ResultTree } from "./ResultTree";
import { TimeseriesExpandDialog } from "./TimeseriesExpandDialog";
import { Site } from "../../views/Sites/Site/Site";
import { Tooltip } from "../tooltip";
import { ViewDetails, ViewLog } from "./ViewJob";


interface TimeseriesProps {
    map: MapModel
    scenario: Site
    timeseries?: Timeseries[]
    eventListener: EventEmitter<Events>
}


export function TimeseriesItem({ map, scenario, timeseries, eventListener }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(true);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const [timeseriesList, setTimeseriesList] = useState<Timeseries[]>([]);
    const [currentResultForDownload, setCurrentResultForDownload] = useState<JobResult | undefined>(undefined);

    useEffect(() => {
        setTimeseriesList(timeseries || []);
    }, [timeseries]);

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

    const onTimeseriesCreated = (ts: Timeseries | undefined) => {
        if (ts && timeseries) {
            setTimeseriesList(timeseriesList => [...timeseriesList, ts]);
        }
    };

    // listen for updates on the selected job result
    eventListener.on("currentResult", (result: JobResult) => {
        setCurrentResultForDownload(result);
    });

    function downloadCurrentResult() {
        if (!currentResultForDownload)
            return;
        const link = document.createElement("a");
        link.href = currentResultForDownload.href;
        link.download = link.href.split("/").pop() || "download.tiff"; // or a fixed name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                <Stack gap="4">
                    <Text fontWeight="700" fontSize={22}>Timeseries</Text>
                    <Accordion.Root
                        collapsible
                        onValueChange={(e) => {
                            const ts: Timeseries = timeseriesList![e.value[0]!];
                            timeseriesSelection(ts);
                        }}>
                        {timeseriesList?.map((ts, key) => (
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
                                            <Flex pb="2" gap="1" justify="space-between" direction="row">
                                                <Text whiteSpace="pre-wrap" pb="2">{ts.description}</Text>
                                                <Box flex="1" />
                                                <Tooltip content="View Timeseries Details">
                                                    <ViewDetails timeseries={selectedTimeseries}></ViewDetails>
                                                </Tooltip>
                                                <Tooltip content="View Job Logs">
                                                    <ViewLog timeseries={selectedTimeseries}></ViewLog>
                                                </Tooltip>
                                                <MenuContent ts={ts} el={eventListener} />
                                            </Flex>
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
                                            <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                                <Flex>
                                                    <Text fontWeight="bold">Metrics</Text>
                                                    <Box ml="auto"></Box>
                                                    <Tooltip content="Download current result">
                                                        <Button
                                                            color="black"
                                                            _hover={{ bg: "teal.50" }}
                                                            size="xs"
                                                            variant="ghost"
                                                            disabled={!currentResultForDownload}
                                                            onClick={() => { downloadCurrentResult(); }}>
                                                            <LuDownload />
                                                        </Button>
                                                    </Tooltip>
                                                </Flex>
                                                <ResultTree map={map} timeseries={ts} eventListener={eventListener} />
                                            </Box>
                                        </>
                                    }
                                </Accordion.ItemContent>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                    <CreateTimeseries scenario={scenario} eventListener={eventListener} resultCallback={onTimeseriesCreated} />
                </Stack>
            </Box >
        </>
    );
}

interface MenuContentProps {
    ts: Timeseries
    el: EventEmitter<Events>
}

function MenuContent({ ts, el }: MenuContentProps) {
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleExpand = (ts: Timeseries) => {
        console.log("Expand:", ts.id);
    };

    const handleViewJobInfo = (jobs: Job[]) => {
        console.log("JobInfo:", jobs.at(0)!.logs.getItems().at(0));
    };

    const handleDelete = (ts: Timeseries) => {
        console.error(ts.jobs.getItems());
        console.log("Delete:", ts.name);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts.name);
    };

    const initiateDownload = (ts: Timeseries) => {
        const href = import.meta.env.VITE_API_ROOT + "/timeseries/" + ts.id + "/download";

        const link = document.createElement("a");
        link.href = href;
        link.download = `timeseries_${ts.id}_results.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <>
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
                                <Dialog.Trigger >
                                    <Menu.Item
                                        value="expand"
                                        onClick={() => {
                                            handleExpand(ts);
                                        }}>
                                        Expand
                                    </Menu.Item>
                                </Dialog.Trigger>
                                <Menu.Item
                                    value="delete"
                                    disabled
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
                                    disabled
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
                                <Menu.Item
                                    value="download"
                                    onClick={() => {
                                        initiateDownload(ts);
                                        notificationService.notify({
                                            title: "Download initiated",
                                            message: ts.name,
                                            level: "info",
                                            displayDuration: 5000,
                                        });
                                    }}>
                                    Download results
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root >
                
                <TimeseriesExpandDialog timeseries={ts} eventListener={el} />
            </Dialog.Root >
        </>
    );
};