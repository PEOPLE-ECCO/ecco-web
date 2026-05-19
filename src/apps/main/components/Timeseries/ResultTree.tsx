// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    HStack,
    Portal,
    Dialog,
    CloseButton,
    Switch,
    createTreeCollection,
    TreeView,
    Image,
    VStack
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { LuDownload, LuEye, LuFolder, LuLayers, LuMap, LuMapPinned } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

import { Job, JobResult, Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { MapOpacityControl } from "../Map/MapOpacityControl";
import { MAP_ID } from "../../services";
import { ViewDetails, ViewLog } from "./ViewJob";
import { Tooltip } from "../../components/tooltip";
import { MapModel } from "@open-pioneer/map";


interface ResultTreeProps {
    map: MapModel
    timeseries: Timeseries
    eventListener: EventEmitter<Events>
}

interface ResultType {
    name: string
    type: string
    startMonth: string;
    endMonth: string;
    children?: JobResult[]
}
interface ResultInTree {
    result: JobResult
    name: string
    visible: boolean
}

export interface JobInTree {
    job: Job
    name: string
    children: ResultInTree[]
}

interface ResultMetricMetadata {
    startDate: Date;
    endDate: Date;
}

export interface TreeNode {
    name: string
    children?: ResultType[]
}


export function ResultTree({ map, timeseries, eventListener }: ResultTreeProps) {
    const [expandedResultType, setExpandedResultType] = useState<string>("");
    const [infoViewOpen, setInfoViewOpen] = useState<boolean>(false);

    useEffect(() => {
        eventListener.emit("expandedResultType", expandedResultType!);
    }, [expandedResultType]);
    console.log(timeseries);

    const extractDateFromJob = (job: Job): Date | undefined => {
        if (job.results?.length > 0) {
            if (job.results.get(0)!.id?.length > 10 && job.results.get(0)!.id.includes("_")) {
                return new Date(`${ job.results.get(0)!.id.substring(0, 10)}`);
            }
        }
    };

    const treeCollection = useReactiveSnapshot(
        () => {
            const actualTypes: Record<string, ResultMetricMetadata> = {};

            for (const job of timeseries.jobs?.getItems() || []) {
                for (const result of job.results?.getItems() || []) {
                    const dt = extractDateFromJob(job);
                    if (dt) {
                        if (!actualTypes[result.type]) {
                            actualTypes[result.type] = {
                                startDate: dt,
                                endDate: dt,
                            };
                        } else {
                            actualTypes[result.type]!.startDate = actualTypes[result.type]!.startDate! < dt ? actualTypes[result.type]!.startDate! : dt;
                            actualTypes[result.type]!.endDate = actualTypes[result.type]!.endDate! > dt ? actualTypes[result.type]!.endDate! : dt;
                        }
                    }
                }
            };
            const children: ResultType[] = [];

            for (const at of Object.keys(actualTypes)) {
                const metadata = actualTypes[at];
                children.push(
                    {
                        name: at,
                        type: "result",
                        startMonth: metadata!.startDate.toISOString().slice(0, 7),
                        endMonth: metadata!.endDate.toISOString().slice(0, 7),
                        children: []
                    }
                );
            };

            return createTreeCollection<TreeNode>({
                nodeToValue: (node) => node.name,
                nodeToString: (node) => node.name,
                rootNode: {
                    name: "Results",
                    children: children
                },
            });
        },
        [timeseries, timeseries.jobs]
    );

    /*
    watch(
        () => [jobs.length],
        () => {
            for (const j of jobs) {
                // Cleanup?
                watch(
                    () => [j.results.length],
                    () => {
                        if (j.results.length > 0) {
                            setResultsAvailable(true);
                        }
                    },
                    {
                        immediate: true
                    }
                );
            };
        }
    );
    */

    function downloadCurrentResult(href: string) {
        if (!href)
            return;
        const link = document.createElement("a");
        link.href = href;
        link.download = href.split("/").pop() || "download.tiff"; // or a fixed name if needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <>
            {treeCollection.rootNode.children?.length != 0 && treeCollection.rootNode.children![0]!.name != undefined &&
                <TreeView.Root collection={treeCollection}
                    maxW="md"
                    defaultCheckedValue={[]}
                    expandedValue={[expandedResultType!]}
                    onExpandedChange={(e) => {
                        if (e.expandedValue.length == 0) {
                            setExpandedResultType("");
                        } else {
                            setExpandedResultType(e.focusedValue!);
                        };
                        console.log(expandedResultType);
                        console.log("TODO: close all previously expanded results via Event");
                    }}
                    animateContent>
                    <TreeView.Tree>
                        <TreeView.Node
                            indentGuide={<TreeView.BranchIndentGuide />}
                            render={({ node, nodeState }) =>
                                nodeState.isBranch ? (
                                    <TreeView.BranchControl>
                                        <>
                                            <LuFolder />
                                            <TreeView.BranchText fontWeight="bold">
                                                {node.name}
                                            </TreeView.BranchText>
                                            {/* <TreeView.Item>
                                                <Tooltip content="View legend">
                                                    <Button
                                                        color="black"
                                                        _hover={{ bg: "teal.50" }}
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => { setInfoViewOpen(!infoViewOpen); eventListener.emit("infoViewOpen", !infoViewOpen); }}>
                                                        <LuLayers />
                                                    </Button>
                                                </Tooltip>
                                            </TreeView.Item> */}

                                        </>
                                    </TreeView.BranchControl>
                                ) : (
                                    <TreeView.Item>
                                        <>
                                            <TreeView.ItemText>
                                                {node.type == "meta" &&
                                                    <>
                                                        <HStack>
                                                            <MapOpacityControl map={map} responsibleResultType={node.name} currentResultType={expandedResultType!} eventListener={eventListener}/>
                                                            <Tooltip content="View legend">
                                                                <Button
                                                                    color="black"
                                                                    _hover={{ bg: "teal.50" }}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={() => { setInfoViewOpen(!infoViewOpen); eventListener.emit("infoViewOpen", !infoViewOpen); }}>
                                                                    <LuLayers />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="Zoom back to Extent">
                                                                <Button
                                                                    color="black"
                                                                    _hover={{ bg: "teal.50" }}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={() => { eventListener.emit("zoomBackToExtent"); }}>
                                                                    <LuMapPinned />
                                                                </Button>
                                                            </Tooltip>
                                                        </HStack>
                                                    </>
                                                }
                                                {node.type != "meta" &&
                                                    <VStack>
                                                        <HStack justify="start" width="100%">
                                                            <div>
                                                                {node.name} ({node.startMonth} - {node.endMonth})
                                                            </div>
                                                        </HStack>
                                                        <HStack justify="start" width="100%">
                                                            <TreeView.NodeCheckbox pl="2" aria-label="check node">
                                                                <Switch.Root colorPalette="teal" size="md" pr="4"
                                                                    checked={nodeState.checked === false}
                                                                    onCheckedChange={() => { node.visible.value = !node.visible.value; }}>
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

                                                            <Dialog.Root size="xl" scrollBehavior="inside">
                                                                <Dialog.Trigger asChild>
                                                                    <Tooltip content="View current result file">
                                                                        <Button
                                                                            color="black"
                                                                            _hover={{ bg: "teal.50" }}
                                                                            size="xs"
                                                                            variant="ghost"
                                                                            onClick={() => { console.log("TODO: zoom to layer"); }}
                                                                            disabled={true}
                                                                        >
                                                                            <LuEye />
                                                                        </Button>
                                                                    </Tooltip>
                                                                </Dialog.Trigger>
                                                                <Portal>
                                                                    <Dialog.Backdrop />
                                                                    <Dialog.Positioner>
                                                                        <Dialog.Content>
                                                                            <Dialog.Header>
                                                                                <Dialog.Title>View Result {node.filename}</Dialog.Title>
                                                                                <Dialog.CloseTrigger asChild>
                                                                                    <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                                                                                </Dialog.CloseTrigger>
                                                                            </Dialog.Header>
                                                                            <Dialog.Body>
                                                                                <Image rounded="md" src={node.filename} />
                                                                            </Dialog.Body>
                                                                            <Dialog.Footer />
                                                                        </Dialog.Content>
                                                                    </Dialog.Positioner>
                                                                </Portal>
                                                            </Dialog.Root>
                                                        </HStack>
                                                    </VStack>
                                                }
                                            </TreeView.ItemText>
                                        </>
                                    </TreeView.Item>
                                )
                            }
                        />
                    </TreeView.Tree>
                </TreeView.Root>
            }
        </>
    );
}