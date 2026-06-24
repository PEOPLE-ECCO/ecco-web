// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HStack } from "@chakra-ui/react";
import { FiFileText, FiInfo, FiMapPin } from "react-icons/fi";
import { IconActionButton } from "./IconActionButton";

interface TimeseriesIconsProps {
    onDocumentClick?: () => void;
    onInfoClick?: () => void;
    onLocateClick?: () => void;
}

export function TimeseriesIcons({
    onDocumentClick,
    onInfoClick,
    onLocateClick
}: TimeseriesIconsProps) {
    return (
        <HStack>
            <IconActionButton
                icon={<FiFileText />}
                label="Document"
                tooltip="Download Process Graph"
                onClick={onDocumentClick}
            />
            <IconActionButton
                icon={<FiInfo />}
                label="Info"
                tooltip="Inspect parameters"
                onClick={onInfoClick}
            />
            <IconActionButton
                icon={<FiMapPin />}
                label="Locate on Map"
                tooltip="Zoom to AOI"
                onClick={onLocateClick}
            />
        </HStack>
    );
}
