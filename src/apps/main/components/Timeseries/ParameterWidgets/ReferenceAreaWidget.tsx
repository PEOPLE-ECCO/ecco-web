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

interface MetricOption {
    /** Metric name as sent to the backend in `output_metrics`. */
    value: string;
    description: string;
}

interface MetricConfig {
    metrics: MetricOption[];
    /** Whether the selected metrics need a reference area. */
    requiresReferenceArea: (selected: string[]) => boolean;
    referenceAreaHelp: string;
}

// seasonal-sen falls back to the restoration site's own baseline when no
// reference area is given, so only R80P insists on one.
const SENS_SLOPE_METRICS: MetricConfig = {
    metrics: [
        {
            value: "R80P",
            description:
                "how far the site has recovered towards 80% of the reference area's pre-restoration level. A value of 1 means that target is reached.",
        },
        {
            value: "percent_change",
            description:
                "the modelled change over the period, as a percentage of the baseline value: the reference area's if one is selected (for R80P), otherwise the restoration site's own.",
        },
        {
            value: "DeltaIR",
            description: "the total modelled change in the index across the analysis period.",
        },
        {
            value: "slope_intercept",
            description:
                "exports the raw Sen slope and intercept rasters the other metrics are derived from.",
        },
    ],
    requiresReferenceArea: (selected) => selected.includes("R80P"),
    referenceAreaHelp:
        "The undisturbed area the restoration site is compared against. Its value before restoration began — by default averaged over the three preceding years — is the baseline R80P and percent change are measured against.",
};

// spectral-recovery always derives a recovery target from the reference area,
// whichever metrics are selected, so it is always required. The metrics must
// match `METRIC_STYLES` in spectral-recovery; it rejects any others.
const SPECTRAL_RECOVERY_METRICS: MetricConfig = {
    metrics: [
        {
            value: "R80P",
            description:
                "how far the site has reached 80% of the recovery target, the reference area's median index value. A value of 1 means that target is reached.",
        },
        {
            value: "deltaIR",
            description:
                "the absolute change in the index from the start of restoration to the end of the analysis period.",
        },
        {
            value: "YrYr",
            description:
                "the average annual recovery rate from the start of restoration to the end of the analysis period.",
        },
        {
            value: "Y2R",
            description: "the number of years the site took to first reach 80% of the recovery target.",
        },
        {
            value: "RRI",
            description:
                "the recovery since restoration started, relative to the drop in the index caused by the disturbance.",
        },
    ],
    requiresReferenceArea: () => true,
    referenceAreaHelp:
        "The undisturbed area the restoration site is compared against. Its median index value from the start of restoration to the end of the analysis period is the recovery target all metrics are measured against.",
};

// This widget has no time-range UI, but the create wizard still auto-starts a
// first job that needs a timespan. Default to a full-year range; the user can
// re-run other ranges from the Expand dialog afterwards.
const DEFAULT_TIMESPAN = { start: new Date(2020, 0, 1), end: new Date(2022, 11, 31) };

export function ReferenceAreaWidget({ process, onChange }: ParameterWidgetProps) {
    const referenceAreaOptions = process.parameters.preprocess?.reference_bap ?? [];
    const restorationSiteOptions = process.parameters.preprocess?.restoration_bap ?? [];
    // The widget serves both VPT processes; their metrics and reference area
    // requirements differ.
    const metricConfig =
        process.name === "VPT - Spectral Recovery" ? SPECTRAL_RECOVERY_METRICS : SENS_SLOPE_METRICS;
    const [outputMetrics, setOutputMetrics] = useState<string[]>([]);
    const [referenceAreaId, setReferenceAreaId] = useState<number | undefined>();
    const [restorationSiteId, setRestorationSiteId] = useState<number | undefined>();

    const hasMetrics = outputMetrics.length > 0;

    const referenceAreaRequired = metricConfig.requiresReferenceArea(outputMetrics);

    const toggleMetric = (metric: string) => {
        setOutputMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    // The restoration site is always mandatory and shared across all selected
    // metrics. The reference area is required depending on the process and the
    // selected metrics, and is likewise shared.
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
                <Text as="div" fontSize="sm" color="gray.600" width="100%">
                    Hover over the info icon next to each field for details.<br></br>
                    <b>Available Metrics</b>
                    <ul>
                        {metricConfig.metrics.map((m) => (
                            <li key={m.value}>{m.value}: {m.description}</li>
                        ))}
                    </ul>
                </Text>
            </Box>

            {/* Step 1: choose one or more output metrics. */}
            <Field.Root required>
                <Field.Label>
                    Output Metrics <Field.RequiredIndicator />
                    <Tooltip content="Which metrics to compute for this time series. All of them are computed for the same restoration site, and share the same reference area." showArrow>
                        <Icon as={LuInfo} ml="1" color="gray.500" cursor="help" boxSize="3.5" />
                    </Tooltip>
                </Field.Label>
                <Stack gap="1">
                    {metricConfig.metrics.map(({ value: metric }) => (
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
                                <Tooltip content={metricConfig.referenceAreaHelp} showArrow>
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
                            Base Area <Field.RequiredIndicator />
                            <Tooltip content="The restoration site this time series is computed for." showArrow>
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
