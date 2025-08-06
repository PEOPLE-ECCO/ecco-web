// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
import { SwitchCheckedChangeDetails, SimpleGrid, GridItem, Box, Switch, Text, Flex } from "@chakra-ui/react";

import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { useServices } from "../../services/Services";
import { Site } from "../Sites/Site/Site";
import { Dataset } from "../../components/Dataset/Dataset";
import { UploadDataset } from "../../components/Dataset/UploadDataset";

register(proj4);

export const DataInventory: FC = () => {
    const { getScenarios } = useServices();
    const [sites, setSites] = useState<[Site]>();
    const [showArchived, setShowArchived] = useState<boolean>(false); // Track state of the switch

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const data = await getScenarios();
                setSites(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchScenarios();
    }, []);

    const handleSwitchChange = (details: SwitchCheckedChangeDetails) => {
        console.log("switched to", details.checked);
        setShowArchived(details.checked);
    };

    return (
        <GridItem colSpan={12} rowSpan={12} margin="2px" padding="2px">
            {/* Switcher to show/hide archived datasets */}
            <Box position="absolute" top="120px" right="20px">
                <Flex align="center">
                    <Text mr="2">Show Archived</Text>
                    <Switch.Root
                            isChecked={showArchived} 
                            onCheckedChange={handleSwitchChange}
                    >
                        <Switch.HiddenInput />
                    </Switch.Root>
                </Flex>
            </Box>

            {/* Dataset Grid */}
            <SimpleGrid spacing={4} templateColumns="repeat(auto-fill, minmax(200px, 1fr))">
                {sites && sites.map((site) =>
                    <Dataset key={site.id} {...site} />
                )}
                <UploadDataset />
            </SimpleGrid>
        </GridItem>
    );
};
