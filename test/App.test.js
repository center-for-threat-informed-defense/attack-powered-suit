import { render, screen } from "@testing-library/svelte";
import App from "../src/App.svelte";
import fs from "fs";

const attackFixture = fs.readFileSync(__dirname + "/fixtures/attack-objects.json", { encoding: "utf8", flag: "r" });
const lunrIndexFixture = fs.readFileSync(__dirname + "/fixtures/lunr-index.jsonx", { encoding: "utf8", flag: "r" });

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
                return { json: () => JSON.parse(attackFixture) };
            } else if (url.endsWith("lunr-index.jsonx")) {
                return { json: () => JSON.parse(lunrIndexFixture) };
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
