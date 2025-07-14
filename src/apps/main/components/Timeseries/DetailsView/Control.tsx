// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, CardHeader, CardBody, Flex, Text } from "@open-pioneer/chakra-integration";
import { ActionIcons } from "./ActionIcons";
import { Asset } from "../../definitions";

interface ControlProps {
    asset: Asset;
    onDownloadCurrent: () => void;
}

export function Control({ asset, onDownloadCurrent }: ControlProps) {

    return (
        <Card
            marginTop="2%"
            w="100%"
            borderWidth="2px"
            borderColor="orange"
            borderRadius="xl"
            boxShadow="lg"
            bg="white"
        >
            {asset &&
                <Flex direction="row" w="100%" align="flex-start">
                    <CardHeader paddingBottom="2" paddingX="5" paddingTop="2" w="70%">
                        <Flex direction="column" align="flex-start">
                            <Text><b>Name:</b> {asset.title}</Text>
                            <Text><b>Type:</b> {asset.type}</Text>
                            <Text><b>proj:epsg:</b> {asset["proj:epsg"]}</Text>
                            <Text><b>proj:bbox:</b> {asset["proj:bbox"].join(" ")}</Text>
                        </Flex>
                    </CardHeader>

                    <CardBody>
                        <ActionIcons
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
