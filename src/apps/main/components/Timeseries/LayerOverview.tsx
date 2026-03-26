// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Box,
    Stack,
    Text,
    Accordion,
    ScrollArea
} from "@chakra-ui/react";

import { useState } from "react";

import { EventEmitter } from "@open-pioneer/core";

import { Timeseries } from "../definitions";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";
import { ResultTreeOverview } from "./ResultTreeOverview";


interface LayerOverviewProps {
    timeseries?: Timeseries[]
    eventListener: EventEmitter<Events>
}


export function LayerOverview({ timeseries, eventListener }: LayerOverviewProps) {
    const [selectedTimeseries, setSelectedTimeseries] = useState<Timeseries>();

    const timeseriesSelection = (ts: Timeseries) => {
        eventListener.emit("selectedTimeseries", ts);
        setSelectedTimeseries(ts);
    };

    return (
        <>
            <Box bg="white" p="4" borderWidth="1px" borderRadius="md" boxShadow="sm">
                <Stack gap="4">
                    <Text fontWeight="700" fontSize={22}>Layer Overview</Text>
                    <Text fontSize={14}>View and compare all layers individually.</Text>
                    <Accordion.Root
                        multiple
                        onValueChange={(e) => {
                            const ts: Timeseries = timeseries![e.value[0]!];
                            timeseriesSelection(ts);
                        }}
                    >
                        {timeseries?.map((ts, key) => (
                            <Accordion.Item value={key} key={key}>
                                <Accordion.ItemTrigger bg="white" display="flex" alignItems="center">
                                    <Box as="span" flex="1" textAlign="left" fontWeight="700">
                                        {ts.name}
                                    </Box>
                                    <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <Accordion.ItemContent pb={4} bg="white">
                                    <ResultTreeOverview timeseries={ts} eventListener={eventListener} />
                                </Accordion.ItemContent>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                </Stack>
            </Box>
        </>
    );
}