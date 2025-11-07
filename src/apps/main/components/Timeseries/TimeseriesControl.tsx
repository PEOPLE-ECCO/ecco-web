// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, Flex, HStack } from "@chakra-ui/react";
import { TimeseriesIcons } from "./TimeseriesIcons";
import { TimeseriesActions } from "./TimeseriesActions";
import { JobResult } from "../definitions";

interface TimeseriesControlProps {
    jobResult: JobResult;
    onDownloadCurrent: () => void;
}

export function TimeseriesControl({ jobResult, onDownloadCurrent }: TimeseriesControlProps) {
    return (
        <Card.Root marginTop="2%" w="100%">
            {jobResult &&
                <>
                    <Card.Header paddingBottom="2" paddingX="5" paddingTop="2">
                        {jobResult.filename}
                    </Card.Header>
                    <Card.Body>
                        <HStack>
                            <Flex justify="space-between" align="center">
                                Type: {jobResult.type}
                                <br></br>
                                <TimeseriesIcons
                                    onDocumentClick={() => console.log("Document clicked")}
                                    onInfoClick={() => console.log("Info clicked")}
                                    onLocateClick={() => console.log("Locate clicked")}
                                />
                            </Flex>
                            <TimeseriesActions
                                onDownloadAll={() => console.log("Downloading all")}
                                onDownloadCurrent={onDownloadCurrent}
                                onExecute={() => console.log("Executing")}
                            />
                        </HStack>
                    </Card.Body>
                </>
            }
        </Card.Root>
    );
}
