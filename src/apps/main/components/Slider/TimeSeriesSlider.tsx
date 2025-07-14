// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Fragment } from "react";
import {
    Slider,
    SliderTrack,
    SliderMark,
    Icon,
    Center
} from "@open-pioneer/chakra-integration";
import { SliderCircle } from "./SliderCircle";
import { Asset } from "../definitions";

interface AssetSliderProps {
    groupAssets: Asset[];
    onSelectAsset: (index: number) => void;
}

export function TimeSeriesSlider({ groupAssets, onSelectAsset }: AssetSliderProps) {
    return (
        <Center w="100%">
            <Slider
                w="75%"
                aria-label="slider"
                step={1}
                max={groupAssets.length - 1}
                defaultValue={0}
                onChangeEnd={(val) => onSelectAsset(val)}
            >
                {groupAssets.map((asset, index) => (
                    <Fragment key={index}>
                        <SliderMark value={index} pt={3} ml="-50" w="100%">
                            {asset.title.substring(7, asset.title.length - 5)}
                        </SliderMark>
                        <SliderMark
                            zIndex="98"
                            ml="-0.5em"
                            mt="-0.9em"
                            value={index}
                        >
                            <Icon viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="75" fill="black" />
                            </Icon>
                        </SliderMark>
                    </Fragment>
                ))}
                <SliderTrack />
                <SliderCircle />
            </Slider>
        </Center>
    );
}
