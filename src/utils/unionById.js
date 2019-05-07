import { eqBy, prop, unionWith } from 'ramda'

const unionById = unionWith(eqBy(prop('id')))

export default unionById
