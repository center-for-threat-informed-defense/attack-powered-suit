// Mock sanitize-html with an ES module default export passthrough for Jest ESM
jest.mock("sanitize-html", () => ({ __esModule: true, default: (html) => html }));

import { render } from "@testing-library/svelte";
import HighlightMatches from "../src/HighlightMatches.svelte";

describe("HighlightMatches.svelte", () => {
  test("wraps highlight ranges in <mark>", () => {
    const text = "foo bar baz";
    const highlights = [[4, 7]]; // "bar"
    const { container } = render(HighlightMatches, {
      props: { text, highlights, maxLength: null },
    });
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark.textContent).toBe("bar");
  });

  test("trims long text around first highlight and inserts ellipses", () => {
    const text = "lorem ipsum dolor sit amet, consectetur";
    const highlights = [[6, 11]]; // "ipsum"
    const { container } = render(HighlightMatches, {
      props: { text, highlights, maxLength: 10 },
    });
    // Expect at least one ellipsis character in the rendered output
    expect(container.textContent).toMatch(/…/);
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark.textContent).toBe("ipsum");
  });
});
