// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import { ReactElement } from "react";
import { IconButton, Tooltip } from "@open-pioneer/chakra-integration";

interface IconActionButtonProps {
    icon: ReactElement;
    label: string;
    tooltip: string;
    onClick?: () => void;
}

export function IconActionButton({ icon, label, tooltip, onClick }: IconActionButtonProps) {
    return (
        <Tooltip label={tooltip} aria-label={`${label} tooltip`} placement="top">
            <IconButton
                aria-label={label}
                icon={icon}
                variant="ghost"
                backgroundColor="black"
                color="white"
                _hover={{ backgroundColor: "gray.500" }}
                onClick={onClick}
                w={"50px"}
            />
        </Tooltip>
    );
}