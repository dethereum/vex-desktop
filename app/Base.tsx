import React, { useEffect } from "react";
import { remote } from "electron";
import { Switch, Route, useHistory } from "react-router-dom";
import { routes } from "./constants/routes";
import App from "./views/App";
import MessagingPage from "./views/MessagingPage";
import { Client, IMessage, IConversation } from "@vex-chat/vex-js";
import { useDispatch } from "react-redux";
import { setUser } from "./reducers/user";
import os from "os";
import { addFamiliar, setFamiliars } from "./reducers/familiars";
import { setMessages } from "./reducers/messages";
import { addConversation, setConversations } from "./reducers/conversations";
import Register from "./components/Register";
import Loading from "./components/Loading";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;

// localStorage.setItem("PK", Client.generateSecretKey());

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const client = new Client(localStorage.getItem("PK")!, {
    dbFolder: progFolder,
});
client.on("ready", async () => {
    const registeredUser = await client.users.retrieve(client.getKeys().public);
    if (registeredUser) {
        await client.login();
    } else {
        // hacky
        client.emit("needs-register");
    }
});

client.init();

export interface IDisplayMessage extends IMessage {
    timestamp: Date;
    direction: "outgoing" | "incoming";
}

export default function Base(): JSX.Element {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        client.on("needs-register", async () => {
            history.push("/register");
        });

        client.on("authed", async () => {
            const me = client.users.me();
            dispatch(setUser(me));

            history.push("/messaging/" + me.userID);

            const conversations = await client.conversations.retrieve();
            dispatch(setConversations(conversations));

            const familiars = await client.familiars.retrieve();
            dispatch(setFamiliars(familiars));

            for (const user of familiars) {
                const history = await client.messages.retrieve(user.userID);
                for (const message of history) {
                    dispatch(setMessages(message));
                }
            }
        });

        client.on("conversation", async (conversation: IConversation) => {
            dispatch(addConversation(conversation));
            dispatch(addFamiliar(conversation.user));
        });

        client.on("message", async (message: IMessage) => {
            const dispMsg: IDisplayMessage = {
                message: message.message,
                recipient: message.recipient,
                nonce: message.nonce,
                timestamp: message.timestamp,
                sender: message.sender,
                direction: message.direction,
            };
            dispatch(setMessages(dispMsg));

            if (
                dispMsg.direction === "incoming" &&
                message.recipient !== message.sender
            ) {
                const msgNotification = new Notification("Vex", {
                    body: message.message,
                });

                msgNotification.onclick = () => {
                    remote.getCurrentWindow().show();
                    history.push(
                        "/messages/" +
                            (dispMsg.direction === "incoming"
                                ? dispMsg.sender
                                : dispMsg.recipient)
                    );
                };
            }
        });
    });

    return (
        <App>
            <Switch>
                <Route path={routes.MESSAGING} component={MessagingPage} />
                <Route path={routes.REGISTER} component={Register} />
                <Route exact path={"/"} component={() => Loading(256)} />
            </Switch>
        </App>
    );
}
