import { render } from "@testing-library/svelte";
import BackButton from "../src/BackButton.svelte";

describe("BackButton.svelte", () => {
    test("should render", () => {
        const { getByText } = render(BackButton);
        expect(getByText("Back")).toHaveClass("btn");
    });
});
