// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { IconButton, HStack } from "@open-pioneer/chakra-integration";
import { FiFileText, FiInfo, FiMapPin } from "react-icons/fi";

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
        <HStack spacing={2}>
            <IconButton
                aria-label="Document"
                icon={<FiFileText />}
                variant="ghost"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onDocumentClick}
            />
            <IconButton
                aria-label="Info"
                icon={<FiInfo />}
                variant="ghost"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onInfoClick}
            />
            <IconButton
                aria-label="Locate on Map"
                icon={<FiMapPin />}
                variant="ghost"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onLocateClick}
            />
        </HStack>
    );
}
