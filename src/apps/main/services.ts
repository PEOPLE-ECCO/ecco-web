// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import { AuthService } from "@open-pioneer/authentication";
import { ServiceOptions} from "@open-pioneer/runtime";
import { Interceptor, BeforeRequestParams} from "@open-pioneer/http";

interface References {
    authService: AuthService;
}

export class TokenInterceptor implements Interceptor {
    private authService: AuthService;

    constructor(options: ServiceOptions<References>) {
        this.authService = options.references.authService;
    }

    beforeRequest({ target, options }: BeforeRequestParams): void {
        const authState = this.authService.getAuthState();
        const sessionInfo = authState.kind == "authenticated" ? authState.sessionInfo : undefined;
        const keycloak = sessionInfo?.attributes?.keycloak;
        if (keycloak) {
            const token = (keycloak as { token: string }).token;
            if (target.href.startsWith(import.meta.env.VITE_API_ROOT) && token) {
                options.headers.set("Authorization", "Bearer " + token);
            }
        }
    }
}