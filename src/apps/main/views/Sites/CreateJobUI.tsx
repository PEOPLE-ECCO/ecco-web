// SPDX-FileCopyrightText: 2023 Open Pioneer project (https://github.com/open-pioneer)
// SPDX-License-Identifier: Apache-2.0
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
} from "@open-pioneer/chakra-integration";
import { HttpService } from "@open-pioneer/http";
import { useService } from "open-pioneer:react-hooks";
import { useEffect } from "react";
import { Scenario } from "./Sites";

export function CreateJobUI(scenario: Scenario): JSX.Element {
    const httpService = useService<HttpService>("http.HttpService");

    const { isOpen, onOpen, onClose } = useDisclosure();
    //const [SelectedScenario, setSelectedScenario] = useState<Processes | undefined>();


    useEffect(() => {
        httpService
            .fetch(import.meta.env.VITE_API_ROOT + "/scenarios/" + scenario?.id + "/processes/")
            .then(async res => {
                console.log(res);
            });
    }, [httpService, scenario]);

    return (
        <>
            <Button onClick={onOpen}>Open Modal</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Algorithm Execution</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        asdf
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}