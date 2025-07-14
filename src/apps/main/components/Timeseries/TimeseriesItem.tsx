// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Box,
    Stack,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Flex,
    SimpleGrid
} from "@open-pioneer/chakra-integration";
import { FiMoreVertical } from "react-icons/fi";
import { AddBtn } from "./AddBtn";
import { Timeseries } from "../definitions";
import { ActionButton } from "../Buttons/ActionButton";

interface TimeseriesProps {
    timeseries?: Timeseries[];
    onSelect: (ts: Timeseries) => void;
}

export function TimeseriesItem({ timeseries, onSelect }: TimeseriesProps) {

    const handleDelete = (ts: Timeseries) => {
        console.log("Delete:", ts);
    };

    const handleArchive = (ts: Timeseries) => {
        console.log("Archive:", ts);
    };

    const select = (ts: Timeseries) => {
        onSelect(ts);
    };


    return (
        <Box bg="white" p="4" borderRadius="md" boxShadow="sm" minW={"200px"}>
            <Stack gap="4">
                <Text fontWeight="700" fontSize={18}>Timeseries</Text>
                <Accordion allowToggle>
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

                                <SimpleGrid spacing={4} minChildWidth={"150px"}>
                                    <ActionButton label="View Details" tooltip="View Details" onClick={()=> select(ts)} />
                                </SimpleGrid>

                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
                <AddBtn />
            </Stack>
        </Box>
    );
}
