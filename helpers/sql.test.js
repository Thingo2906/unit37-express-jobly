

const sqlForPartialUpdate = require('./sql');

describe("sqlForPartialUpdate", function(){
    test("test function sqlForPartialUpdate", function(){
    const dataToUpdate = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: 'first_name' };
    const result = sqlForPartialUpdate(dataToUpdate,jsToSql);
    expect(result).toEqual({setCols: '"first_name"=$1, "age"=$2',
                            values: ['Aliya', 32]})
    });
})
        
         
  