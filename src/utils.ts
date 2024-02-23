export const isFulfilled = <T>(
  p: PromiseSettledResult<T>,
): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';

export const isRejected = <T>(
  p: PromiseSettledResult<T>,
): p is PromiseRejectedResult => p.status === 'rejected';

// const fulfilledValues = results.filter(isFulfilled).map((p) => p.value);
// const rejectedReasons = results.filter(isRejected).map((p) => p.reason);
