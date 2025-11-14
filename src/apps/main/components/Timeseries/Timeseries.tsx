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
    createTreeCollection,
    TreeView,
    TreeCollection,
    Checkmark,
    useTreeViewNodeContext,
} from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";

import { useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { LuChevronDown, LuDownload, LuFile, LuFolder, LuMap } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Job, JobResult, Timeseries } from "../definitions";
import { ViewJobDetails } from "./TimeseriesViewJobDialogs";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { DownloadAllButton } from "./TimeseriesActions";


interface TimeseriesProps {
    timeseries?: Timeseries[]
    eventListener: EventEmitter<Events>
    jobResults: JobResult[]
    selectedJobResult: number
}

export function TimeseriesItem({ timeseries, eventListener, jobResults, selectedJobResult }: TimeseriesProps) {
    const [viewResultsButtonDisabled, setViewResultsButtonDisabled] = useState<boolean>(false);
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();
    const [jobResultCollection, setJobResultCollection] = useState<TreeCollection<Node> | undefined>();
    const [activeJobs, setActiveJobs] = useState<string[]>([]);

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

    function downloadCurrentResult() {

        const href = jobResults[selectedJobResult]?.href;
        console.log(href);
        if (!href)
            return;

        const link = document.createElement("a");
        link.href = href;
        link.download = href.split("/").pop() || "download.tiff"; // or a fixed name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function downloadAllResults() {

        for (let i = 0; i < jobResults.length; i++) {
            const href = jobResults[i]?.href;
            //console.log(href);
            //console.log(jobResults[i]);
            if (!href)
                return;

            // download each or zip download?

            // const link = document.createElement("a");
            // link.href = href;
            // link.download = href.split("/").pop() || "download.tiff"; // or a fixed name if needed
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);

        }
    }

    interface Node {
        id: string
        name: string
        children?: Job[]
    }

    const JobsTreeCollection = (jobs: Job[]) => {
        const collection = createTreeCollection<Node>({
            nodeToValue: (node) => node.id,
            nodeToString: (node) => node.name,
            rootNode: {
                id: "TS-Jobs",
                name: "Jobs",
                children:
                    jobs
            },
        });
        setJobResultCollection(collection);
        if (!jobResultCollection?.rootNode.children) {
            return;
        }
        for (const job of jobResultCollection!.rootNode!.children!) {
            activeJobs.push(""+job.id);
        }
        console.log("initial active jobs list: ", activeJobs);
    };

    const TreeNodeCheckbox = (props: TreeView.NodeCheckboxProps) => {
        const nodeState = useTreeViewNodeContext();

        const checkActiveJobs = (jobid: string, checked: string | boolean) => {
            if (checked == false) {
                activeJobs.push(jobid);
            }
            else {
                const jobindex = activeJobs.indexOf(jobid);
                if (jobindex !== -1) {
                    activeJobs.splice(jobindex, 1);
                }
            }
            console.log(activeJobs);
        };

        return (
            <TreeView.NodeCheckbox aria-label="check node" {...props}>
                <Switch.Root colorPalette="teal" size="lg" pr="4" 
                    checked={nodeState.checked === false} 
                    onCheckedChange={() => {checkActiveJobs(nodeState.value, nodeState.checked); }}>
                    <Switch.HiddenInput />
                    <Switch.Label />
                    <Switch.Control>
                        <Switch.Thumb >
                            <Switch.ThumbIndicator fallback={<LuMap />}>
                                <LuMap />
                            </Switch.ThumbIndicator>
                        </Switch.Thumb>
                    </Switch.Control>
                </Switch.Root>
            </TreeView.NodeCheckbox>
        );
    };

    
    useEffect(() => {
        if (!selectedTimeseries || !selectedTimeseries!.jobs) {
            return;
        }
        viewDetailsDisabling(selectedTimeseries!);
        JobsTreeCollection(selectedTimeseries.jobs);
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

                                                        <MenuContent ts={ts} el={eventListener} />

                                                    </Flex>

                                                    <Collapsible.Content>
                                                        <Box mt="2" padding="4" borderWidth="1px" rounded="lg">
                                                            <TreeView.Root collection={jobResultCollection!} maxW="md" defaultCheckedValue={[]}>
                                                                <TreeView.Label>Job Results Tree View</TreeView.Label>
                                                                <TreeView.Tree>
                                                                    <TreeView.Node
                                                                        indentGuide={<TreeView.BranchIndentGuide />}
                                                                        render={({ node, nodeState }) =>
                                                                            nodeState.isBranch ? (
                                                                                <TreeView.BranchControl>
                                                                                    <LuFolder />
                                                                                    <TreeView.BranchText>Job {node.id}
                                                                                        : {new Date(node.start_time).toISOString().split("T")[0]}
                                                                                        &nbsp;- {new Date(node.start_time).toISOString().split("T")[1]!.split(".")[0]}
                                                                                    </TreeView.BranchText>
                                                                                    <TreeNodeCheckbox />
                                                                                </TreeView.BranchControl>
                                                                            ) : (
                                                                                <TreeView.Item>
                                                                                    <LuFile />
                                                                                    <TreeView.ItemText>{node.name.split("/")[3]}
                                                                                        <Tooltip content="Download current Result">
                                                                                            <Button
                                                                                                color="black"
                                                                                                _hover={{ bg: "teal.50" }}
                                                                                                size="xs"
                                                                                                variant="ghost"
                                                                                                onClick={downloadCurrentResult}>
                                                                                                <LuDownload />
                                                                                            </Button>
                                                                                        </Tooltip>
                                                                                    </TreeView.ItemText>
                                                                                </TreeView.Item>
                                                                            )
                                                                        }
                                                                    />
                                                                </TreeView.Tree>
                                                            </TreeView.Root>
                                                            <Box mt="4" >
                                                                <DownloadAllButton onDownloadAll={downloadAllResults}></DownloadAllButton>
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


interface MenuContentProps {
    ts: Timeseries
    el: EventEmitter<Events>
}

function MenuContent({ ts, el }: MenuContentProps) {
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
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
                                <ViewJobDetails timeseries={ts} eventListener={el} />
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}