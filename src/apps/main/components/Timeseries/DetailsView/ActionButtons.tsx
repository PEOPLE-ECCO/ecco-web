// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HStack, SimpleGrid, Spacer } from "@open-pioneer/chakra-integration";
import { ActionButton } from "../../Buttons/ActionButton";
import { Columns } from "lucide-react";

interface TimeseriesActionsProps {
    onDownloadAll?: () => void;
    onDownloadCurrent?: () => void;
    onExecute?: () => void;
}

export function ActionButtons({
    onDownloadAll,
    onDownloadCurrent,
    onExecute
}: TimeseriesActionsProps) {
    return (
        <SimpleGrid spacing={5} minChildWidth="180px">
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

            <ActionButton
                label="Execute for timestamp"
                tooltip="Execute operation for the selected timestamp"
                onClick={onExecute}
            />
        </SimpleGrid>
    );
}
