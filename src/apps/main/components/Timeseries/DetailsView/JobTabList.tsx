// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

// components/Timeseries/TimeseriesDetailsView/JobTabList.tsx

import { TabList, Tab, Tooltip, Box } from "@open-pioneer/chakra-integration";
import { Asset } from "../../definitions";

interface JobTabListProps {
    groupedAssets: Record<string, Asset[]>;
}

export function JobTabList({ groupedAssets }: JobTabListProps) {
    return (
        <TabList>
            {Object.entries(groupedAssets).map(([groupId, groupAssets]) => {
                const job = groupAssets[0]?.job;
                const scheduleTime = job?.scheduleTime || "No info";
                const credits = job?.credits || "No info";
                const cpu = job?.usage?.cpu.value + " " + job?.usage?.cpu.unit || "No info";
                const duration = job?.usage?.duration.value + " " + job?.usage?.duration.unit || "No info";
                const memory = job?.usage?.memory.value + " " + job?.usage?.memory.unit || "No info";
                const sentinel = job?.usage?.sentinelhub.value + " " + job?.usage?.sentinelhub.unit || "No info";

                return (
                    <Tooltip
                        key={groupId}
                        label={
                            <Box whiteSpace="pre-line">
                                <b>Job ID:</b> {groupId} <br />
                                <b>Scheduled:</b> {new Date(scheduleTime).toLocaleString()} <br />
                                <b>Costs:</b> {credits} <br />
                                <b>CPU:</b> {cpu} <br />
                                <b>Duration:</b> {duration} <br />
                                <b>Memory:</b> {memory} <br />
                                <b>SentinelHub:</b> {sentinel} <br />
                            </Box>
                        }
                        hasArrow
                        placement="top"
                    >
                        <Tab>{new Date(scheduleTime).toLocaleString()}</Tab>
                    </Tooltip>
                );
            })}
        </TabList>
    );
}
