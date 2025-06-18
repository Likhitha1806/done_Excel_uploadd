module.exports = async function (srv) {
    const { Employees } = srv.entities;

    this.on("bulkUpload", async (req) => {
       
        const {jsonData} = req.data;
          //console.log("jsonData",jsonData);
       
          try {
            const data = JSON.parse(jsonData);
            //console.log("data",data);
              if (!data || !Array.isArray(data) || data.length === 0) {
                  return req.error(400, 'No data provided or data is not an array');
              }
     
              const tx = cds.transaction(req);
              const validRecords = data;
              if (validRecords.length === 0) {
                  return req.error(400, 'No valid records found');
              }
   
              // Batch insert
              await tx.run(INSERT.into(Employees).entries(validRecords));
             
              return {
                  message: 'Records upload successful',
                  totalRecords: data.length,
                  insertedRecords: validRecords.length,
                  skippedRecords: data.length - validRecords.length
              };
             
          } catch (error) {
              console.error('Bulk upload error:', error);
              return req.error(500, `Bulk upload failed: ${error.message}`);
          }
      });
}