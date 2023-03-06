/**
 * An awaitable sleep() function.
 * @param {number} ms - sleep duration in milliseconds
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
