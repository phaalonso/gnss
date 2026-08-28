let count = 0;

export function trackPromises(promise: Promise<any>) {
    count++;

    return promise.finally(() => {
        --count;
    })
}

if (process.env.TRACK_PROMISSES_FLAG === 'true') {
    setInterval(() => {
        console.log(`Promises: ${count}`);
    }, 1000 * 60);
}
