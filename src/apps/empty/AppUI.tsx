// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { ForceAuth, useAuthState } from "@open-pioneer/authentication";
import { Button } from "@open-pioneer/chakra-integration";
import { Notifier } from "@open-pioneer/notifier";
import { useService } from "open-pioneer:react-hooks";
import { useEffect, useState } from "react";

export function AppUI() {
    const authService = useService<AuthService>("authentication.AuthService");
    const authState = useAuthState(authService);
    const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
    const userName = sessionInfo?.attributes?.userName as string;
    
    const [authenticated, setAuthenticated] = useState(false);
    useEffect(() => {   
        setAuthenticated(sessionInfo != undefined);
    }, [authState, sessionInfo]);

    return (
        <>
            {/* recommended for error reporting: */}
            <Notifier />

            {authenticated && ( 
                <ForceAuth>
                    <Button onClick={() => authService.logout()}>LOGOUT</Button>
                    Logged in as: {userName}
                    <br/>
                    <br/>
                    <pre>
                        {JSON.stringify(sessionInfo, null, 2)}
                    </pre>
                    
                </ForceAuth>
            )}
            
            {!authenticated && (      
                <Button onClick={() => setAuthenticated(true)}>LOGIN WITH KEYCLOAK</Button>
            )}
        </>
    );
}
