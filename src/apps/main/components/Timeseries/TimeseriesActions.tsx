// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, HStack, Spacer, Tooltip } from "@open-pioneer/chakra-integration";

interface TimeseriesActionsProps {
    onDownloadAll?: () => void;
    onDownloadCurrent?: () => void;
    onExecute?: () => void;
}

export function TimeseriesActions({
    onDownloadAll,
    onDownloadCurrent,
    onExecute
}: TimeseriesActionsProps) {
    return (
        <HStack spacing={3}>
            <Tooltip label="Download all available timeseries results" aria-label="Download all tooltip" placement="top">
                <Button
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    onClick={onDownloadAll}
                >
                    Download all results
                </Button>
            </Tooltip>

            <Tooltip label="Download the currently selected result" aria-label="Download current tooltip" placement="top">
                <Button
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    onClick={onDownloadCurrent}
                >
                    Download current result
                </Button>
            </Tooltip>

            <Spacer />

            <Tooltip label="Execute operation for the selected timestamp" aria-label="Execute tooltip" placement="top">
                <Button
                    variant="solid"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    onClick={onExecute}
                >
                    Execute for timestamp
                </Button>
            </Tooltip>
        </HStack>
    );
}
