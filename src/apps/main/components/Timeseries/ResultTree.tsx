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

    const extractDateFromJobResult = (result: JobResult): Date | undefined => {
        if (result.phenomenonTime) {
            return new Date(result.phenomenonTime);
        }
        else if (result.id?.length > 10 && result.id.includes("_")) {
            return new Date(`${result.id.substring(0, 10)}`);
        }
    };

    const treeCollection = useReactiveSnapshot(
        () => {
            const actualTypes: Record<string, ResultMetricMetadata> = {};

            for (const job of timeseries.jobs?.getItems() || []) {
                for (const result of job.results?.getItems() || []) {
                    const dt = extractDateFromJobResult(result);
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
               const withMeta = [{
                    name: at,
                    type: "meta"
                }] as JobResult[];
                const metadata = actualTypes[at];
                children.push(
                    {
                        name: at,
                        type: at,
                        startMonth: metadata!.startDate.toISOString().slice(0, 7),
                        endMonth: metadata!.endDate.toISOString().slice(0, 7),
                        children: withMeta.concat([])
                    }
                );
            };
            
            // set the first metric type visible
            if (children && children.length > 0) {
                setExpandedResultType(children[0]!.name);
            }

            return createTreeCollection<TreeNode>({
                nodeToValue: (node) => node.name,
                nodeToString: (node) => node.name,
                rootNode: {
                    name: "Metrics",
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
                                            <Switch.Root colorPalette="teal" size="md" pr="4"
                                                checked={expandedResultType === node.name}
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
                                            <TreeView.BranchText fontWeight="bold">
                                                <VStack>
                                                    <div>{node.name} ({node.startMonth} - {node.endMonth})</div>
                                                    <HStack>
                                                        <MapOpacityControl map={map} responsibleResultType={node.name} currentResultType={expandedResultType!} eventListener={eventListener} />

                                                    </HStack>
                                                </VStack>
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
                                    <div/>
                                )
                            }
                        />
                    </TreeView.Tree>
                </TreeView.Root>
            }
        </>
    );
}