const getDiffToNearest10 = (length) => {
  const nearest10 = Math.ceil(length / 10) * 10
  return nearest10 - length
}

export default getDiffToNearest10
