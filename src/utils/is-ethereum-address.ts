export const isEthereumAddress = (input: string): boolean => {
  return input.slice(0, 2) === '0x' && input.length === 42;
};

export const isPartialEthereumAddress = (input: string): boolean => {
  return input.slice(0, 2) === '0x' && input.length < 42;
};
