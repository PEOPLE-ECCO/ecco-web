// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ForceAuth } from "@open-pioneer/authentication";
import { Notifier } from "@open-pioneer/notifier";
import { useState } from "react";
import Header from "./HeaderUI";
import { ExploreUI } from "data-viewer/ExploreUI";
import { ExploreProcessesUI } from "process-viewer/ExploreProcessesUI";
import { UploadUI } from "upload/UploadUI";
import { Grid } from "@open-pioneer/chakra-integration";
import { DocsUI } from "docs/DocsUI";

export function AppUI() {
    const [view, setView] = useState("explore-data");

    return (
        <Grid templateColumns="repeat(12, 1fr)" templateRows="repeat(12, 1fr)">
            <Header view={setView}></Header>
            <Notifier />
            { view == "explore-data" && 
                <ExploreUI></ExploreUI>
            }
            { view == "explore-processes" && 
                <>
                    <ForceAuth>
                        <ExploreProcessesUI></ExploreProcessesUI>
                    </ForceAuth>
                </>
            }
            { view == "docs" && 
                <DocsUI></DocsUI>
            }
            { view == "upload" && 
                <>
                    <ForceAuth>
                        <UploadUI></UploadUI>
                    </ForceAuth>
                </>
            }
        </Grid>
    );
}

