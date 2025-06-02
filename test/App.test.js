import { render, screen } from "@testing-library/svelte";
import 'whatwg-fetch';
import App from "../src/App.svelte";

describe("App.svelte", () => {
    test("should render", () => {
        render(App);
        const node = screen.getByLabelText("Search ATT&CK…");
        expect(node).toBeInTheDocument();
    });
});
