// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { FC, useEffect, useState } from "react";
import { useService } from "open-pioneer:react-hooks";
import { Code, Box} from "@chakra-ui/react";
import { HttpService, } from "@open-pioneer/http";



export const ExploreProcessesUI: FC = () => {
    const httpService = useService<HttpService>("http.HttpService");
    
    const [processes, setProcesses] = useState<[]>();

    useEffect(() => {
        httpService
            .fetch(import.meta.env.VITE_API_ROOT + "/processes")
            .then(async res => {
                return setProcesses(await res.json());
            });
    }, [httpService]);

    return (
        <>
            {processes && processes.map(process => 
                <Box key="process">
                    <Code key="process">
                        {JSON.stringify(process)}
                    </Code>
                </Box>
            )}
        </>
    );
};