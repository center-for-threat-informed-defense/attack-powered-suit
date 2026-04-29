import { render, screen } from "@testing-library/svelte";
import SearchResults from "../src/SearchResults.svelte";

describe("SearchResults.svelte messages", () => {
  test("shows no-results message when totalCount is 0", () => {
    const results = { query: "abc", items: [], totalCount: 0 };
    render(SearchResults, { props: { results } });
    expect(screen.getByText('Nothing found for "abc"')).toBeInTheDocument();
  });

  test("shows truncated-results message when only a subset is displayed", () => {
    const results = { query: "abc", items: [], totalCount: 5 };
    const { container } = render(SearchResults, { props: { results } });
    expect(container.textContent).toMatch(/Only showing 0 out of 5/);
  });
});
