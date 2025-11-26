// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, use, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FiPlus } from "react-icons/fi";
import {
    Heading,
    Text,
    Input,
    Steps,
    Button,
    ButtonGroup,
    Flex,
    Box,
    Table,
    Field,
    Stack,
    CloseButton,
    Dialog,
    Portal,
    IconButton,
    HStack,
    Listbox,
    createListCollection,
    ListCollection,
    CollectionItem
} from "@chakra-ui/react";

import { MapContainer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";
import { NotificationService } from "@open-pioneer/notifier";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Draw, { createBox } from "ol/interaction/Draw.js";

import { Extent, Process, SpatialExtent, Timeseries } from "../../components/definitions";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { ActionButton } from "../../components/Timeseries/ActionButton";

import { useServices } from "../../services/Services";
import { MAP_BOX } from "../../services";
import { EventEmitter } from "@open-pioneer/core";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";


// Extent
interface ExtentSelectionProps {
    onBboxChange: (extent?: SpatialExtent) => void;
    isVisible: boolean
    dialogClosed: boolean;
}

function ExtentSelection(props: ExtentSelectionProps) {
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [extent, setExtent] = useState<SpatialExtent | undefined>();

    const source = new VectorSource();
    const vector = new VectorLayer({
        source: source,
        style: {
            "fill-color": "rgba(255, 255, 255, 0.2)",
            "stroke-color": "#2C7D75",
            "stroke-width": 2,
            "circle-radius": 7,
            "circle-fill-color": "#2C7D75",
        },
    });

    const drawInteraction = new Draw({
        source: source,
        type: "Circle",
        geometryFunction: createBox(),
        style: {
            "stroke-color": "#2C7D75",
            "stroke-width": 2,
            "circle-radius": 7,
            "circle-fill-color": "#2C7D75",
        }
    });

    async function drawBox() {
        vector.getSource()?.clear();
        drawInteraction.removeLastPoint();
        const map = await mapService.expectMapModel(MAP_BOX);

        map.olMap.addInteraction(drawInteraction);
        map.layers.addLayer(new SimpleLayer({ olLayer: vector, title: "temp" }));

        const drawStart = drawInteraction.on("drawstart", () => {
            vector.getSource()?.clear();
        });

        const drawEnd = drawInteraction.on("drawend", (e) => {
            const feature = e.feature;
            const geom = feature.getGeometry()!.getExtent();
            const newExtent = {
                bbox:
                    [
                        geom[0]!,
                        geom[1]!,
                        geom[2]!,
                        geom[3]!
                    ]
            } as SpatialExtent;
            setExtent(newExtent);
            drawInteraction.abortDrawing();
            props.onBboxChange(newExtent);
        });
    }


    useEffect(() => {
        if (props.isVisible) {
            drawBox();
            props.onBboxChange(extent);
        }
    }, [props.isVisible]);

    // useEffect(() => {
    //     if (props.dialogClosed) {
    //         drawBox();
    //     }
    // }, [props.dialogClosed]);

    return (
        <>
            <Text pt="8" pb="2" textStyle="lg">Please select extent:</Text>
            <Box height="60vh" border="1px solid black">
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    <MapContainer
                        mapId={MAP_BOX}
                        role="boxselection"
                        aria-label="">
                        <Box bg="white" width="40%" p="2" m="1" borderRadius="md" boxShadow="sm">
                            <Text>
                                Extent Cordinates: <br />
                                x1: {extent?.bbox[0]}, x2: {extent?.bbox[1]} <br />
                                x2: {extent?.bbox[2]}, y2: {extent?.bbox[3]}
                            </Text>
                        </Box>
                        <MapInfoControls mapId={MAP_BOX} />
                        <MapZoomControls mapId={MAP_BOX} />
                    </MapContainer>
                </Flex>
            </Box>
        </>
    );
}


interface CreateTimeseriesProps {
    eventListener: EventEmitter<Events>;
}

interface ProcessWithValue extends Process {
    value: string
}

export const CreateTimeseries: FC<CreateTimeseriesProps> = ({ eventListener }: CreateTimeseriesProps) => {
    const { id } = useParams();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [extent, setExtent] = useState<SpatialExtent | undefined>();
    const [step, setStep] = useState<number>(0);
    const { createTimeseries, getProcesses } = useServices();
    const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);
    const [expandDialogClosed, setExpandDialogClosed] = useState<boolean>(false);
    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const [value, setValue] = useState<string[]>([]);
    const [processes, setProcesses] = useState<ProcessWithValue[]>([]);
    const [processTable, setProcessTable] = useState<ListCollection<ProcessWithValue>>();
    const [selectedProcess, setSelectedProcess] = useState<Process | undefined>();

    const fetchProcesses = async () => {
        if (!id)
            return;
        try {
            const data = await getProcesses(id);
            setProcesses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleExitClick = () => {
        setStep(0);
        setName("");
        setDescription("");
        setValue([]);
        setExtent(undefined);
        setExpandDialogClosed(true);
    };

    const create = async () => {
        const timeseries: Timeseries = {
            id: "",
            scenario_id: id!.toString(),
            name: name,
            description: description,
            jobs: undefined,
            extent: extent,
            process: selectedProcess
        };
        const created = await createTimeseries(timeseries);
        handleExitClick();
        notificationService.notify({
            title: "Timeseries created:",
            message: created,
            level: "info",
            displayDuration: 5000,
        });
    };


    useEffect(() => {
        if (name != "" && description != "") {
            setNextButtonDisabled(false);
        }
        else {
            setNextButtonDisabled(true);
        }
    }, [name, description]);

    useEffect(() => {
        if (step == 1 && value.length > 0) {
            setNextButtonDisabled(false);
        }
    }, [step]);

    useEffect(() => {
        if (value.length > 0) {
            setNextButtonDisabled(false);
        }
        else { setNextButtonDisabled(true); }
    }, [value]);

    useEffect(() => {
        const listCollection = createListCollection({
            items: processes!.map((p) => {
                p.value = p.id.toString();
                return p;
            })
        });
        setProcessTable(listCollection);
    }, [processes]);


    const steps = [
        {
            title: "Data Input",
            description: <>
                <Stack pt="8" gap="4" align="flex-start" maxW="md">
                    <Field.Root required>
                        <Field.Label>Name</Field.Label>
                        <Input
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            placeholder='Timeseries 52'
                            css={{ "--focus-color": "#2C7D75" }} />
                    </Field.Root>

                    <Field.Root required>
                        <Field.Label>Description</Field.Label>
                        <Input
                            value={description}
                            onChange={(ev) => setDescription(ev.target.value)}
                            placeholder='Timeseries for demonstration purposes only!'
                            css={{ "--focus-color": "#2C7D75" }} />
                    </Field.Root>
                </Stack>
            </>,
        },
        {
            title: "Process Selection",
            description: <>
                <Flex pt="8" direction="row" align="space-between">
                    <Box width="300px">
                        {processTable &&
                            <Listbox.Root
                                deselectable
                                collection={processTable}
                                value={value}
                                onValueChange={(details) => {
                                    setValue(details.value);
                                    setSelectedProcess(details.items[0]!);
                                }}
                                width="full"
                                gap="4"
                            >
                                <Listbox.Label><Text fontSize="md">Filter Levels:</Text></Listbox.Label>
                                <Listbox.Content>
                                    {processTable.items.map((item) => (
                                        <Listbox.Item
                                            item={item}
                                            key={item.value}
                                            flexDirection="row"
                                            alignItems="flex-start"
                                            gap="1">
                                            <HStack align="space-between">
                                                <Box>
                                                    <Listbox.ItemText>{item.name}</Listbox.ItemText>
                                                    <Text fontSize="xs" color="fg.muted" mt="1">
                                                        {item.description}
                                                    </Text>
                                                </Box>
                                                <Box>
                                                    <Listbox.ItemIndicator
                                                        position="absolute"
                                                        right="4"
                                                        top="40%" />
                                                </Box>
                                            </HStack>
                                        </Listbox.Item>
                                    ))}
                                </Listbox.Content>
                            </Listbox.Root>
                        }
                    </Box>
                    <Box>
                        <Text>Selected Process Number: {value}</Text>
                    </Box>
                </Flex>
            </>,
        },
        {
            title: "Extent Selection",
            description:
                <ExtentSelection
                    isVisible={step == 2}
                    dialogClosed={expandDialogClosed}
                    onBboxChange={(ext) => {
                        //setExtent(ext);
                        setNextButtonDisabled(!ext);
                    }} />,
        },
        {
            title: "Check Data",
            description: <>
                <Text pt="8" pb="2" textStyle="lg">CHECK DATA!</Text>
                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader font="semibold">Parameter</Table.ColumnHeader>
                            <Table.ColumnHeader>Value</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <Table.Row key="name">
                            <Table.Cell>name</Table.Cell>
                            <Table.Cell>{name}</Table.Cell>
                        </Table.Row>
                        <Table.Row key="description">
                            <Table.Cell>description</Table.Cell>
                            <Table.Cell>{description}</Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
            </>,
        },
    ];

    /*
                 - Name
            - Description
            - Process
            - Process Parameters that are shared between all results. E.g. bounding box, algorithm parameters.
    */

    return (
        <>
            <Dialog.Root size="xl" placement="center">
                <Dialog.Trigger asChild>
                    <Flex justify="center" mt={4}>
                        <IconButton
                            aria-label="Add new Timeseries"
                            bg="#2C7D75"
                            color="white"
                            size="lg"
                            borderRadius="full"
                            _hover={{ bg: "teal.700" }}
                            onClick={() => {
                                fetchProcesses();
                            }}>
                            <FiPlus></FiPlus>
                        </IconButton>
                    </Flex>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <Flex gap="4">
                                        <Heading height="12" size="lg" order="1">
                                            Create new Timeseries
                                        </Heading>
                                    </Flex>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Steps.Root
                                defaultStep={0}
                                count={steps.length - 1}
                                onStepChange={(details) => { setStep(details.step); }}
                                orientation="horizontal"
                                width="100%">
                                <Dialog.Body>
                                    <Steps.List>
                                        {steps.map((step, index) => (
                                            <Steps.Item colorPalette="teal" key={index} index={index} title={step.title} >
                                                <Steps.Indicator />
                                                <Steps.Title fontSize="lg">{step.title}</Steps.Title>
                                                <Steps.Separator />
                                            </Steps.Item>
                                        ))}
                                    </Steps.List >
                                    {steps.map((step, index) => (
                                        <Steps.Content key={index} index={index}>
                                            {step.description}
                                        </Steps.Content>
                                    ))}
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <ButtonGroup colorPalette="teal" size="md" variant="outline">
                                        <Steps.PrevTrigger asChild>
                                            <Button
                                                color="black"
                                                border="1px solid #2C7D75"
                                                _hover={{ bg: "teal.50" }}
                                                onClick={() => { setNextButtonDisabled(false); }}>
                                                Prev
                                            </Button>
                                        </Steps.PrevTrigger>
                                        {(step < 3) &&
                                            <Steps.NextTrigger asChild>
                                                <Button
                                                    color="black"
                                                    border="1px solid #2C7D75"
                                                    _hover={{ bg: "teal.50" }}
                                                    disabled={nextButtonDisabled}
                                                    onClick={() => { setNextButtonDisabled(true); }}>
                                                    Next
                                                </Button>
                                            </Steps.NextTrigger>
                                        }
                                    </ButtonGroup>
                                    <Steps.CompletedContent>
                                        <Dialog.CloseTrigger asChild>
                                            <ActionButton
                                                label="Create"
                                                tooltip="Create timeseries"
                                                disabled={false}
                                                onClick={() => { create(); }}
                                                w={"170px"}
                                            />
                                        </Dialog.CloseTrigger>
                                    </Steps.CompletedContent>
                                </Dialog.Footer>
                            </Steps.Root>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton
                                    height="10"
                                    variant="outline"
                                    order="2"
                                    size="md"
                                    color="black"
                                    border="1px solid #2C7D75"
                                    _hover={{ bg: "teal.50" }}
                                    onClick={handleExitClick} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};

