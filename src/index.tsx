import "./app.global.scss";

import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import { HashRouter as Router } from "react-router-dom";

import { configuredStore } from "./store";
import Base from "./views/Base";

const store = configuredStore();

document.addEventListener("DOMContentLoaded", () => {
    render(
        <Provider store={store}>
            <Router>
                <Base />
            </Router>
        </Provider>,
        document.getElementById("root")
    );
});
