// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { AuthService, ForceAuth, useAuthState } from "@open-pioneer/authentication";
import { HttpService, } from "@open-pioneer/http";
import { Button, FormControl, FormLabel, Input, FormHelperText, Box} from "@open-pioneer/chakra-integration";
import { Notifier } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";
import { FormEvent, useEffect, useState } from "react";
import Header from "./HeaderUI";

interface PreparedS3Request {
    data: object
}


export function AppUI() {
    const httpService = useService<HttpService>("http.HttpService");
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
    const [authenticated, setAuthenticated] = useState(false);
    useEffect(() => {   
        setAuthenticated(sessionInfo != undefined);
    }, [authState, sessionInfo]);

    async function upload_file(test: FormEvent<HTMLFormElement>) {
        test.preventDefault();
        console.log(test);

        const data2 = new FormData(test.target as HTMLFormElement);
        const value = Object.fromEntries(data2.entries());
        
        console.log(value);
        // Get prepared request
        const response = await httpService.fetch("http://localhost:5000/upload", {
            method: "POST",
            body: JSON.stringify(
                {
                    "file_name": value.file_name,
                    "file_type": "filetype"
                }
            )
        });
        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }
        const s3 = await response.json();

        console.log(s3);

        const s3_url = s3.data;
        await httpService.fetch(s3_url, {
            method: "PUT",
            body: test.target[1].files[0]
        });
    }


    function anonymous_ui(): JSX.Element {
        return (
            <>
            </>
        );
    }


    function authenticated_ui() {
        return ( 
            <ForceAuth>
                <Box>
                    <form onSubmit={upload_file}>
                        <FormControl>
                            <FormLabel>filename</FormLabel>
                            <Input type="text" name="file_name"/>
                            <FormHelperText>name of da file.</FormHelperText>
                            <FormLabel>File</FormLabel>
                            <Input type="file" name="file"/>
                            <FormHelperText>File to upload.</FormHelperText>
                            <Button type='submit'> Upload File </Button>
                        </FormControl>
                    </form>
                </Box>
            </ForceAuth>
        );
    }

    return (
        <>
            <Header></Header>
            {/* recommended for error reporting: */}
            {authenticated && authenticated_ui()}
            {!authenticated && anonymous_ui()}
            <Notifier />
        </>
    );
}

