// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Link, Stack, Text } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";

interface DownloadLink {
    label: string;
    href: string;
}

// Hardcoded S3 download links for additional data. Extend this list as more
// datasets become available for download.
const DOWNLOAD_LINKS: DownloadLink[] = [
    {
        label: "Sakar Priorization GPKG",
        href: "https://s3.people-ecco.dev.52north.org/auxdata2/Sakar_Prioritization.gpkg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=GKcee6e50255a82b471f712fea%2F20260705%2Fgarage%2Fs3%2Faws4_request&X-Amz-Date=20260705T170924Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=7b694b881ea329a57779e70f47e8f1dab4360fed8c673df852335f093ef78faf"
    }
];

export const DownloadControl = () => {
    return (
        <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
            <Stack gap="2">
                <Text fontWeight="semibold">Downloads</Text>
                {DOWNLOAD_LINKS.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        colorPalette="teal"
                        download
                    >
                        <LuDownload />
                        {link.label}
                    </Link>
                ))}
            </Stack>
        </Box>
    );
};
