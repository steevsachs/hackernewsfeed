import { slice } from 'ramda'

const updateItemInPlace = (arrayToUpdate, indexToUpdate, item) => {
  return [
    ...slice(0, indexToUpdate, arrayToUpdate),
    item,
    ...slice(indexToUpdate + 1, arrayToUpdate.length, arrayToUpdate),
  ]
}

export default updateItemInPlace
