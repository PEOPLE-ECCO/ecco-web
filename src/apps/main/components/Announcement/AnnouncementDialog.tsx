// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { Box, Button, CloseButton, Dialog, Link, List, Portal, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";

/** sessionStorage key remembering that the announcement was already shown in this session. */
const SEEN_KEY = "ecco.announcementSeen";

function wasSeen(): boolean {
    try {
        return sessionStorage.getItem(SEEN_KEY) === "true";
    } catch {
        return false;
    }
}

function markSeen() {
    try {
        sessionStorage.setItem(SEEN_KEY, "true");
    } catch {
        // storage unavailable: the dialog will simply show again on the next load
    }
}

/**
 * Announces the upcoming discontinuation of the platform.
 * Shown once per browser session.
 */
export function AnnouncementDialog() {
    const [open, setOpen] = useState(() => !wasSeen());

    const close = () => {
        markSeen();
        setOpen(false);
    };

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(e) => !e.open && close()}
            placement="center"
            size="md"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title color="#2C7D75">Platform will be discontinued shortly</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={3}>
                                <Text>
                                    The PEOPLE-ECCO Solutions Platform will be discontinued shortly since the project is concluded.
                                </Text>
                                <Text>
                                    Please download any results you want to keep before the platform
                                    is taken offline. After that, the platform and all data stored
                                    on it will no longer be available.
                                </Text>
                                <Box>
                                    <Text>Outcomes of the project will remain available:</Text>
                                    <List.Root ps={5} mt={1}>
                                        <List.Item>
                                            <Link href="https://people-ecco.github.io/" target="_blank" rel="noreferrer" color="#2C7D75" textDecoration="underline">
                                                User Handbook
                                            </Link>
                                        </List.Item>
                                        <List.Item>
                                            <Link href="https://github.com/PEOPLE-ECCO" target="_blank" rel="noreferrer" color="#2C7D75" textDecoration="underline">
                                                Open Source Software components
                                            </Link>
                                        </List.Item>
                                    </List.Root>
                                </Box>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button bg="#2C7D75" color="white" onClick={close}>
                                Understood
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
