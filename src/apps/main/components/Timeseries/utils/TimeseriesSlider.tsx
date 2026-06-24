// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Card, Center, Circle, Icon, Slider } from "@chakra-ui/react";
import { Job, JobResult } from "../../definitions";
import { SliderCircle } from "../../Slider/SliderCircle";
import { EventEmitter } from "@open-pioneer/core";
import { Events } from "../../../views/Sites/SiteDetails/SiteDetails";

interface TimeseriesSliderProps {
    jobs: Job[] | undefined;
    jobResults: JobResult[];
    eventListener: EventEmitter<Events>;
}

export function TimeseriesSlider({ jobs, jobResults, eventListener }: TimeseriesSliderProps) {
    return (
        <Card.Root w="100%" padding={4}>
            <Card.Body>
                {jobs && jobResults.length > 0 && (
                    <Center w="100%">
                        <Slider.Root
                            colorPalette={"teal"}
                            w="75%"
                            step={1}
                            max={jobResults.length - 1}
                            defaultValue={[0]}
                            onValueChangeEnd={(val) => {
                                console.log("onChangeEnd" + val.value);
                                //eventListener.emit("selectedJobResult", val.value[0]!);
                            }
                            }
                        >
                            <Slider.Control>
                                {jobResults.map((jobResult, index) => (
                                    <>
                                        <Slider.Marker key={index} value={index} pt={12} ml="-50" w={"100%"}>
                                            {jobResult.filename}
                                        </Slider.Marker>
                                        <Slider.Marker
                                            zIndex="98"
                                            ml="-0.5em"
                                            mt="-0.9em"
                                            key={index}
                                            value={index}
                                        >
                                            <Icon viewBox="0 0 200 200">
                                                <Circle cx="100" cy="100" r="75" fill="black" />
                                            </Icon>
                                        </Slider.Marker>
                                    </>
                                ))}
                                <Slider.Track >
                                    <Slider.Range />
                                </Slider.Track>
                                <SliderCircle />
                            </Slider.Control>
                        </Slider.Root>
                    </Center>
                )}
            </Card.Body>
        </Card.Root>
    );
}
