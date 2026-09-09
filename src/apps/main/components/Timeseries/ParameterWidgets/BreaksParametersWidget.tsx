// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { Box, Field, Flex, Icon, Input, Stack, Text } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";

import { Tooltip } from "../../tooltip";
import { ParameterWidgetProps } from "./types";
import { DEFAULT_TIMESPAN } from "./constants";

const selectStyle: React.CSSProperties = {
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    padding: "8px 12px",
    minWidth: "150px",
    fontSize: "14px",
};

const DEFAULT_BREAK_THRESHOLD = 0.025;
const DEFAULT_INDEX_SCALE = 1000;

/** A field label with an info icon that reveals help text on hover. */
function LabelWithHelp({ label, help }: { label: React.ReactNode; help: string }) {
    return (
        <Field.Label>
            {label}
            <Tooltip content={help} showArrow>
                <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
            </Tooltip>
        </Field.Label>
    );
}

/**
 * Parameters for the break detection itself. It runs on the output of a
 * previously computed BAP (Breaks) time series, which is picked from the
 * available ones the same way the reference area is in {@link ReferenceAreaWidget}.
 */
export function BreaksParametersWidget({ process, onChange }: ParameterWidgetProps) {
    const breaksBapOptions = process.parameters.preprocess?.breaks_bap ?? [];
    const [breaksBapId, setBreaksBapId] = useState<number | undefined>();
    // Kept as strings so a half-typed value ("0.", "-") does not fight the input.
    // Neither value is restricted to a range; the backend decides what is sensible.
    const [breakThreshold, setBreakThreshold] = useState(String(DEFAULT_BREAK_THRESHOLD));
    const [indexScale, setIndexScale] = useState(String(DEFAULT_INDEX_SCALE));

    const thresholdValue = parseFloat(breakThreshold);
    const scaleValue = parseFloat(indexScale);
    const thresholdValid = !isNaN(thresholdValue);
    const scaleValid = !isNaN(scaleValue);

    useEffect(() => {
        onChange({
            params: {
                breaks_bap_id: breaksBapId,
                break_threshold: thresholdValid ? thresholdValue : undefined,
                index_scale: scaleValid ? scaleValue : undefined,
                expandable: false,
            },
            valid: breaksBapId != null && thresholdValid && scaleValid,
            timespan: DEFAULT_TIMESPAN,
        });
    }, [breaksBapId, thresholdValue, thresholdValid, scaleValue, scaleValid, onChange]);

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Dummy: Break detection runs on an existing BAP time series. Pick the
                    series to analyse and configure the detection parameters below. Hover over
                    the info icon next to each field for details.
                </Text>
            </Box>

            <Field.Root required>
                <LabelWithHelp
                    label={<>BAP Series <Field.RequiredIndicator /></>}
                    help="Dummy help: the previously computed BAP time series whose composites the break detection runs on."
                />
                <select
                    value={breaksBapId ?? ""}
                    style={selectStyle}
                    onChange={(e) => {
                        const id = parseInt(e.target.value);
                        setBreaksBapId(isNaN(id) ? undefined : id);
                    }}
                >
                    <option value="" disabled>Select a BAP series</option>
                    {breaksBapOptions.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                </select>
            </Field.Root>

            <Flex gap="4" wrap="wrap" align="flex-start">
                <Field.Root maxW="175px" required invalid={!thresholdValid}>
                    <LabelWithHelp
                        label={<>Break threshold <Field.RequiredIndicator /></>}
                        help="Dummy help: magnitude a change must exceed to be reported as a break."
                    />
                    <Input
                        type="number"
                        value={breakThreshold} step="any"
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => setBreakThreshold(e.target.value)}
                    />
                    <Field.ErrorText>Enter a number</Field.ErrorText>
                </Field.Root>
                <Field.Root maxW="175px" required invalid={!scaleValid}>
                    <LabelWithHelp
                        label={<>Index scale <Field.RequiredIndicator /></>}
                        help="Dummy help: factor the index values are scaled by (e.g. 10000 for integer-encoded reflectance indices)."
                    />
                    <Input
                        type="number"
                        value={indexScale} step="any"
                        css={{ "--focus-color": "#2C7D75" }}
                        onChange={(e) => setIndexScale(e.target.value)}
                    />
                    <Field.ErrorText>Enter a number</Field.ErrorText>
                </Field.Root>
            </Flex>
        </Stack>
    );
}
