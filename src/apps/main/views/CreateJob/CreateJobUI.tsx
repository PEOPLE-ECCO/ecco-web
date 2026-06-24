// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Heading,
    Box,
    HStack,
    VStack,
    Steps,
    ButtonGroup,
    Button,
    Flex,
    Stack,
    Input,
    Table,
} from "@chakra-ui/react";
import { FC } from "react";
import { useNavigate, useParams } from "react-router";
import { useServices } from "../../services/Services";
import { ActionButton } from "../../components/Timeseries/utils/ActionButton";
import { setHeapSnapshotNearHeapLimit } from "v8";
import { CloseButton } from "@chakra-ui/react";

const CreateJob: FC = () => {
    const { id, ts_id } = useParams();
    const navigate = useNavigate();

    const { createJob } = useServices();
    const cancel = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const create = async (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);

        const created = await createJob(id!, ts_id!, undefined);

        alert("Created Job: " + created);
        navigate("..");
    };

    const handleClick = () => {
        navigate(-1);
    };


    const steps = [
        {
            title: "Step 1",
            description: <>
                <Stack gap="4">
                    <Input placeholder="StartDate" variant="outline"/>
                    <Input placeholder="EndDate" variant="outline" />
                </Stack>
            </>,
        },
        {
            title: "Step 2",
            description: <>
                <Table.Root>
                    <Table.Caption />
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Parameter</Table.ColumnHeader>
                            <Table.ColumnHeader>Value</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>

                    </Table.Body>
                </Table.Root>
            </>,
        },
    ];


    return (
        <>
            <Flex gap="10">
                <Heading height="12" size="lg" mb={4} order="1">
                Create new Job
                </Heading>
                <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" onClick={handleClick}/>
            </Flex>

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
                        onClick={() => create("create")}
                        w={"170px"}
                    />
                </Steps.CompletedContent>

                <ButtonGroup size="sm" variant="outline">
                    <Steps.PrevTrigger asChild>
                        <Button>Prev</Button>
                    </Steps.PrevTrigger>
                    <Steps.NextTrigger asChild>
                        <Button>Next</Button>
                    </Steps.NextTrigger>
                </ButtonGroup>
            </Steps.Root>
        </>
    );
};


export default CreateJob;