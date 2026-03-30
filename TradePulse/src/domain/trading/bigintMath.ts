/** Integer ceil for nonnegative a,b with b > 0: ceil(a*b / divisor) implemented without floats. */
export function mulDivCeil(a: bigint, b: bigint, divisor: bigint): bigint {
  if (divisor <= 0n) {
    throw new RangeError('divisor must be positive');
  }
  const num = a * b;
  return (num + divisor - 1n) / divisor;
}

export function mulDivFloor(a: bigint, b: bigint, divisor: bigint): bigint {
  if (divisor <= 0n) {
    throw new RangeError('divisor must be positive');
  }
  return (a * b) / divisor;
}
