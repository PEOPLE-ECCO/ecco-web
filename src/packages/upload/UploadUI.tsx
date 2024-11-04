// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { useService } from "open-pioneer:react-hooks";
import { FC, FormEvent } from "react";
import { HttpService, } from "@open-pioneer/http";
import { Button, FormControl, FormLabel, Input, FormHelperText, Box} from "@open-pioneer/chakra-integration";

export const UploadUI: FC = () => {
    const httpService = useService<HttpService>("http.HttpService");

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

    return (
        <>
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
        </>
    );
};