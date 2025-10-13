// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
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
    CloseButton
} from "@chakra-ui/react";

import { MapContainer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import { useService } from "open-pioneer:react-hooks";

import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector.js";
import Draw, { createBox } from "ol/interaction/Draw.js";

import { Extent, Timeseries } from "../../components/definitions";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapZoomControls } from "../../components/Map/MapZoomControl";
import { MapSidebarControls } from "../../components/Map/MapSidebarControls";
import { ActionButton } from "../../components/Timeseries/ActionButton";

import { useServices } from "../../services/Services";
import { MAP_BOX } from "../../services";

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

const CreateTimeseries: FC = () => {
    const { id } = useParams();
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [extent, setExtent] = useState<Extent>();
    const [step, setStep] = useState<number>(0);
    const { createTimeseries } = useServices();
    const navigate = useNavigate();
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
            description: <BboxSearch isVisible={step == 1} onBboxChange={(ext) => {;
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


    /*
                 - Name
            - Description
            - Process
            - Process Parameters that are shared between all results. E.g. bounding box, algorithm parameters.
    */

    return (
        <>
            <Flex gap="10">
                <Heading height="12" size="lg" mb={4} order="1">
                    Create new Timeseries
                </Heading>
                <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" onClick={handleExitClick} />
            </Flex>

            <Steps.Root defaultStep={0} count={steps.length-1} onStepChange={(details) => {
                setStep(details.step);
            }} orientation="horizontal" width="100%">
                <Steps.List>
                    {steps.map((step, index) => (
                        <Steps.Item colorPalette="teal" key={index} index={index} title={step.title} >
                            <Steps.Indicator />
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>

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
            </Steps.Root>
        </>
    );
};

export default CreateTimeseries;
