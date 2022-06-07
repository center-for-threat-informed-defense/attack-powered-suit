import { render, screen } from "@testing-library/svelte";
import App from "../src/App.svelte";

const attackFixture = [{
    "name": "My Technique",
    "description": "My description",
    "id": "T1234",
    "url": "https://attack.mitre.org/techniques/T1234/",
    "type": "technique"
}];
const fuseIndexFixture = {};

describe("App.svelte", () => {
    beforeEach(() => {
        window.chrome = {
            storage: {
                sync: {
                    get: jest.fn(() => Promise.resolve({ bookmarks: [], formats: [] })),
                    set: jest.fn(),
                }
            }
        };

        window.fetch = jest.fn(url => {
            if (url.endsWith("attack.json")) {
                return { json: () => JSON.stringify(attackFixture) };
            } else if (url.endsWith("fuse-index.json")) {
                return { json: () => JSON.stringify(fuseIndexFixture) };
            } else {
                return null;
            }
        });
    });

    afterEach(() => {
        delete window.chrome;
        delete window.fetch;
    });

    test("should render", () => {
        render(App);
        const node = screen.getByLabelText("Search ATT&CK…");
        expect(node).toBeInTheDocument();
    });
});
