// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ReactElement } from "react";
import { IconButton, Tooltip } from "@chakra-ui/react";

interface IconActionButtonProps {
    icon: ReactElement;
    label: string;
    tooltip: string;
    onClick?: () => void;
}

export function IconActionButton({ icon, label, tooltip, onClick }: IconActionButtonProps) {
    return (
        <Tooltip.Root aria-label={`${label} tooltip`}>
            <Tooltip.Content>
                <IconButton
                    aria-label={label}
                    variant="ghost"
                    backgroundColor="black"
                    color="white"
                    _hover={{ backgroundColor: "gray.500" }}
                    onClick={onClick}
                >
                    {icon}
                </IconButton>
            </Tooltip.Content>
        </Tooltip.Root>
    );
}