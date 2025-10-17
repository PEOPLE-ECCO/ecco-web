// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Flex, IconButton} from "@chakra-ui/react";
import { Tooltip } from "../../components/tooltip";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router";

export function TimeseriesAddBtn() {

    const navigate = useNavigate();
    
    const handleRedirect = () => {
        navigate("./createTimeseries"); // Redirect to your desired page
    };

    return (
        <Flex justify="center" mt={4}>
            <Tooltip content="Add new Timeseries">
                <IconButton
                    aria-label="Add new Timeseries"
                    onClick={handleRedirect}
                    bg="#2C7D75"
                    color="white"
                    size="lg"
                    borderRadius="full"
                    _hover={{ bg: "teal.700" }}
                >
                    <FiPlus></FiPlus>
                </IconButton>
            </Tooltip>
        </Flex>
    );
}
