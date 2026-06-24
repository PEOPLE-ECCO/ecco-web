// SPDX-FileCopyrightText: 2023-2025 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ReactElement } from "react";
import { IconButton } from "@chakra-ui/react";
import { Tooltip } from "../../tooltip";

interface IconActionButtonProps {
    icon: ReactElement;
    label: string;
    tooltip?: string;
    onClick?: () => void;
}

export function IconActionButton({ icon, label, tooltip, onClick }: IconActionButtonProps) {
    return (
            <Tooltip content={tooltip}>
                <IconButton
                    aria-label={label}
                    variant="ghost"
                    backgroundColor="#2C7D75"
                    color="white"
                    _hover={{ backgroundColor: "teal.700" }}
                    onClick={onClick}
                >
                    {icon}
                </IconButton>
            </Tooltip>
    );
}