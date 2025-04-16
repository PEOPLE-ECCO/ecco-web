// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FC, useEffect, useState } from "react";
import { SimpleGrid, GridItem} from "@open-pioneer/chakra-integration";

import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { useServices } from "../../services/Services";
import { Site } from "./Site/Site";

register(proj4);

export const Sites: FC = () => {
    const { getScenarios } = useServices();
    const [sites, setSites] = useState<[Site]>();

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

    return (
        <GridItem colSpan={12} rowSpan={12} margin="2px" padding="2px">
            <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
                {sites && sites.map((site) =>
                    <Site key={site.id} {...site} />
                )}
            </SimpleGrid>
        </GridItem>
    );
};
