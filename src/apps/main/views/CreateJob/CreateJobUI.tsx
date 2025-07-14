// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Heading,
    Box,
    HStack,
    VStack,
} from "@open-pioneer/chakra-integration";
import { FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ActionButton } from "../../components/Buttons/ActionButton";
import { useServices } from "../../services/Services";

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

    return (
        <Box p="4" borderRadius="md" boxShadow="sm" bg="white">
            <Heading size="md" mb={4}>
                Create new Job
            </Heading>

            Defined here:
            - Timestamp that needs to be calculated

            <VStack alignItems="left" spacing={4}>
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


export default CreateJob;