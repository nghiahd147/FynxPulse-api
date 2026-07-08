export const numberEnumToArray = (type: { [key: string]: number | string }) => {
  return Object.values(type).filter((item) => typeof item === 'number') as number[]
}
