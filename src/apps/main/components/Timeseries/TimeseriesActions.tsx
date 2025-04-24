// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Button, HStack, Spacer } from "@open-pioneer/chakra-integration";

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
            <Button
                variant="solid"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onDownloadAll}
            >
                Download all results
            </Button>
            <Button
                variant="solid"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onDownloadCurrent}
            >
                Download current result
            </Button>

            <Spacer />

            <Button
                variant="solid"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onExecute}
            >
                Execute for timestamp
            </Button>
        </HStack>
    );
}