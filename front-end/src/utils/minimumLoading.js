export const MINIMUM_LOADING_TIME = 2000;

export const waitForMinimumLoading = (startedAt, minimumTime = MINIMUM_LOADING_TIME) => {
  const remainingTime = Math.max(0, minimumTime - (Date.now() - startedAt));
  return new Promise((resolve) => window.setTimeout(resolve, remainingTime));
};
