// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    HStack,
    Switch,
    createTreeCollection,
    TreeView,
    VStack,
    Box
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { LuMap } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

import { Job, JobResult, Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { MapOpacityControl } from "../Map/MapOpacityControl";
import { MapModel, SimpleLayer } from "@open-pioneer/map";


interface ResultTreeProps {
    map: MapModel
    timeseries: Timeseries
    eventListener: EventEmitter<Events>
}

interface ResultType {
    name: string
    type: string
    startMonth: string
    endMonth: string
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

    // Store all opacity values in a single object keyed by resultType name
    const [opacityValues, setOpacityValues] = useState<Record<string, number>>({
    });

    useEffect(() => {
        eventListener.emit("expandedResultType", {
            name: expandedResultType,
            opacity: opacityValues[expandedResultType] || 100
        });
    }, [expandedResultType]);

    function handleOpacityChange(resultType:string, value: number) {
        setOpacityValues({
            ...opacityValues,
            [resultType]: value
        });

        if (resultType === expandedResultType) {
            const layer = map?.layers.getLayerById("current") as SimpleLayer;
            // eventListener.emit("layerOpacity", layerOpacity);

            if (layer) {
                layer.olLayer.setOpacity(value / 100);
            }
        }
    }

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
                if (!opacityValues[at]) {
                    opacityValues[at] = 100;
                }
                
            };

            setOpacityValues(opacityValues);
            
            // set the first metric type visible
            if (children && children.length > 0 && expandedResultType?.length === 0) {
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
        [timeseries, timeseries.jobs, opacityValues]
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
                        if (e.expandedValue.length === 0) {
                            setExpandedResultType("");
                        } else {
                            setExpandedResultType(e.focusedValue!);
                        };
                        console.log(`onExpandedChange ${expandedResultType}`);
                        console.log("TODO: close all previously expanded results via Event");
                    }}
                    animateContent>
                    <TreeView.Tree>
                        <TreeView.Node

                            indentGuide={<TreeView.BranchIndentGuide />}
                            render={({ node, nodeState }) =>
                                nodeState.isBranch ? (
                                    <TreeView.Branch>
                                        <TreeView.BranchControl>
                                            <>
                                                <Switch.Root colorPalette="teal" size="md" pr="4"
                                                    checked={expandedResultType === node.name}
                                                    
                                                >
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
                                                <Box fontWeight={expandedResultType === node.name ? "bold": "normal"}>{node.name} ({node.startMonth} - {node.endMonth})</Box>

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
                                        <TreeView.BranchText>
                                            <VStack>
                                                <HStack>
                                                    <MapOpacityControl responsibleResultType={node.name} onChange={handleOpacityChange} value={opacityValues[node.name] || 77}/>
                                                </HStack>
                                            </VStack>
                                        </TreeView.BranchText>
                                    </TreeView.Branch>
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