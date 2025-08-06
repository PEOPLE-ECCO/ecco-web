// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router";

export function TimeseriesAddBtn() {

    const navigate = useNavigate();
    
    const handleRedirect = () => {
        navigate("./createTimeseries"); // Redirect to your desired page
    };

    return (
        <Flex justify="center" mt={4}>
            <Tooltip.Root label="Add new Timeseries" aria-label="Add new Timeseries Tooltip">
                <IconButton
                    aria-label="Add new Timeseries"
                    onClick={handleRedirect}
                    bg="green.500"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    _hover={{ bg: "green.400" }}
                >
                    <FiPlus></FiPlus>
                </IconButton>
            </Tooltip.Root>
        </Flex>
    );
}
