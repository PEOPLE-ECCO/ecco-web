// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useState } from "react";
import {
    Heading,
    Text,
    Input,
    Steps,
    Button,
    ButtonGroup,
    Flex,
    Box,
    Table
} from "@chakra-ui/react";

import { ActionButton } from "../../components/Timeseries/ActionButton";
import { useServices } from "../../services/Services";
import { Timeseries } from "../../components/definitions";
import { useParams, useNavigate } from "react-router";
import { MAP_ID } from "../../services";
import { MapInfoControls } from "../../components/Map/MapInfoControls";
import { MapContainer } from "@open-pioneer/map";

function BboxSearch() {

    return (
        <>
            TODO: Implement/Import BBOX selection
            <Box height="50vh">
                <Flex flex="1" height="100%" width="50%" direction="column" overflow="hidden" position="relative">
                    <MapContainer
                        mapId={MAP_ID}
                        role="main"
                        aria-label=""
                    >
                        <MapInfoControls mapId={MAP_ID} />
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
                <Text >Name:</Text>
                <Input
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    placeholder='Timeseries 52'
                />
                <Text >Description:</Text>
                <Input
                    value={description}
                    onChange={(ev) => setDescription(ev.target.value)}
                    placeholder='Timeseries for demonstration purposes only!'
                />
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
            <Heading size="md" mb={4}>
                Create new Timeseries
            </Heading>

            <Steps.Root defaultStep={0} count={steps.length} orientation="horizontal">
                <Steps.List>
                    {steps.map((step, index) => (
                        <Steps.Item key={index} index={index} title={step.title}>
                            <Steps.Indicator />
                            <Steps.Title>{step.title}</Steps.Title>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>

                <ButtonGroup size="sm" variant="outline">
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
