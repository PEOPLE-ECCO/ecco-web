// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HStack, Spacer } from "@open-pioneer/chakra-integration";
import { ActionButton } from "./ActionButton";

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
            <ActionButton
                label="Download all results"
                tooltip="Download all available timeseries results"
                onClick={onDownloadAll}
            />

            <ActionButton
                label="Download current result"
                tooltip="Download the currently selected result"
                onClick={onDownloadCurrent}
            />

            <Spacer />

            <ActionButton
                label="Execute for timestamp"
                tooltip="Execute operation for the selected timestamp"
                onClick={onExecute}
            />
        </HStack>
    );
}
