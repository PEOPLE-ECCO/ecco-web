// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Circle, Icon, Slider } from "@chakra-ui/react";

export function SliderCircle() {
    return (
        <Slider.Thumb index={0} zIndex="99">
            <Icon viewBox="0 0 200 200">
                <Circle cx="100" cy="100" r="100" fill="orange" />
            </Icon>
        </Slider.Thumb>
    );
}
