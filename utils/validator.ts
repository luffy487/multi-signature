import { isAddress } from 'web3-validator';

const convertValue = (value: any, type: string): any => {
  switch (type) {
    case 'uint256':
      return Number(value);
    case 'address':
      throw new Error('Invalid address');
    case 'string':
      return String(value);
    case 'bool':
      return Boolean(value);
    case 'bytes':
      return value;
    case 'int256':
      return parseInt(value, 10);
    default:
      throw new Error('Unsupported type');
  }
};

const validateValue = (value: any, type: string): boolean => {
  try {
    switch (type) {
      case 'uint256':
        return !isNaN(Number(value));
      case 'address':
        return isAddress(value);
      case 'string':
        return typeof value === 'string';
      case 'bool':
        return typeof value === 'boolean';
      case 'bytes':
        return true;
      case 'int256':
        return !isNaN(parseInt(value, 10));
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};

export { convertValue, validateValue };
