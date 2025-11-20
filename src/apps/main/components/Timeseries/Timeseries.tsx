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
    useTreeViewNodeContext,
    Status,
    Listbox,
    Table,
    createListCollection,
} from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";

import { Key, ReactNode, useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import { LuChevronDown, LuDownload, LuEye, LuFile, LuFolder, LuInfo, LuLogs, LuMap } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { NotificationService } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";

import { CreateTimeseries } from "./TimeseriesCreateDialog";
import { CreateJob } from "./TimeseriesExpandDialog";
import { Item, Job, JobResult, Timeseries, Node } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { DownloadAllButton } from "./TimeseriesActions";
import { useServices } from "../../services/Services";


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

    const { getJobLog } = useServices();
    const [logViewContent, setLogViewContent] = useState<ReactNode>();
    const [detailsContent, setDetailsContent] = useState<ReactNode>();
    const [selectedLogs, setSelectedLogs] = useState<Array<Item>>([]);

    function logLevelcolor(item: Item) {
        if (item.level == 20) {
            return "green.100";
        }
        else if (item.level == 40) {
            return "orange.100";
        }
        else {
            return "red.100";
        }
    };

    const handleExitLogviewClick = () => {
        setLogViewContent([]);
    };


    const viewLog = async (job: Job) => {
        const alllogs = await getJobLog(job);
        const debugs = alllogs.filter((e: { level: number; }) => e.level <= 20);
        const warnings = alllogs.filter((e: { level: number; }) => e.level <= 40 && e.level > 20);
        const errors = alllogs.filter((e: { level: number; }) => e.level > 40);

        setSelectedLogs(alllogs);

        const logTableContent = createListCollection({
            items: [
                { label: "ALL", value: alllogs, bg: "blue.100", color: "black", border: "1px solid black" },
                { label: "DEBUGS", value: debugs, bg: "green.100", color: "black", border: "1px solid black" },
                { label: "WARNINGS", value: warnings, bg: "orange.100", color: "black", border: "1px solid black" },
                { label: "ERRORS", value: errors, bg: "red.100", color: "black", border: "1px solid black" }
            ],
        }
        );

        setLogViewContent(
            <>
                <Box>
                    <HStack pb="4" gap="6">
                        <Text fontSize="md">Backgound coloring: </Text>
                        <Status.Root size="lg">
                            <Status.Indicator border="1px solid black" bg="green.200" />
                            Debug
                        </Status.Root>
                        <Status.Root size="lg">
                            <Status.Indicator border="1px solid black" bg="orange.200" />
                            Warning
                        </Status.Root>
                        <Status.Root size="lg">
                            <Status.Indicator border="1px solid black" bg="red.200" />
                            Error
                        </Status.Root>
                    </HStack>
                </Box>
                <Box>
                    <Listbox.Root
                        collection={logTableContent}
                        orientation="horizontal"
                        maxW="150%"
                        defaultValue={[alllogs]}
                    //selectionMode="multiple"
                    >
                        <Listbox.Label><Text fontSize="md">Filter Levels:</Text></Listbox.Label>
                        <Listbox.Content>
                            {logTableContent.items.map((item) => (
                                <Listbox.Item
                                    item={item}
                                    key={item.value}
                                    flexDirection="row"
                                    alignItems="flex-start"
                                    gap="1">
                                    <Button
                                        bg={item.bg}
                                        width="120px"
                                        color={item.color}
                                        onClick={() => { setSelectedLogs(item.value); }}>
                                        <HStack>
                                            <Box width="70px">{item.label}</Box>
                                            <Box width="30px"><Listbox.ItemIndicator /></Box>
                                        </HStack>
                                    </Button>
                                    <Listbox.ItemText></Listbox.ItemText>
                                </Listbox.Item>
                            ))}
                        </Listbox.Content>
                    </Listbox.Root>
                </Box>
            </>
        );
    };

    const viewDetails = async (job: Job) => {
        const tabledata = Object.entries(job).map(([key, value]) => ({
            key: key,
            value: value
        }));

        const content = (
            <>
                <Table.Root size="md" variant="outline" scrollBehavior="inside">
                    <Table.Header bg="gray.200">
                        <Table.Row>
                            <Table.ColumnHeader>Key</Table.ColumnHeader>
                            <Table.ColumnHeader>Value</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {tabledata.map((item) => (
                            <Table.Row key={item.key}>
                                <Table.Cell>{item.key}</Table.Cell>
                                <Table.Cell>{String(item.value)}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </>
        );

        setDetailsContent([content]);
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

    const JobsTreeCollection = (jobs: Job[]) => {
        for (const job of jobs) {
            if (job.state_name == "Failed") {
                job.children = [{
                    name: "no results available",
                    filename: "",
                    href: "",
                    job: "",
                    type: "invalid"
                }];
            }
        }

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
        
        for (const job of collection!.rootNode!.children!) {
            activeJobs.push("" + job.id);
        }
        console.log("initial active jobs list: ", activeJobs);
    };

    const TreeNodeSwitcher = (props: TreeView.NodeCheckboxProps) => {
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
            <TreeView.NodeCheckbox pl="2" aria-label="check node" {...props}>
                <Switch.Root colorPalette="teal" size="md" pr="4"
                    checked={nodeState.checked === false}
                    onCheckedChange={() => { checkActiveJobs(nodeState.value, nodeState.checked); }}>
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
                                                                onClick={() => JobsTreeCollection(ts.jobs!)}
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
                                                                <TreeView.Tree>
                                                                    <TreeView.Node
                                                                        indentGuide={<TreeView.BranchIndentGuide />}
                                                                        render={({ node, nodeState }) =>
                                                                            nodeState.isBranch ? (
                                                                                <TreeView.BranchControl>
                                                                                    <LuFolder />
                                                                                    <TreeView.BranchText>{node.state_names} Job {node.id}
                                                                                        : {new Date(node.start_time).toISOString().split("T")[0]}
                                                                                        &nbsp;- {new Date(node.start_time).toISOString().split("T")[1]!.split(".")[0]}
                                                                                    </TreeView.BranchText>

                                                                                    <TreeView.Item>
                                                                                        <Dialog.Root size="xl" scrollBehavior="inside">
                                                                                            <Dialog.Trigger asChild>
                                                                                                <Button
                                                                                                    color="black"
                                                                                                    _hover={{ bg: "teal.50" }}
                                                                                                    size="xs"
                                                                                                    variant="ghost"
                                                                                                    onClick={() => viewDetails(node)}>
                                                                                                    <LuInfo />
                                                                                                </Button>
                                                                                            </Dialog.Trigger>
                                                                                            <Portal>
                                                                                                <Dialog.Backdrop />
                                                                                                <Dialog.Positioner>
                                                                                                    <Dialog.Content>
                                                                                                        <Dialog.Header>
                                                                                                            <Dialog.Title>View Details of Job {node.id}</Dialog.Title>
                                                                                                            <Dialog.CloseTrigger asChild>
                                                                                                                <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                                                                            </Dialog.CloseTrigger>
                                                                                                        </Dialog.Header>
                                                                                                        <Dialog.Body>
                                                                                                            {detailsContent}
                                                                                                        </Dialog.Body>
                                                                                                        <Dialog.Footer></Dialog.Footer>
                                                                                                    </Dialog.Content>
                                                                                                </Dialog.Positioner>
                                                                                            </Portal>
                                                                                        </Dialog.Root>

                                                                                        <Dialog.Root size="cover" scrollBehavior="inside">
                                                                                            <Dialog.Trigger asChild>
                                                                                                <Button
                                                                                                    color="black"
                                                                                                    _hover={{ bg: "teal.50" }}
                                                                                                    size="xs"
                                                                                                    variant="ghost"
                                                                                                    onClick={() => viewLog(node)}>
                                                                                                    <LuLogs />
                                                                                                </Button>
                                                                                            </Dialog.Trigger>
                                                                                            <Portal>
                                                                                                <Dialog.Backdrop />
                                                                                                <Dialog.Positioner>
                                                                                                    <Dialog.Content>
                                                                                                        <Dialog.Header>
                                                                                                            <Stack>
                                                                                                                <Box pb="4">
                                                                                                                    <Dialog.Title>View Logs of Job {node.id}</Dialog.Title>
                                                                                                                </Box>
                                                                                                                {logViewContent}
                                                                                                            </Stack>
                                                                                                            <Dialog.CloseTrigger asChild>
                                                                                                                <CloseButton onClick={handleExitLogviewClick} height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                                                                            </Dialog.CloseTrigger>
                                                                                                        </Dialog.Header>
                                                                                                        <Dialog.Body>
                                                                                                            <Table.Root variant="outline">
                                                                                                                <Table.Header bg="gray.200">
                                                                                                                    <Table.Row>
                                                                                                                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                                                                                                                        <Table.ColumnHeader>Level</Table.ColumnHeader>
                                                                                                                        <Table.ColumnHeader>Message</Table.ColumnHeader>
                                                                                                                    </Table.Row>
                                                                                                                </Table.Header>
                                                                                                                <Table.Body>
                                                                                                                    {selectedLogs.map((item: Item, key: Key) => (
                                                                                                                        <Table.Row key={key} bg={logLevelcolor(item)}>
                                                                                                                            <Table.Cell>{item.timestamp}</Table.Cell>
                                                                                                                            <Table.Cell>{item.level}</Table.Cell>
                                                                                                                            <Table.Cell>{item.message}</Table.Cell>
                                                                                                                        </Table.Row>
                                                                                                                    ))}
                                                                                                                </Table.Body>
                                                                                                            </Table.Root>
                                                                                                        </Dialog.Body>
                                                                                                        <Dialog.Footer />
                                                                                                    </Dialog.Content>
                                                                                                </Dialog.Positioner>
                                                                                            </Portal>
                                                                                        </Dialog.Root>

                                                                                    </TreeView.Item>
                                                                                    <TreeNodeSwitcher />
                                                                                </TreeView.BranchControl>
                                                                            ) : (
                                                                                <TreeView.Item>
                                                                                    <LuFile />
                                                                                    <TreeView.ItemText>{node.name.split("/").pop()}
                                                                                        {node.type != "invalid" &&
                                                                                            <>
                                                                                                <Tooltip content="Download current result">
                                                                                                    <Button
                                                                                                        color="black"
                                                                                                        _hover={{ bg: "teal.50" }}
                                                                                                        size="xs"
                                                                                                        variant="ghost"
                                                                                                        onClick={downloadCurrentResult}>
                                                                                                        <LuDownload />
                                                                                                    </Button>
                                                                                                </Tooltip>
                                                                                                <Tooltip content="View current result file">
                                                                                                    <Button
                                                                                                        color="black"
                                                                                                        _hover={{ bg: "teal.50" }}
                                                                                                        size="xs"
                                                                                                        variant="ghost"
                                                                                                        onClick={() => console.log("view")}>
                                                                                                        <LuEye />
                                                                                                    </Button>
                                                                                                </Tooltip>
                                                                                            </>
                                                                                        }
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
        </>
    );
}