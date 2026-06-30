// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Field, Stack, HStack, Text, Icon } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Tooltip } from "../../tooltip";

interface TimespanWidgetProps {
    startDate: Date | null | undefined;
    endDate: Date | null | undefined;
    onStartChange: (date: Date | null) => void;
    onEndChange: (date: Date | null) => void;
}

/**
 * Selects the timespan of the first job started for a new time series. The end
 * date is constrained to be on or after the start date. Styled to match the
 * parameter widgets (e.g. {@link ReferenceAreaWidget}) so it sits naturally
 * alongside them in the Process Selection step.
 */
export function TimespanWidget({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
}: TimespanWidgetProps) {
    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Select the timespan for which the first job of this time series will be
                    computed. The end date must be on or after the start date.
                </Text>
            </Box>

            <HStack gap="4" align="flex-end">
                <Field.Root required>
                    <Field.Label>
                        Start Date <Field.RequiredIndicator />
                        <Tooltip content="Dummy help: first date (inclusive) of the analysis period." showArrow>
                            <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                        </Tooltip>
                    </Field.Label>
                    <Box borderWidth="1px" css={{ "--focus-color": "#2C7D75" }}>
                        <DatePicker
                            showIcon
                            isClearable
                            selected={startDate}
                            onChange={onStartChange}
                            startDate={startDate}
                            placeholderText="mm/dd/yyyy" />
                    </Box>
                </Field.Root>

                <Field.Root required>
                    <Field.Label>
                        End Date <Field.RequiredIndicator />
                        <Tooltip content="Dummy help: last date (inclusive) of the analysis period." showArrow>
                            <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                        </Tooltip>
                    </Field.Label>
                    <Box borderWidth="1px">
                        <DatePicker
                            showIcon
                            isClearable
                            selected={endDate}
                            onChange={onEndChange}
                            endDate={endDate}
                            startDate={startDate}
                            minDate={startDate}
                            placeholderText="mm/dd/yyyy" />
                    </Box>
                </Field.Root>
            </HStack>
        </Stack>
    );
}
