// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Box,
    Button,
    Stack,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Flex
} from "@open-pioneer/chakra-integration";
import { Job } from "../../views/Sites/SiteDetails/SiteDetails";
import { FiMoreVertical } from "react-icons/fi";
import { TimeseriesAddBtn } from "./TimeseriesAddBtn";

interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export interface Timeseries {
    id: number;
    scenario_id: number;
    name: string;
    description: string;
    jobs: Job[];
}

export function Timeseries({ timeseries, onSelect }: TimeseriesProps) {
    const title = "TITLE";
    
    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm">
            <Stack gap="4">
                <Text fontWeight="700" fontSize={18}>{title}</Text>
                <Accordion allowToggle allowMultiple>
                    {timeseries?.map((ts, key) => (
                        <AccordionItem key={key}>
                            <AccordionButton bg="white" display="flex" alignItems="center">
                                <Box as="span" flex="1" textAlign="left" fontWeight="700">
                                    {ts.name}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel pb={4} bg="white">
                                <Flex justify="space-between" align="center" mb={1}>
                                    <Text fontWeight="medium">Description:</Text>
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<FiMoreVertical />}
                                            variant="ghost"
                                            aria-label="Options"
                                        />
                                        <MenuList>
                                            <MenuItem onClick={() => handleDelete(ts)}>Delete</MenuItem>
                                            <MenuItem onClick={() => handleArchive(ts)}>Archive</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                                <Text mb={4} whiteSpace="pre-wrap">{ts.description}</Text>
                                <Button onClick={() => onSelect(ts)}>View on Map</Button>
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>

                <TimeseriesAddBtn />
                
            </Stack>
        </Box>
    );
}
