// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { HStack, Spinner, Stack, Status, Text } from "@chakra-ui/react";
import { useReactiveSnapshot } from "@open-pioneer/reactivity";

import { isJobFailed, isJobInProgress, Job, Timeseries } from "../definitions";
import { ViewLog } from "./ViewJob";


interface JobStatusProps {
    timeseries: Timeseries
}

/**
 * Lists the jobs of a timeseries that have no results to show yet: jobs still in progress
 * and failed jobs. The state is not updated automatically, it changes on refresh.
 */
export function JobStatus({ timeseries }: JobStatusProps) {
    const jobs = useReactiveSnapshot(
        () => timeseries.jobs?.filter(j => isJobInProgress(j) || isJobFailed(j)) ?? [],
        [timeseries]
    );

    if (jobs.length === 0) {
        return null;
    }

    return (
        <Stack gap="2" pb="2">
            {jobs.map(job => isJobFailed(job) ? (
                <HStack key={job.id}>
                    <Status.Root colorPalette="red">
                        <Status.Indicator />
                    </Status.Root>
                    <Text flex="1">Job {job.name} failed ({job.state_name}).</Text>
                    <ViewLog timeseries={timeseries} initialJobName={job.name} />
                </HStack>
            ) : (
                <HStack key={job.id}>
                    <Spinner size="sm" color="teal.600" />
                    <Text flex="1">
                        Job {job.name}: {job.state_name} since {formatStart(job)}.
                        Results can take several minutes, use refresh to check again.
                    </Text>
                </HStack>
            ))}
        </Stack>
    );
}

// start_time is only set once the job is running, before that it has only been created
function formatStart(job: Job): string {
    const start = new Date(job.start_time || job.created);
    return start.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}
