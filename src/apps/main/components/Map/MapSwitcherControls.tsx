// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Field, Switch } from "@chakra-ui/react";
import { MapAnchor } from "@open-pioneer/map";

interface MapSwitcherControlsProps {
    isChecked: boolean;
    onToggle: (checked: boolean) => void;
}

export function MapSwitcherControls({
    isChecked,
    onToggle
}: MapSwitcherControlsProps) {
    return (
        <MapAnchor position="bottom-right" horizontalGap={10} verticalGap={130}>
            <Field.Root
                zIndex="1000"
                bg="white"
                borderRadius="md"
                padding="2"
                boxShadow="md"
            >
                <Field.Label htmlFor="highlight-switch" mb="0">
                    Zoomer
                </Field.Label>
                <Switch.Root
                    id="highlight-switch"
                    checked={isChecked}
                    onChange={(e) => onToggle(e.target.checked)}
                >
                    <Switch.Control bgColor={"#2C7D75"}/>
                </Switch.Root>
            </Field.Root>
        </MapAnchor>
    );
}
