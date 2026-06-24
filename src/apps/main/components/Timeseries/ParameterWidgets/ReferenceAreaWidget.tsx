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
    const referenceAreas = process.parameters.preprocess_options ?? [];
    const [referenceAreaId, setReferenceAreaId] = useState<number | undefined>();

    // A reference area is mandatory, so the widget is only valid once one is selected.
    useEffect(() => {
        onChange({
            params: { reference_area_id: referenceAreaId },
            valid: referenceAreaId != null,
        });
    }, [referenceAreaId, onChange]);

    return (
        <Stack pt="4" gap="5" maxW="lg">
            {/* Intro help text */}
            <Box bg="gray.50" borderWidth="1px" borderColor="gray.200" borderRadius="md" p="3">
                <Text fontSize="sm" color="gray.600">
                    Select the reference area against which this time series will be compared.
                    Hover over the info icon next to the field for details.
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
                        {referenceAreas.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </Field.Root>
            </HStack>
        </Stack>
    );
}
