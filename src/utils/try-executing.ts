export async function tryExecuting(f: Promise<any>) {
  try {
    return await f;
  } catch (e) {
    return undefined;
  }
}
