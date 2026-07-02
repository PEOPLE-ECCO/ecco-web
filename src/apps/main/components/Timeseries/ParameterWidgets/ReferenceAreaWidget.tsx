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
    const [outputMetrics, setOutputMetrics] = useState<OutputMetric[]>([]);
    const [referenceAreaId, setReferenceAreaId] = useState<number | undefined>();
    const [restorationSiteId, setRestorationSiteId] = useState<number | undefined>();

    const hasMetrics = outputMetrics.length > 0;

    // The reference area is only relevant (and required) when the R80P metric is
    // among the selected metrics.
    const referenceAreaRequired = outputMetrics.includes("R80P");

    const toggleMetric = (metric: OutputMetric) => {
        setOutputMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    // The restoration site is always mandatory and shared across all selected
    // metrics. The reference area is only required when the R80P metric is
    // selected, and is likewise shared.
    useEffect(() => {
        onChange({
            params: {
                output_metrics: outputMetrics,
                reference_area_id: referenceAreaRequired ? referenceAreaId : undefined,
                restoration_site_id: restorationSiteId,
                expandable: false
            },
            valid:
                hasMetrics &&
                restorationSiteId != null &&
                (!referenceAreaRequired || referenceAreaId != null),
            timespan: DEFAULT_TIMESPAN,
        });
    }, [outputMetrics, hasMetrics, referenceAreaRequired, referenceAreaId, restorationSiteId, onChange]);

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

            {/* Step 1: choose one or more output metrics. */}
            <Field.Root required>
                <Field.Label>
                    Output Metrics <Field.RequiredIndicator />
                    <Tooltip content="Dummy help: the metrics to compute for this time series. All selected metrics share the same restoration site (and reference area, if R80P is included)." showArrow>
                        <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                    </Tooltip>
                </Field.Label>
                <Stack gap="1">
                    {OUTPUT_METRIC_OPTIONS.map((metric) => (
                        <label
                            key={metric}
                            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                        >
                            <input
                                type="checkbox"
                                checked={outputMetrics.includes(metric)}
                                onChange={() => toggleMetric(metric)}
                            />
                            <Text fontSize="sm">{metric}</Text>
                        </label>
                    ))}
                </Stack>
            </Field.Root>

            {/* Step 2: only shown once at least one output metric is chosen. */}
            {hasMetrics && (
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
