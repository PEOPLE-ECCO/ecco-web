// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Button,
    Collapsible,
    Stack,
    Text,
    Menu,
    IconButton,
    Flex,
    useDisclosure,
    HStack,
    Accordion,
    Portal,
    Dialog,
    Table,
    CloseButton,
    Heading,
    Steps,
    ButtonGroup,
    Field,
    Input
} from "@chakra-ui/react";

import { TimeseriesAddBtn } from "./TimeseriesAddBtn";
import { ActionButton } from "./ActionButton";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { MapSidebarControls } from "../../components/Map/MapSidebarControls";
import { Job, Timeseries, Extent } from "../definitions";
import { useServices } from "../../services/Services";

import { ReactNode, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Ellipsis, Plus } from "lucide-react";
import { FiPlus } from "react-icons/fi";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Draw, { createBox } from "ol/interaction/Draw.js";

import { MAP_BOX } from "../../services";
import { MapContainer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";



interface BboxSearchProps {
    onBboxChange: (extent?: Extent) => void;
    isVisible: boolean
}

function BboxSearch(props: BboxSearchProps) {
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
    const mapService = useService<MapRegistry>("map.MapRegistry");
    const [extent, setExtent] = useState<Extent>();

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

    vector.getSource()?.clear();

    useEffect(() => {
        if (props.isVisible) {
            drawBox();
            props.onBboxChange(extent);
        }
    }, [props.isVisible]);

    async function drawBox() {
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
                temporal: {
                    interval: []
                },
                spatial: {
                    bbox:
                        [
                            geom[0]!,
                            geom[1]!,
                            geom[2]!,
                            geom[3]!
                        ]
                }
            } as Extent;
            setExtent(newExtent);
            drawInteraction.abortDrawing();
            props.onBboxChange(newExtent);
        });
    }

    return (
        <>
            Please select extent:
            <Box height="65vh">
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    <MapContainer
                        mapId={MAP_BOX}
                        role="boxselection"
                        aria-label=""
                    >
                        <Box bg="white" width="20%">
                            <MapInfoControls mapId={MAP_BOX}></MapInfoControls>
                            <Text>
                                Extent Cordinates: <br />
                                x1: {extent?.spatial.bbox[0]}, x2: {extent?.spatial.bbox[1]} <br />
                                x2: {extent?.spatial.bbox[2]}, y2: {extent?.spatial.bbox[3]}
                            </Text>
                        </Box>
                        <MapZoomControls mapId={MAP_BOX} />
                        <MapSidebarControls mapId={MAP_BOX} />
                    </MapContainer>
                </Flex>
            </Box>
        </>
    );
}


interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {
    const title = "Timeseries";
    const navigate = useNavigate();

    const { getJobLog } = useServices();
    const { open, onOpen, onClose } = useDisclosure();
    const [modalContent, setModalContent] = useState<ReactNode>();
    const [_, setSelectedTimeseries] = useState<Timeseries>();

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const viewLog = async (job: Job) => {
        const log = await getJobLog("1", job);
        setModalContent(
            <>
                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Time</Table.ColumnHeader>
                            <Table.ColumnHeader>Level</Table.ColumnHeader>
                            <Table.ColumnHeader>Message</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {log.map((item, key) => (
                            <Table.Row key={key}>
                                <Table.Cell>{item.time}</Table.Cell>
                                <Table.Cell>{item.level}</Table.Cell>
                                <Table.Cell>{item.message}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </>
        );
        onOpen();
    };

    const vieDetails = async (job: Job) => {
        const content = (
            <Text>
                ID: {job.id}<br></br>
                Scheduled: {job.scheduleTime}<br></br>
                {job.usage && <>
                    Costs: {job.credits} Credits<br></br>
                    CPU: {job.usage?.cpu.value} {job.usage?.cpu.unit}<br></br>
                    Duration: {job.usage?.duration.value} {job.usage?.duration.unit}<br></br>
                    Memory: {job.usage?.memory.value} {job.usage?.memory.unit}<br></br>
                    SentinelHub: {job.usage?.sentinelhub.value} {job.usage?.sentinelhub.unit}<br></br>
                </>}
            </Text>
        );

        setModalContent([content]);
        onOpen();
    };

    const select = (ts: Timeseries) => {
        setSelectedTimeseries(ts);
        onSelect(ts);
    };


    const { id } = useParams();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [extent, setExtent] = useState<Extent>();
    const [step, setStep] = useState<number>(0);
    const { createTimeseries } = useServices();

    const handleExitClick = () => {
        navigate(-1);
    };
    const [nextButtonDisabled, setNextButtonDisabled] = useState<boolean>(true);

    useEffect(() => {
        console.log("disable state");
        if (name != "" && description != "") {
            setNextButtonDisabled(false);
        }
        else {
            setNextButtonDisabled(true);
        }
    }, [name, description]);

    const create = async () => {
        const timeseries: Timeseries = {
            id: "",
            scenario_id: id!.toString(),
            name: name,
            description: description,
            jobs: undefined
        };
        const created = await createTimeseries(timeseries);

        alert("Created Timeseries: " + created);
        navigate("..");
    };


    const steps = [
        {
            title: "Data Input",
            description: <>
                <Stack gap="4" align="flex-start" maxW="sm">
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
            title: "Extent Selection",
            description: <BboxSearch isVisible={step == 1} onBboxChange={(ext) => {
                ;
                setExtent(ext);
                setNextButtonDisabled(!ext);
            }} />,
        },
        {
            title: "Check Data",
            description: <>
                CHECK DATA!
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


    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
            <Stack gap="4">
                <Text fontWeight="700" fontSize={18}>{title}</Text>
                <Accordion.Root collapsible multiple>
                    {timeseries?.map((ts, key) => (
                        <Accordion.Item value={ts.id} key={key}>
                            <Accordion.ItemTrigger bg="white" display="flex" alignItems="center">
                                <Box as="span" flex="1" textAlign="left" fontWeight="700">
                                    {ts.name}
                                </Box>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent pb={4} bg="white">

                                <HStack>
                                    <Text fontWeight="medium">Description:</Text>
                                    <Text whiteSpace="pre-wrap">{ts.description}</Text>
                                </HStack>

                                <HStack>
                                    <Flex justify="space-between">
                                        <Button size="xs" width="35%" bg="#2C7D75" onClick={() => select(ts)}>
                                            View Results
                                        </Button>
                                        <Button size="xs" width="45%" bg="#2C7D75" onClick={() => navigate("timeseries/" + ts.id + "/createJob")}>
                                            Expand Timeseries
                                        </Button>
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="outline" size="xs">
                                                    <Ellipsis />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content>
                                                        <Menu.Item value="delete" onClick={() => handleDelete(ts)}>Delete</Menu.Item>
                                                        <Menu.Item value="archive" onClick={() => handleArchive(ts)}>Archive</Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Flex>
                                </HStack>
                                <Box>
                                    {ts.jobs &&
                                        <>
                                            <Table.Root>
                                                <Table.Header>Jobs:</Table.Header>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.ColumnHeader>Id</Table.ColumnHeader>
                                                        <Table.ColumnHeader>Details</Table.ColumnHeader>
                                                        <Table.ColumnHeader>Log</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {ts.jobs.map((job) => (
                                                        <Table.Row key={job.id}>
                                                            <Table.Cell>{job.id}</Table.Cell>
                                                            <Table.Cell><Button onClick={() => vieDetails(job)}>Details</Button></Table.Cell>
                                                            <Table.Cell><Button onClick={() => viewLog(job)}>Log</Button></Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table.Root>
                                        </>
                                    }
                                </Box>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>

                <TimeseriesAddBtn />

                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <Flex justify="center" mt={4}>
                            <IconButton
                                aria-label="Add new Timeseries"
                                bg="#2C7D75"
                                color="white"
                                size="lg"
                                borderRadius="full"
                                _hover={{ bg: "teal.700" }}
                            >
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
                                        <Flex gap="10">
                                            <Heading height="12" size="lg" mb={4} order="1">
                                                Create new Timeseries
                                            </Heading>
                                        </Flex>
                                    </Dialog.Title>
                                </Dialog.Header>
                                <Steps.Root defaultStep={0} count={steps.length - 1} onStepChange={(details) => {
                                    setStep(details.step);
                                }} orientation="horizontal" width="100%">
                                    <Dialog.Body>

                                        <Steps.List>
                                            {steps.map((step, index) => (
                                                <Steps.Item colorPalette="teal" key={index} index={index} title={step.title} >
                                                    <Steps.Indicator />
                                                    <Steps.Title>{step.title}</Steps.Title>
                                                    <Steps.Separator />
                                                </Steps.Item>
                                            ))}
                                        </Steps.List>



                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <ButtonGroup colorPalette="teal" size="sm" variant="outline">
                                            <Steps.PrevTrigger asChild>
                                                <Button onClick={() => {
                                                    setNextButtonDisabled(false);
                                                }}>Prev</Button>
                                            </Steps.PrevTrigger>
                                            {(step < 2) &&
                                                <Steps.NextTrigger asChild>
                                                    <Button disabled={nextButtonDisabled}>Next</Button>
                                                </Steps.NextTrigger>
                                            }
                                        </ButtonGroup>

                                        {steps.map((step, index) => (
                                            <Steps.Content key={index} index={index}>
                                                {step.description}
                                            </Steps.Content>
                                        ))}

                                        <Steps.CompletedContent>
                                            <ActionButton
                                                label="Create"
                                                tooltip="Create timeseries"
                                                disabled={false}
                                                onClick={() => create()}
                                                w={"170px"}
                                            />
                                        </Steps.CompletedContent>
                                    </Dialog.Footer>
                                </Steps.Root>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>





                {modalContent && open &&
                    <Dialog.Root size="full" open={open} onExitComplete={onClose} scrollBehavior="inside">
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content>
                                <Dialog.Header>
                                    <Dialog.Title></Dialog.Title>
                                </Dialog.Header>
                                <Dialog.CloseTrigger />
                                <Dialog.Body>
                                    {modalContent}
                                </Dialog.Body>

                                <Dialog.Footer>
                                    <Button colorPalette='blue' mr={3} onClick={onClose}>
                                        Close
                                    </Button>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Dialog.Root>
                }
            </Stack>
        </Box >
    );
}
