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

import { LuDownload, LuEye, LuFolder, LuLayers, LuMap, LuMapPinned } from "react-icons/lu";
import { useState } from "react";

import { EventEmitter } from "@open-pioneer/core";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

import { Job, JobResult, Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { MapOpacityControl } from "../Map/MapOpacityControl";
import { ViewDetails, ViewLog } from "./ViewJob";
import { MAP_ID } from "../../services";
import { Tooltip } from "../tooltip";


interface ResultTreeProps {
    timeseries: Timeseries
    eventListener: EventEmitter<Events>
}

interface ResultType {
    name: string
    type: string
    children?: JobResult[]
}
interface ResultInTree {
    result: JobResult
    name: string
    visibleinoverview: boolean
}

export interface JobInTree {
    job: Job
    name: string
    children: ResultInTree[]
}

export interface TreeNode {
    name: string
    children?: ResultType[]
}

// export interface OverviewNode {
//     name: string
//     children?: TreeNode[]
// }


export function ResultTreeOverview({ timeseries, eventListener }: ResultTreeProps) {
    const [infoViewOpen, setInfoViewOpen] = useState<boolean>(false);

    const treeCollection = useReactiveSnapshot(
        () => {
            const children = [];
            for (const [type, results] of timeseries.results.value.entries()) {
                const withMeta = [{
                    name: "name",
                    type: "meta"
                }] as JobResult[];
                children.push(
                    {
                        name: type,
                        type: type,
                        children: withMeta.concat(results)
                    }
                );
            };

            return createTreeCollection<TreeNode>({
                nodeToValue: (node) => node.name,
                nodeToString: (node) => node.name,
                rootNode: {
                    name: "Results",
                    children: children 
                    // [
                    // {
                    //     name: "Timeseries",
                    //     children: children
                    // }
                    // ]
                },
            });
        },
        [timeseries, timeseries.results]
    );

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
                                        </>
                                    </TreeView.BranchControl>
                                ) : (
                                    <TreeView.Item>
                                        <>
                                            <TreeView.ItemText>
                                                {node.type == "meta" &&
                                                    <>
                                                        <HStack>
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
                                                        {node.name}
                                                        <HStack>
                                                            <TreeView.NodeCheckbox pl="2" aria-label="check node">
                                                                <Switch.Root colorPalette="teal" size="md" pr="4"
                                                                    checked={nodeState.checked === false}
                                                                    onCheckedChange={() => { node.visibleinoverview.value = !node.visibleinoverview.value; }}>
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

                                                            <Tooltip content="Download current result">
                                                                <Button
                                                                    color="black"
                                                                    _hover={{ bg: "teal.50" }}
                                                                    size="xs"
                                                                    variant="ghost"
                                                                    onClick={() => { downloadCurrentResult(node.name); }}>
                                                                    <LuDownload />
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip content="View Job Details">
                                                                <ViewDetails job={timeseries.jobs.get(0)}></ViewDetails>
                                                            </Tooltip>
                                                            <Tooltip content="View Job Logs">
                                                                <ViewLog job={timeseries.jobs.get(0)}></ViewLog>
                                                            </Tooltip>

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