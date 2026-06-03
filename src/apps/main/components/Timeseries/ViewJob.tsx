// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Button,
    Stack,
    Dialog,
    Portal,
    Text,
    Box,
    Table,
    createListCollection,
    HStack,
    Listbox,
    Status,
    CloseButton,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
    SelectContent,
    SelectItem,
    ListCollection,
    VStack
} from "@chakra-ui/react";

import { LuInfo, LuLogs } from "react-icons/lu";

import { useState, ReactNode, Key, useEffect } from "react";

import { Job, LogLine, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";
import { ReadonlyReactiveArray, watchValue } from "@conterra/reactivity-core";
import { JobInTree } from "./JobTree";
import { Tooltip } from "../tooltip";


export interface ViewLogProps {
    timeseries: Timeseries | undefined
}

export function ViewLog({ timeseries }: ViewLogProps) {
    const [selectedLogs, setSelectedLogs] = useState<Array<LogLine>>();
    const [viewLogVisible, setViewLogVisible] = useState(false);
    const [job, setJob] = useState<Job | undefined>(undefined);
    const [jobNames, setJobNames] = useState<ListCollection<{ label: string; value: string; }> | undefined>(undefined);
    const [selectedJobName, setSelectedJobName] = useState<string[]>([""]);
    const [logs, setLogs] = useState<Array<Array<LogLine>>>([[], [], [], []]);

    watchValue(
        () => [timeseries?.jobs?.find(j => j.name === selectedJobName[0])?.logs?.length],
        () => {
            const job = timeseries?.jobs?.find(j => j.name === selectedJobName[0]) || timeseries?.jobs?.get(0);
            
            if (!job) {
                return;
            }

            const l = timeseries?.jobs?.length || 0;
            
            const names: string[] = [];
            const dates: {[key: string]: string} = {};
            for (let i = 0; i < l; i++) {
                const element = timeseries?.jobs?.get(i);
                if (element?.name) {
                    names.push(element?.name);
                    if (element?.start_time) {
                        dates[element!.name] = element?.start_time;
                    }
                }
                
            }
            const namesCollection = createListCollection({
                items: [...new Set(names)].map(n => {return {label: `${n} - ${dates[n]}`, value: n};}),
            });
            console.log("JOB LENGTH: " + timeseries?.jobs?.length);
            console.log("JOB NAMES: " + [...new Set(names)]);
            setJobNames(namesCollection);
            setSelectedJobName([job.name]);
            
            const alllogs = job!.logs.getItems();
            setLogs(
                [
                    alllogs,
                    alllogs.filter((e: { level: number; }) => e.level <= 20),
                    alllogs.filter((e: { level: number; }) => e.level <= 40 && e.level > 20),
                    alllogs.filter((e: { level: number; }) => e.level > 40)
                ]
            );

            setSelectedLogs(alllogs);
        }
    );

    useEffect(() => {
        if (!selectedJobName) {
            return;
        }
        const job = timeseries?.jobs?.find((j) => j.name === selectedJobName[0]!);
        if (!job) {
            return;
        }
        const alllogs = job!.logs.getItems();
        setLogs(
            [
                alllogs,
                alllogs.filter((e: { level: number; }) => e.level <= 20),
                alllogs.filter((e: { level: number; }) => e.level <= 40 && e.level > 20),
                alllogs.filter((e: { level: number; }) => e.level > 40)
            ]
        );

        setSelectedLogs(alllogs);
    }, [selectedJobName]);

    const filterLevels = createListCollection({
        items: [
            { label: "ALL", value: 0, bg: "blue.100", color: "black", border: "1px solid black" },
            { label: "DEBUGS", value: 1, bg: "green.100", color: "black", border: "1px solid black" },
            { label: "WARNINGS", value: 2, bg: "orange.100", color: "black", border: "1px solid black" },
            { label: "ERRORS", value: 3, bg: "red.100", color: "black", border: "1px solid black" }
        ],
    });


    function logLevelcolor(item: LogLine) {
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

    return (
        <Dialog.Root size="cover" scrollBehavior="inside" open={viewLogVisible}>
            <Dialog.Trigger asChild>
                <Tooltip content="View Job Logs">
                    <Button
                        color="black"
                        _hover={{ bg: "teal.50" }}
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                            setViewLogVisible(!viewLogVisible);
                        }}>
                        <LuLogs />
                    </Button>
                </Tooltip>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <VStack>
                                {jobNames && <SelectRoot
                                    collection={jobNames}
                                    value={selectedJobName}
                                    // 3. Capture the change event and extract the value array
                                    onValueChange={(details) => {
                                        setSelectedJobName(details.value);
                                        
                                        // Execute your actual property update logic here:
                                        const newStatus = details.value[0];
                                        console.log("Updating property to:", newStatus);
                                        }}
                                >
                                    <SelectTrigger>
                                        <SelectValueText placeholder="Select a job state" />
                                    </SelectTrigger>
                                    
                                    <SelectContent
                                        position="absolute"
                                        width="auto"
                                        boxShadow="md"
                                        mt="1"
                                    >
                                    {jobNames.items.map((item) => (
                                        <SelectItem item={item} key={item.value}>
                                        {item.label}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </SelectRoot>
                                }
                                
                                <Stack>
                                    <Box pb="4">
                                        <Dialog.Title>View Logs of Job: {job?.name}</Dialog.Title>
                                    </Box>
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
                                            collection={filterLevels}
                                            orientation="horizontal"
                                            maxW="150%"
                                            defaultValue={["ERRORS"]}
                                        >
                                            <Listbox.Label>
                                                <Text fontSize="md">Filter Levels:</Text>
                                            </Listbox.Label>
                                            <Listbox.Content>
                                                {filterLevels.items.map((item) => (
                                                    <Listbox.Item
                                                        item={item}
                                                        key={item.label}
                                                        flexDirection="row"
                                                        alignItems="flex-start"
                                                        gap="1">
                                                        <Button
                                                            bg={item.bg}
                                                            width="120px"
                                                            color={item.color}
                                                            onClick={() => { logs && logs[item.value] && setSelectedLogs(logs[item.value]); }}>
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

                                </Stack>
                            </VStack>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setViewLogVisible(false)} height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
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
                                    {selectedLogs?.map((item: LogLine, key: Key) => (
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
    );
};

export interface ViewDetailsProps {
    timeseries: Timeseries | undefined
}
export function ViewDetails({ timeseries }: ViewDetailsProps) {
    const [viewDetailsVisible, setViewDetailsVisible] = useState(false);
    
    if (timeseries === undefined) {
        return <></>;
    }
    const props = Object.getOwnPropertyNames(Object.getPrototypeOf(timeseries)).filter(o => "constructor" !== o);
    /* eslint-disable react/prop-types */
    const tabledata = props.filter((p: string) => p !== "jobs").map((p: string) => {
        // Cast the string to a valid type-safe key index
        const key = p as keyof typeof timeseries;
        
        // Grab the reference from the instance
        const valueOrFunction = timeseries[key];
        let evaluatedValue: string;

        if (typeof valueOrFunction === "function") {
            const executableMethod = valueOrFunction as () => unknown;
        
            const tmp = executableMethod.call(timeseries);
            if (typeof(tmp) === "object") {
                evaluatedValue = JSON.stringify(tmp);
            } else {
                evaluatedValue = String(tmp);
            }
        } else {
            if (typeof(valueOrFunction) === "object") {
                evaluatedValue = JSON.stringify(valueOrFunction);
            } else {
                evaluatedValue = String(valueOrFunction);
            }
        }

        return {
            key: p,
            value: evaluatedValue
        };
    });

    const l = timeseries.jobs?.length || 0;
    const jobStrings = [];
    for (let i = 0; i < l; i++) {
        const element = timeseries.jobs?.get(i);
        jobStrings.push(element?.toString());
    }
    tabledata.push({
        key: "jobs",
        value: `[\n${jobStrings.join(",\n")}\n]`
    });

    return (
        <Dialog.Root size="xl" scrollBehavior="inside" open={viewDetailsVisible}>
          <Dialog.Trigger asChild>
                <Tooltip content="View Job Logs">
                    <Button
                        color="black"
                        _hover={{ bg: "teal.50" }}
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                            setViewDetailsVisible(!viewDetailsVisible);
                        }}>
                        <LuInfo />
                    </Button>
                </Tooltip>
            </Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>View Details of Timeseries: {timeseries!.name}</Dialog.Title>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton onClick={() => setViewDetailsVisible(false)} height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} />
                            </Dialog.CloseTrigger>
                        </Dialog.Header>
                        <Dialog.Body>
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
                        </Dialog.Body>
                        <Dialog.Footer />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}