// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from "react";
import { Box, Field, Stack, HStack, Text, Icon } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";

import { Tooltip } from "../../tooltip";
import { ParameterWidgetProps } from "./types";

const selectStyle: React.CSSProperties = {
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    padding: "8px 12px",
    minWidth: "150px",
    fontSize: "14px",
};

const OUTPUT_METRIC_OPTIONS = [
    "R80P",
    "percent_change",
    "DeltaIR",
    "slope_intercept",
] as const;

// This widget has no time-range UI, but the create wizard still auto-starts a
// first job that needs a timespan. Default to a full-year range; the user can
// re-run other ranges from the Expand dialog afterwards.
const DEFAULT_TIMESPAN = { start: new Date(2020, 0, 1), end: new Date(2022, 11, 31) };

type OutputMetric = (typeof OUTPUT_METRIC_OPTIONS)[number];

export function ReferenceAreaWidget({ process, onChange }: ParameterWidgetProps) {
    const referenceAreaOptions = process.parameters.preprocess?.reference_bap ?? [];
    const restorationSiteOptions = process.parameters.preprocess?.restoration_bap ?? [];
    const [outputMetric, setOutputMetric] = useState<OutputMetric | undefined>();
    const [referenceAreaId, setReferenceAreaId] = useState<number | undefined>();
    const [restorationSiteId, setRestorationSiteId] = useState<number | undefined>();

    // The reference area is only relevant (and required) for the R80P metric.
    const referenceAreaRequired = outputMetric === "R80P";

    // The restoration site is always mandatory. The reference area is only
    // required when the R80P metric is selected.
    useEffect(() => {
        onChange({
            params: {
                output_metric: outputMetric,
                reference_area_id: referenceAreaRequired ? referenceAreaId : undefined,
                restoration_site_id: restorationSiteId,
            },
            valid:
                outputMetric != null &&
                restorationSiteId != null &&
                (!referenceAreaRequired || referenceAreaId != null),
            timespan: DEFAULT_TIMESPAN,
        });
    }, [outputMetric, referenceAreaRequired, referenceAreaId, restorationSiteId, onChange]);

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600" width="100%">
                    Hover over the info icon next to each field for details.<br></br>
                    <b>Available Metrics</b>
                    <ul>
                        <li>
                            R80P: TODO
                        </li>
                        <li>
                            percent_change: TODO
                        </li>
                        <li>
                            deltaIR: TODO
                        </li>
                        <li>
                            slope_intercet: TODO
                        </li>
                    </ul>
                </Text>
            </Box>

            {/* Step 1: choose the output metric. */}
            <Field.Root required>
                <Field.Label>
                    Output Metric <Field.RequiredIndicator />
                    <Tooltip content="Dummy help: the metric to compute for this time series." showArrow>
                        <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                    </Tooltip>
                </Field.Label>
                <select
                    value={outputMetric ?? ""}
                    style={selectStyle}
                    onChange={(e) => {
                        const value = e.target.value;
                        setOutputMetric(value === "" ? undefined : (value as OutputMetric));
                    }}
                >
                    <option value="" disabled>Select an output metric</option>
                    {OUTPUT_METRIC_OPTIONS.map((metric) => (
                        <option key={metric} value={metric}>{metric}</option>
                    ))}
                </select>
            </Field.Root>

            {/* Step 2: only shown once an output metric is chosen. */}
            {outputMetric != null && (
                <HStack gap="4" align="flex-end">
                    {referenceAreaRequired && (
                        <Field.Root required>
                            <Field.Label>
                                Reference Area <Field.RequiredIndicator />
                                <Tooltip content="Dummy help: the previously configured reference area to use as the baseline." showArrow>
                                    <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                                </Tooltip>
                            </Field.Label>
                            <select
                                value={referenceAreaId ?? ""}
                                style={selectStyle}
                                onChange={(e) => {
                                    const id = parseInt(e.target.value);
                                    setReferenceAreaId(isNaN(id) ? undefined : id);
                                }}
                            >
                                <option value="" disabled>Select a reference area</option>
                                {referenceAreaOptions.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </Field.Root>
                    )}

                    <Field.Root required>
                        <Field.Label>
                            Restoration Site <Field.RequiredIndicator />
                            <Tooltip content="Dummy help: the restoration site this time series applies to." showArrow>
                                <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                            </Tooltip>
                        </Field.Label>
                        <select
                            value={restorationSiteId ?? ""}
                            style={selectStyle}
                            onChange={(e) => {
                                const id = parseInt(e.target.value);
                                setRestorationSiteId(isNaN(id) ? undefined : id);
                            }}
                        >
                            <option value="" disabled>Select a restoration site</option>
                            {restorationSiteOptions.map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </Field.Root>
                </HStack>
            )}
        </Stack>
    );
}
