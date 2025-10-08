// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
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
    Stack
} from "@chakra-ui/react";

import { ActionButton } from "../../components/Timeseries/ActionButton";
import { useServices } from "../../services/Services";
import { Extend, Timeseries } from "../../components/definitions";
import { useParams, useNavigate } from "react-router";
import { MAP_ID } from "../../services";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapContainer, MapRegistry, SimpleLayer } from "@open-pioneer/map";
import VectorSource from "ol/source/Vector";
import { useService } from "open-pioneer:react-hooks";
import VectorLayer from "ol/layer/Vector.js";
import Draw, {createBox, createRegularPolygon} from "ol/interaction/Draw.js";
import { CloseButton } from "@chakra-ui/react";

function BboxSearch() {
    
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
    
    const[extend, setExtend] = useState({x1: 0, y1: 0, x2: 0, y2: 0});

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

    useEffect(() => {
        test();
    }, []);

    async function test() {
        const map = await mapService.expectMapModel(MAP_ID);
        map.olMap.addInteraction(drawInteraction);

        map.layers.addLayer(new SimpleLayer({olLayer: vector, title: "temp"}));

        const drawStart = drawInteraction.on("drawstart", () => {
            console.log("draw start");
            vector.getSource()?.clear();
        });

        const drawEnd = drawInteraction.on("drawend", (e) => {
            const feature = e.feature;
            const extend = e.feature.getGeometry()!.getExtent();
            console.log("draw end", feature);
            console.log("Extend: ", extend);
            setExtend({
                x1: extend[0]!,
                y1: extend[1]!,
                x2: extend[2]!,
                y2: extend[3]!
            });
            drawInteraction.abortDrawing();
        });
    }

    return (
        <>
            Please select extend:
            <Box height="65vh">                
                <Flex flex="1" height="100%" width="100%" direction="column" overflow="hidden" position="relative">
                    <MapContainer
                        mapId={MAP_ID}
                        role="main"
                        aria-label=""
                    >
                        <Box bg="white" width="20%">
                            <MapInfoControls mapId={MAP_ID}></MapInfoControls>
                            <Text>
                                Extend Cordinates: <br />
                                x1: {extend.x1}, y1: {extend.y1} <br />
                                x2: {extend.x2}, y2: {extend.y2}
                            </Text>
                        </Box>
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
    const { createTimeseries } = useServices();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1);
    };

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
            title: "Step 1",
            description: <>
                <Stack gap="4" align="flex-start" maxW="sm">
                    <Field.Root required>
                        <Field.Label>Name</Field.Label>
                        <Input 
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            placeholder='Timeseries 52'
                            css={{ "--focus-color": "#2C7D75" }}/>
                    </Field.Root>

                    <Field.Root required>
                        <Field.Label>Description</Field.Label>
                        <Input 
                            value={description}
                            onChange={(ev) => setDescription(ev.target.value)}
                            placeholder='Timeseries for demonstration purposes only!'
                            css={{ "--focus-color": "#2C7D75" }}/>
                    </Field.Root>
                </Stack>
            </>,
        },
        {
            title: "Step 2",
            description: <BboxSearch />,
        },
        {
            title: "Step 3",
            description: <>
                CHECK DATA!

                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Parameter</Table.ColumnHeader>
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
                <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" onClick={handleClick}/>
            </Flex>
            <Steps.Root defaultStep={0} count={steps.length} orientation="horizontal" width="100%">
                <Steps.List>
                    {steps.map((step, index) => (
                        <Steps.Item colorPalette="teal" key={index} index={index} title={step.title}>
                            <Steps.Indicator />
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>

                <ButtonGroup colorPalette="teal" size="sm" variant="outline">
                    <Steps.PrevTrigger asChild>
                        <Button>Prev</Button>
                    </Steps.PrevTrigger>
                    <Steps.NextTrigger asChild>
                        <Button>Next</Button>
                    </Steps.NextTrigger>
                </ButtonGroup>

                {steps.map((step, index) => (
                    <Steps.Content key={index} index={index}>
                        {step.description}
                    </Steps.Content>
                ))}
                <Steps.CompletedContent>
                    SUBMIT!!
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
