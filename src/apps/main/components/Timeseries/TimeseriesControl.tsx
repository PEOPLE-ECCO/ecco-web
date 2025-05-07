// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, CardHeader, CardBody, Heading, Flex } from "@open-pioneer/chakra-integration";
import { TimeseriesIcons } from "./TimeseriesIcons";
import { TimeseriesActions } from "./TimeseriesActions";

interface TimeseriesControlProps {
    jobId: string;
    onDownloadCurrent: () => void;
}

export function TimeseriesControl({ jobId, onDownloadCurrent }: TimeseriesControlProps) {
    return (
        <Card marginTop="2%" w="100%">
            <CardHeader paddingBottom="2" paddingX="5" paddingTop="2">
                <Flex justify="space-between" align="center">
                    <Heading size="md">
                        Name: {jobId}
                    </Heading>
                    <TimeseriesIcons
                        onDocumentClick={() => console.log("Document clicked")}
                        onInfoClick={() => console.log("Info clicked")}
                        onLocateClick={() => console.log("Locate clicked")}
                    />
                </Flex>
            </CardHeader>
            <CardBody>
                <TimeseriesActions
                    onDownloadAll={() => console.log("Downloading all")}
                    onDownloadCurrent={onDownloadCurrent}
                    onExecute={() => console.log("Executing")}
                />
            </CardBody>
        </Card>
    );
}
