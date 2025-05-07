// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { SliderThumb, Icon } from "@open-pioneer/chakra-integration";

export function SliderCircle() {
    return (
        <SliderThumb zIndex="99">
            <Icon viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="100" fill="orange" />
            </Icon>
        </SliderThumb>
    );
}
