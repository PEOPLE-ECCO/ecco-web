// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { SimpleGrid } from "@open-pioneer/chakra-integration";
import { FiDownload, FiDownloadCloud, FiFileText, FiInfo, FiMapPin, FiPlay } from "react-icons/fi";
import { IconActionButton } from "./IconActionButton";

interface TimeseriesIconsProps {
    downloadCurrentResult: () => void;
    downloadAllResults: () => void;
    execute: () => void;
    downloadProcessGraph: () => void;
    inspect: () => void;
    locate: () => void;
}

export function TimeseriesIcons({
    downloadCurrentResult,
    downloadAllResults,
    execute,
    downloadProcessGraph,
    inspect,
    locate
}: TimeseriesIconsProps) {
    return (
        <SimpleGrid spacing={2} columns={[6]}>
            <IconActionButton
                icon={<FiDownload />}
                label="Download current result"
                tooltip="Download current result"
                onClick={downloadCurrentResult}
            />
            <IconActionButton
                icon={<FiDownloadCloud />}
                label="Download all results"
                tooltip="Download all results"
                onClick={downloadAllResults}
            />
            <IconActionButton
                icon={<FiFileText />}
                label="Download Process Graph"
                tooltip="Download Process Graph"
                onClick={downloadProcessGraph}
            />
            <IconActionButton
                icon={<FiPlay />}
                label="Execute for timestamp"
                tooltip="Execute for timestamp"
                onClick={execute}
            />
            <IconActionButton
                icon={<FiInfo />}
                label="Inspect parameters"
                tooltip="Inspect parameters"
                onClick={inspect}
            />
            <IconActionButton
                icon={<FiMapPin />}
                label="Zoom to AOI"
                tooltip="Zoom to AOI"
                onClick={locate}
            />
        </SimpleGrid>
    );
}