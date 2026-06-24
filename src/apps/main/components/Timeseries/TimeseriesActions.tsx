// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HStack, Spacer, VStack } from "@chakra-ui/react";
import { ActionButton } from "./utils/ActionButton";
import { LuDownload } from "react-icons/lu";

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
        <VStack>
            <ActionButton
                label="Download all results"
                tooltip="Download all available timeseries results"
                disabled={true}
                onClick={onDownloadAll}
            />

            <ActionButton
                label="Download current result"
                tooltip="Download the currently selected result"
                disabled={false}
                onClick={onDownloadCurrent}
            />
        </VStack>
    );
}

export function DownloadAllButton({
    onDownloadAll
}: TimeseriesActionsProps) {
    return (
            <ActionButton
                icon={<LuDownload />}
                label="Download all results"
                tooltip="Download all available timeseries results"
                disabled={true}
                onClick={onDownloadAll}
            />
        
    );
}

export function DownloadCurrentButton({
    onDownloadCurrent
}: TimeseriesActionsProps) {
    return (
        
            <ActionButton
                label="Download current result"
                tooltip="Download the currently selected result"
                disabled={false}
                onClick={onDownloadCurrent}
            />
        
    );
}
