// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ForceAuth } from "@open-pioneer/authentication";
import { Notifier } from "@open-pioneer/notifier";
import { useState } from "react";
import Header from "./components/Header/Header";
import { ExploreUI } from "data-viewer/ExploreUI";
import { ExploreProcessesUI } from "process-viewer/ExploreProcessesUI";
import { UploadUI } from "upload/UploadUI";
import { Grid } from "@open-pioneer/chakra-integration";
import { DocsUI } from "docs/DocsUI";
import { ExploreSitesUI } from "sites-viewer/ExploreSitesUI";

export function AppUI() {
    const [view, setView] = useState("explore-sites");

    return (
        <Grid templateColumns="repeat(12, 1fr)" templateRows="repeat(12, 1fr)" style={{height:"99%"}}>
            <Header view={setView}></Header>
            <Notifier />
            {view == "explore-data" &&
                <ForceAuth>
                    <ExploreUI></ExploreUI>
                </ForceAuth>
            }
            {view == "explore-processes" &&
                <>
                    <ForceAuth>
                        <ExploreProcessesUI></ExploreProcessesUI>
                    </ForceAuth>
                </>
            }
            {view == "explore-sites" &&
                <>
                    <ForceAuth>
                        <ExploreSitesUI></ExploreSitesUI>
                    </ForceAuth>
                </>
            }
            {view == "docs" &&
                <DocsUI></DocsUI>
            }
            {view == "upload" &&
                <>
                    <ForceAuth>
                        <UploadUI></UploadUI>
                    </ForceAuth>
                </>
            }
        </Grid>
    );
}

