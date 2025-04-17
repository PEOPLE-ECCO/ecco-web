// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Button, UnorderedList, ListItem } from "@open-pioneer/chakra-integration";
import { Job } from "../../views/Sites/SiteDetails/SiteDetails";

interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export interface Timeseries {
    id: number
    scenario_id: number
    name: string
    description: string
    jobs: Job[]
}

export function Timeseries({ timeseries, onSelect }: TimeseriesProps) {
    return (
        <Accordion>
            {timeseries?.map((ts, key) => (
                <AccordionItem key={key}>
                    <h2>
                        <AccordionButton bg="white">
                            <Box as="span" flex="1" textAlign="left">
                                {ts.name}
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4} bg="white">
                        <UnorderedList>
                            <ListItem>ID: {ts.id}</ListItem>
                            <ListItem>Description: {ts.description}</ListItem>
                        </UnorderedList>
                        <Button onClick={() => onSelect(ts)}>View on Map</Button>
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
