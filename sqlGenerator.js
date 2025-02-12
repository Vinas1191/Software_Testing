export function generateUpldateStatement(tableName, payLoad, primaryKeyValue, id){
    const columns = []
    const values = []

    for(const property in payLoad){
        columns.push(`${property}=?`)
        values.push(payLoad[property])
    }

    const sql = `UPDATE ${tableName} SET ${columns.join(', ')} WHERE ${primaryKeyColumn} = ${primaryKeyValue} = ${id}`

    return {
        sql,
        values
    }
}

export function generateInsertStatement(tableName , payLoad){
   const columns = [];
   const values = [];

   for(const property in payLoad){
       columns.push(property)
       values.push(payLoad[property])
   }

   const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${Array(columns.length).fill('?').join(', ')});`

  return{
   sql,
   values
  }

}