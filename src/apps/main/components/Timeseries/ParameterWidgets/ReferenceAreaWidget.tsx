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

export function ReferenceAreaWidget({ process, onChange }: ParameterWidgetProps) {
    const areaOptions = process.parameters.preprocess_options ?? [];
    const [referenceAreaId, setReferenceAreaId] = useState<number | undefined>();
    const [restorationSiteId, setRestorationSiteId] = useState<number | undefined>();

    // Both a reference area and a restoration site are mandatory, so the widget
    // is only valid once both are selected.
    useEffect(() => {
        onChange({
            params: {
                reference_area_id: referenceAreaId,
                restoration_site_id: restorationSiteId,
            },
            valid: referenceAreaId != null && restorationSiteId != null,
        });
    }, [referenceAreaId, restorationSiteId, onChange]);

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Select the reference area against which this time series will be compared,
                    and the restoration site it applies to. Hover over the info icon next to
                    each field for details.
                </Text>
            </Box>

            <HStack gap="4" align="flex-end">
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
                        {areaOptions.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </Field.Root>

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
                        {areaOptions.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </Field.Root>
            </HStack>
        </Stack>
    );
}
