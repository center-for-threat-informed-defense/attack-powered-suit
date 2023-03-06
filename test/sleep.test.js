import { sleep } from "../src/sleep.js";

describe("sleep.js", () => {
    test("sleep should return a promise", () => {
        const sleepDuration = 10; // milliseconds
        let start = new Date();
        sleep(sleepDuration).then(() => {
            let elapsed = new Date() - start;
            expect(elapsed).toBeGreaterThanOrEqual(sleepDuration);
        })
    });
});
