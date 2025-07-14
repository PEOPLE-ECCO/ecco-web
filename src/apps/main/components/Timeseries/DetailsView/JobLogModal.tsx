// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
} from "@open-pioneer/chakra-integration";

import { Box } from "@chakra-ui/react";
import { Fragment } from "react";

interface LogEntry {
    time: string;
    level: string;
    message: string;
}

interface JobLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: LogEntry[];
}

export function JobLogModal({ isOpen, onClose, log }: JobLogModalProps) {
    return (
        <Modal size="full" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Log</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {log.map((entry, index) => (
                        <Fragment key={index}>
                            <Box fontSize="sm" color="gray.600">
                                <strong>{entry.time}</strong> - {entry.level.toUpperCase()}
                            </Box>
                            <Box mb={3}>{entry.message}</Box>
                        </Fragment>
                    ))}
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
