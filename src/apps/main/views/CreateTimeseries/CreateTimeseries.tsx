// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
import {
    Box,
    Heading,
    Select,
    HStack,
    Text,
    Input,
    VStack
} from "@open-pioneer/chakra-integration";
import { ActionButton } from "../../components/Timeseries/ActionButton";
import { useServices } from "../../services/Services";
import { Timeseries } from "../../components/definitions";
import { useParams, useNavigate } from "react-router-dom";

const CreateTimeseries: FC = () => {
    const { id } = useParams();
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const { createTimeseries } = useServices();
    const navigate = useNavigate();

    const cancel = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const create = async (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);

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

    const execute = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    return (
        <Box p="4" borderRadius="md" boxShadow="sm" bg="white">
            <Heading size="md" mb={4}>
                Create new Timeseries
            </Heading>

            Defined here:
            - Name
            - Description
            - Process
            - Process Parameters that are shared between all results. E.g. bounding box, algorithm parameters.

            <VStack alignItems="left" spacing={4}>
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


                <HStack spacing={4}>
                    <ActionButton
                        label="Cancel"
                        tooltip="Cancel creation"
                        onClick={() => cancel("cancel")}
                        w={"170px"}
                    />
                    <ActionButton
                        label="Create"
                        tooltip="Create timeseries"
                        onClick={() => create("create")}
                        w={"170px"}
                    />
                </HStack>
            </VStack>

        </Box>
    );
};

export default CreateTimeseries;
