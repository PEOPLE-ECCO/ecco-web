// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Heading,
    Button,
    Flex,
    Stack,
    Dialog,
    Portal,
    Text,
    Field
} from "@chakra-ui/react";
import { FC } from "react";
import { useNavigate, useParams } from "react-router";
import { useServices } from "../../services/Services";
import { ActionButton } from "./ActionButton";

import { setHeapSnapshotNearHeapLimit } from "v8";
import { CloseButton } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { JobParameters, Timeseries } from "../definitions";

interface CreateJobProps {
    timeseries: Timeseries;
}

export const CreateJob = (props: CreateJobProps) => {
    const { id, ts_id } = useParams();
    const { createJob } = useServices();

    const [expandButtonDisabled, setExpandButtonDisabled] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<Date | null>();
    const [endDate, setEndDate] = useState<Date | null>();
    const [jobParams, setJobParams] = useState<JobParameters>();
    const [selectedTimeseries, _] = useState<Timeseries>(props.timeseries);

    const cancel = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const navigate = useNavigate();
    const handleExitClick = () => {
        navigate(0);
    };

    useEffect(() => {
        if (startDate != null && endDate != null) {
            setExpandButtonDisabled(false);
            setJobParams({timespan:[startDate, endDate]});
        }
        else {
            setExpandButtonDisabled(true);
        }
    }, [startDate, endDate]);

    const create = async (buttonType: string) => {
        console.log(`Button clicked: ${buttonType} ${selectedTimeseries}`);

        const created = await createJob(id!, selectedTimeseries!.id, jobParams!);

        alert("Created Job: " + created);
        handleExitClick();
    };


    return (
        <>
            <Dialog.Root size="md" placement="center">
                <Dialog.Trigger asChild>
                    <Button size="md" width="45%" bg="#2C7D75">
                        Expand Timeseries
                    </Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <Flex gap="4">
                                        <Heading height="12" size="lg" order="1">
                                            Expand Timeseries
                                        </Heading>
                                    </Flex>
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text pb="2" textStyle="lg">Please select Timespan:</Text>
                                <Stack pt="4" gap="4" align="flex-start" maxW="md">
                                    <Field.Root>
                                        <Field.Label>Start Date</Field.Label>
                                        <DatePicker
                                            showIcon
                                            selected={startDate}
                                            onChange={(date: Date | null) => setStartDate(date)}
                                            startDate={startDate}
                                            isClearable
                                            placeholderText="mm/dd/yyy" />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>End Date</Field.Label>
                                        <DatePicker
                                            showIcon
                                            selected={endDate}
                                            onChange={(date: Date | null) => setEndDate(date)}
                                            endDate={endDate}
                                            startDate={startDate}
                                            minDate={startDate}
                                            isClearable
                                            placeholderText="mm/dd/yyy" />
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <ActionButton
                                    disabled={expandButtonDisabled}
                                    label="Expand"
                                    tooltip="Expand timeseries"
                                    onClick={() => create("create")}
                                    w={"170px"}></ActionButton>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton height="10" variant="outline" order="2" size="md" colorPalette="teal" onClick={handleExitClick} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};