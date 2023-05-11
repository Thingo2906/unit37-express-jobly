const { BadRequestError } = require("../expressError");

//Documentation fo this function
/**
 * Generates the SQL setCols and values for a partial update query.
 *
 * @param {Object} dataToUpdate - The data object containing the properties to update.
 * @param {Object} [jsToSql] - An optional mapping object to convert JavaScript property names to SQL column names.
 * @returns {Object} An object with the setCols and values for the SQL update statement.
 * @throws {BadRequestError} If dataToUpdate is empty.
 *
 * @example
 * const dataToUpdate = { firstName: 'Aliya', age: 32 };
 * const jsToSql = { firstName: 'first_name' };
 *
 * const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
 * // Result:
 * // {
 * //   setCols: '"first_name"=$1, "age"=$2',
 * //   values: ['Aliya', 32]
 * // }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // keys is an array ['firstname', 'age']
  // colName is each element in keys array, and idx is index for each element.
  // if jsTosql object is not exist, the column name in databae will be the same name with the keys data that we pass into the body.
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
