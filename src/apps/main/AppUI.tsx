// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ForceAuth } from "@open-pioneer/authentication";
import { Notifier } from "@open-pioneer/notifier";
import { useState } from "react";
import Header from "./HeaderUI";
import { ExploreUI } from "data-viewer/ExploreUI";
import { UploadUI } from "upload/UploadUI";

export function AppUI() {
    const [view, setView] = useState("main");

    return (
        <>
            <Header view={setView}></Header>
            <Notifier />
            { view == "explore-data" && 
                <div style={{height: "100vh"}}>
                    <ExploreUI></ExploreUI>
                </div>
            }
            { view == "explore-processes" && 
                <>
                    <ForceAuth>
                    </ForceAuth>
                </>
            }
            { view == "docs" && 
                <>
                    DOCS
                </>
            }
            { view == "upload" && 
                <>
                    <ForceAuth>
                        <UploadUI></UploadUI>
                    </ForceAuth>
                </>
            }

        </>
    );
}

