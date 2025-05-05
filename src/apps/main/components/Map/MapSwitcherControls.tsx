// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { FormControl, FormLabel, Switch } from "@open-pioneer/chakra-integration";
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
            <FormControl
                zIndex="1000"
                bg="white"
                borderRadius="md"
                padding="2"
                boxShadow="md"
            >
                <FormLabel htmlFor="highlight-switch" mb="0">
                    Zoomer
                </FormLabel>
                <Switch
                    id="highlight-switch"
                    isChecked={isChecked}
                    onChange={(e) => onToggle(e.target.checked)}
                />
            </FormControl>
        </MapAnchor>
    );
}
