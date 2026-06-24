// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { Box, Field, Stack } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TimespanPickerProps {
    startDate: Date | null | undefined;
    endDate: Date | null | undefined;
    onStartChange: (date: Date | null) => void;
    onEndChange: (date: Date | null) => void;
}

/**
 * Start/End date pickers used to select the timespan of a job. The end date is
 * constrained to be on or after the start date.
 */
export function TimespanPicker({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
}: TimespanPickerProps) {
    return (
        <Stack pt="4" direction="row" maxW="md">
            <Field.Root>
                <Field.Label>Start Date</Field.Label>
                <Box borderWidth={"1px"} css={{ "--focus-color": "#2C7D75" }}>
                    <DatePicker
                        showIcon
                        isClearable
                        selected={startDate}
                        onChange={onStartChange}
                        startDate={startDate}
                        placeholderText="mm/dd/yyyy" />
                </Box>
            </Field.Root>
            <Field.Root>
                <Field.Label>End Date</Field.Label>
                <Box borderWidth={"1px"}>
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
        </Stack>
    );
}
