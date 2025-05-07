// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex, IconButton, Tooltip } from "@open-pioneer/chakra-integration";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export function TimeseriesAddBtn() {

    const navigate = useNavigate();
    
    const handleRedirect = () => {
        navigate("./createProcessGraph"); // Redirect to your desired page
    };

    return (
        <Flex justify="center" mt={4}>
            <Tooltip label="Add new Timeseries" aria-label="Add new Timeseries Tooltip">
                <IconButton
                    icon={<FiPlus size="30px" />}
                    aria-label="Add new Process Graph"
                    onClick={handleRedirect}
                    bg="green.500"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    _hover={{ bg: "green.400" }}
                />
            </Tooltip>
        </Flex>
    );
}
