// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    Text,
    HStack,
    Portal,
    Dialog,
    CloseButton,
    Switch,
    createTreeCollection,
    TreeView,
    Spinner,
    Image
} from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";

import { useState } from "react";
import { LuDownload, LuEye, LuFolder, LuMap } from "react-icons/lu";

import { EventEmitter } from "@open-pioneer/core";

import { Job, JobResult, Node } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { ViewDetails, ViewLog } from "./ViewJob";

import { ReadonlyReactiveArray, watch } from "@conterra/reactivity-core";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";



interface JobTreeProps {
    jobs: ReadonlyReactiveArray<Job>
    eventListener: EventEmitter<Events>
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

export interface TreeNode {
    id: string
    name: string
    children?: JobInTree[]
}


export function JobTree({ jobs, eventListener }: JobTreeProps) {
    const [resultsAvailable, setResultsAvailable] = useState(false);

    const treeCollection = useReactiveSnapshot(
        () => {
            const topLevel = jobs.map<JobInTree>((job) => {
                if (job.state_name == "Failed") {
                    return {
                        job: job,
                        name: job.name,
                        children: [{
                            name: "Job failed: no results available",
                            visible: false,
                            result: {
                                name: "Job failed: no results available",
                                visible: false,
                                filename: "",
                                href: "",
                                job: "",
                                mime: "invalid",
                                type: "invalid",
                            }
                        }]
                    };
                } else {
                    return {
                        job: job,
                        name: job.name,
                        children:
                            job.results.getItems().map<ResultInTree>(jr => {
                                return {
                                    result: jr,
                                    name: jr.filename,
                                    visible: true
                                };
                            })
                    };
                }
            }).getItems();

            return createTreeCollection<Node>({
                nodeToValue: (node) => node.id,
                nodeToString: (node) => node.name,
                rootNode: {
                    id: "TS-Jobs",
                    name: "Jobs",
                    children:
                        topLevel
                },
            });
        },
        [jobs, resultsAvailable]
    );



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
            {treeCollection.rootNode.children.length != 0 && treeCollection.rootNode.children[0].name != undefined &&
                <TreeView.Root collection={treeCollection} maxW="md" defaultCheckedValue={[]}>
                    <TreeView.Tree>
                        <TreeView.Node
                            indentGuide={<TreeView.BranchIndentGuide />}
                            render={({ node, nodeState }) =>
                                nodeState.isBranch ? (
                                    <TreeView.BranchControl>
                                        {node.state_name != "Running" &&
                                            <>
                                                <LuFolder />
                                                <TreeView.BranchText fontWeight="bold">
                                                    Job {node.id}: {node.name}
                                                    {/* {new Date(node.start_time).toISOString().split("T")[0]} */}
                                                    {/* &nbsp;- {new Date(node.start_time).toISOString().split("T")[1]!.split(".")[0]} */}
                                                </TreeView.BranchText>

                                                <TreeView.Item>
                                                    <ViewDetails job={node}></ViewDetails>
                                                    <ViewLog job={node}></ViewLog>
                                                </TreeView.Item>
                                            </>
                                        }
                                    </TreeView.BranchControl>
                                ) : (
                                    <TreeView.Item>
                                        {node.state_name == "Running" &&
                                            <>
                                                <HStack>
                                                    <Spinner size="sm" />
                                                    <Text>New Job Loading...</Text>
                                                </HStack>
                                            </>}
                                        {node.state_name != "Running" && node.type == "invalid" &&
                                            <>
                                                <TreeView.ItemText>{node.name}</TreeView.ItemText>
                                            </>
                                        }
                                        {node.state_name != "Running" && node.type != "invalid" &&
                                            <>
                                                <TreeView.NodeCheckbox pl="2" aria-label="check node">
                                                    <Switch.Root colorPalette="teal" size="md" pr="4"
                                                        checked={nodeState.checked === false}
                                                        onCheckedChange={() => { eventListener.emit("toggleJobWithId", node.filename); }}>
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
                                                <TreeView.ItemText>{node.name.split("/").slice(-1)[0]}
                                                    <Tooltip content="Download current result">
                                                        <Button
                                                            color="black"
                                                            _hover={{ bg: "teal.50" }}
                                                            size="xs"
                                                            variant="ghost"
                                                            onClick={() => { console.log("download: ", node.name); downloadCurrentResult(node.name); }}>
                                                            <LuDownload />
                                                        </Button>
                                                    </Tooltip>
                                                    <Tooltip content="View current result file">

                                                    </Tooltip>
                                                    <Dialog.Root size="xl" scrollBehavior="inside">
                                                        <Dialog.Trigger asChild>
                                                            <Button
                                                                color="black"
                                                                _hover={{ bg: "teal.50" }}
                                                                size="xs"
                                                                variant="ghost">
                                                                <LuEye />
                                                            </Button>
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

                                                </TreeView.ItemText>
                                            </>
                                        }
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