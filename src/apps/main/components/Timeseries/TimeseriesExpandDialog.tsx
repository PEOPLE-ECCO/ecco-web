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
    Field,
    Box,
    CloseButton
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { useState, useEffect, FC } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useService } from "open-pioneer:react-hooks";
import { NotificationService } from "@open-pioneer/notifier";

import { JobParameters, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { ActionButton } from "./ActionButton";

import { setHeapSnapshotNearHeapLimit } from "v8";
import { EventEmitter } from "@open-pioneer/core";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";


interface CreateJobProps {
    timeseries: Timeseries;
    eventListener: EventEmitter<Events>;
}

interface SelectedDateMeta {
    date: Date;
    formattedDate: string;
}

export const CreateJob: FC<CreateJobProps> = (props: CreateJobProps) => {
    const { id } = useParams();
    const { createJob } = useServices();

    const [expandButtonDisabled, setExpandButtonDisabled] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<Date | null>();
    const [endDate, setEndDate] = useState<Date | null>();
    const [jobParams, setJobParams] = useState<JobParameters>();
    const [selectedTimeseries, _] = useState<Timeseries>(props.timeseries);

    const notificationService = useService<NotificationService>("notifier.NotificationService");

    const handleChangeRaw = (
        value: string,
        selectedDateMeta?: SelectedDateMeta | null,
    ) => {
        console.log(
            selectedDateMeta
                ? `Selected Date Meta: ${JSON.stringify(selectedDateMeta)}`
                : "No Selection Meta is available",
        );
    };

    const cancel = (buttonType: string) => {
        console.log(`Button clicked: ${buttonType}`);
    };

    const handleExitClick = () => {
        setStartDate(null);
        setEndDate(null);
        setJobParams({ timespan: [null, null] });
    };

    useEffect(() => {
        if (startDate != null && endDate != null) {
            setExpandButtonDisabled(false);
            setJobParams({ timespan: [startDate, endDate] });
        }
        else {
            setExpandButtonDisabled(true);
        }
    }, [startDate, endDate]);

    const create = async () => {
        const created = await createJob(id!, selectedTimeseries!.id, jobParams!);
        handleExitClick();
        notificationService.notify({
            title: "Job created",
            message: created,
            level: "info",
            displayDuration: 5000,
        });
    };


    return (
        <>
            <Dialog.Root size="md" placement="center">
                <Dialog.Trigger asChild>
                    <Button size="md" width="40%" bg="#2C7D75" _hover={{ bg: "teal.700" }}>
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
                                <Stack pt="4" direction="row" maxW="md">
                                    <Field.Root>
                                        <Field.Label>Start Date</Field.Label>
                                        <Box
                                            borderWidth={"1px"}
                                            css={{ "--focus-color": "#2C7D75" }}>
                                            <DatePicker
                                                showIcon
                                                isClearable
                                                selected={startDate}
                                                onChange={(date: Date | null) => setStartDate(date)}
                                                startDate={startDate}
                                                placeholderText="mm/dd/yyy"
                                                onChangeRaw={(
                                                    event:
                                                        | React.MouseEvent<HTMLElement>
                                                        | React.KeyboardEvent<HTMLElement>
                                                        | React.ChangeEvent<HTMLInputElement>,
                                                    selectedDateMeta?: SelectedDateMeta | null,
                                                ) => {
                                                    if (event.target instanceof HTMLInputElement) {
                                                        handleChangeRaw(event.target.value, selectedDateMeta);
                                                    }
                                                }} />
                                        </Box>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label>End Date</Field.Label>
                                        <Box
                                            borderWidth={"1px"}>
                                            <DatePicker
                                                showIcon
                                                isClearable
                                                selected={endDate}
                                                onChange={(date: Date | null) => setEndDate(date)}
                                                endDate={endDate}
                                                startDate={startDate}
                                                minDate={startDate}
                                                placeholderText="mm/dd/yyy" />
                                        </Box>
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.CloseTrigger asChild>
                                    <ActionButton
                                        disabled={expandButtonDisabled}
                                        label="Expand"
                                        tooltip="Expand timeseries"
                                        onClick={() => {
                                            create();
                                        }}
                                        w={"170px"}>
                                    </ActionButton>
                                </Dialog.CloseTrigger>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton height="10" variant="outline" order="2" size="md" color="black" border="1px solid #2C7D75" _hover={{ bg: "teal.50" }} onClick={handleExitClick} />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};