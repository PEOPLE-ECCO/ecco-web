// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, CardHeader, CardBody, Flex, Text } from "@open-pioneer/chakra-integration";
import { Asset } from "../definitions";
import { TimeseriesIcons } from "./TimeseriesIcons";

interface TimeseriesControlProps {
    asset: Asset;
    onDownloadCurrent: () => void;
}

export function TimeseriesControl({ asset, onDownloadCurrent }: TimeseriesControlProps) {

    return (
        <Card 
            marginTop="2%"
            w="70%"
            borderRadius="xl"
            boxShadow="lg"
            bg="white"
        >
            {asset &&
            <Flex direction="column" w="100%" align="flex-start">
                <CardHeader paddingBottom="2" paddingX="5" paddingTop="2" w="70%">
                    <Flex direction="column" align="flex-start">
                        <Text><b>Name:</b> {asset.title}</Text>
                        <Text><b>Type:</b> {asset.type}</Text>
                        <Text><b>proj:epsg:</b> {asset["proj:epsg"]}</Text>
                        <Text><b>proj:bbox:</b> {asset["proj:bbox"].join(" ")}</Text>
                    </Flex>
                </CardHeader>
                <CardBody>
                    <TimeseriesIcons
                        downloadCurrentResult={onDownloadCurrent}
                        downloadAllResults={() => console.log("Downloading all")}
                        execute={() => console.log("Executing")}
                        downloadProcessGraph={() => console.log("Document clicked")}
                        inspect={() => console.log("Info clicked")}
                        locate={() => console.log("Locate clicked")}
                    />
                </CardBody>
            </Flex>
            }
        </Card>
    );
}
