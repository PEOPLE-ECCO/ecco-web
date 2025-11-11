// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, Flex, HStack } from "@chakra-ui/react";
import { TimeseriesIcons } from "./TimeseriesIcons";
import { TimeseriesActions } from "./TimeseriesActions";
import { Timeseries } from "../definitions";

interface TimeseriesControlProps {
    Timeseries: Timeseries;
}

export function TimeseriesControl({ Timeseries }: TimeseriesControlProps) {
    return (
        <Card.Root marginTop="2%" w="100%">
            {Timeseries &&
                <>
                    <Card.Header paddingBottom="2" paddingX="5" paddingTop="2">
                        Timeseries Info
                    </Card.Header>
                    <Card.Body>
                        <HStack>
                            <Flex justify="space-between" align="center">
                                <br></br>
                                <TimeseriesIcons
                                    onDocumentClick={() => console.log("Document clicked")}
                                    onInfoClick={() => console.log("Info clicked")}
                                    onLocateClick={() => console.log("Locate clicked")}
                                />
                            </Flex>
                        </HStack>
                    </Card.Body>
                </>
            }
        </Card.Root>
    );
}
