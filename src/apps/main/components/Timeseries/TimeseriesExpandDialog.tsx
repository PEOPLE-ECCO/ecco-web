// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Heading,
    Flex,
    Dialog,
    Portal,
    Text,
    Box,
    CloseButton
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { useState, useEffect } from "react";

import { useService } from "open-pioneer:react-hooks";
import { NotificationService } from "@open-pioneer/notifier";

import { JobParameters, Timeseries } from "../definitions";
import { useServices } from "../../services/Services";
import { ActionButton } from "./utils/ActionButton";
import { TimespanPicker } from "./utils/TimespanPicker";

import { EventEmitter } from "@open-pioneer/core";
import { Events } from "../../views/Sites/SiteDetails/SiteDetails";


interface CreateJobProps {
    timeseries: Timeseries;
    eventListener: EventEmitter<Events>;
}

export function TimeseriesExpandDialog({ timeseries, eventListener }: CreateJobProps) {
    const { id } = useParams();
    const { createJob } = useServices();

    const [expandButtonDisabled, setExpandButtonDisabled] = useState<boolean>(true);
    const [startDate, setStartDate] = useState<Date | null>();
    const [endDate, setEndDate] = useState<Date | null>();
    const [jobParams, setJobParams] = useState<JobParameters>();
    const [selectedTimeseries, _] = useState<Timeseries>(timeseries);

    const notificationService = useService<NotificationService>("notifier.NotificationService");

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
        eventListener.emit("selectedTimeseries", selectedTimeseries);
        notificationService.notify({
            title: "Job created",
            message: created,
            level: "info",
            displayDuration: 5000,
        });
    };


    return (
        <>
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
                                <Box h="55vh">
                                    <Text pb="2" textStyle="lg">Please select Timespan:</Text>
                                    <TimespanPicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onStartChange={setStartDate}
                                        onEndChange={setEndDate} />
                                </Box>
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
        </>
    );
};