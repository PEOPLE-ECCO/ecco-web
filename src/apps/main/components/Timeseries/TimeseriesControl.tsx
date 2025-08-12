// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, Flex, HStack } from "@chakra-ui/react";
import { TimeseriesIcons } from "./TimeseriesIcons";
import { TimeseriesActions } from "./TimeseriesActions";
import { Asset } from "../definitions";

interface TimeseriesControlProps {
    asset: Asset;
    onDownloadCurrent: () => void;
}

export function TimeseriesControl({ asset, onDownloadCurrent }: TimeseriesControlProps) {

    return (
        <Card.Root marginTop="2%" w="100%">
            {asset &&
                <>
                    <Card.Header paddingBottom="2" paddingX="5" paddingTop="2">
                        {asset.title}
                    </Card.Header>
                    <Card.Body>
                        <HStack>
                            <Flex justify="space-between" align="center">
                                Type: {asset.type}
                                <br></br>
                                proj:epsg: {asset["proj:epsg"]}
                                <br></br>
                                proj:bbox: {asset["proj:bbox"][0]} {asset["proj:bbox"][1]} {asset["proj:bbox"][2]} {asset["proj:bbox"][3]}
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
