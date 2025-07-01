// // const ExcelJS = require('exceljs');
// // const bodyParser = require('body-parser');
// // const path = require('path');
// // const fs = require('fs');
 

// // module.exports = async function (srv) {
// //     const { Employees } = srv.entities;

// //     async function createInvalidRecordsExcel(invalidRecords) {
// //         const workbook = new ExcelJS.Workbook();
// //         const worksheet = workbook.addWorksheet('Invalid Records');

// //         if (invalidRecords.length > 0) {
// //             worksheet.columns = Object.keys(invalidRecords[0]).map(key => ({
// //                 header: key,
// //                 key: key,
// //                 width: 20
// //             }));
// //             worksheet.addRows(invalidRecords);
// //         }

// //         const filesDir = path.join(__dirname, '..', 'files');
// //         if (!fs.existsSync(filesDir)) {
// //             fs.mkdirSync(filesDir, { recursive: true });
// //         }

// //         const timestamp = Date.now();
// //         const filename = `invalid_records_${timestamp}.xlsx`;
// //         const filePath = path.join(filesDir, filename);

// //         await workbook.xlsx.writeFile(filePath);
// //         return `/files/${filename}`;
// //     }

// //     srv.on("bulkUpload", async (req) => {
// //         const { jsonData } = req.data;

// //         try {
// //             const data = JSON.parse(jsonData);

// //             if (!data || !Array.isArray(data) || data.length === 0) {
// //                 return req.error(400, 'No data provided or data is not an array');
// //             }

// //             const validRecords = [];
// //             const invalidRecords = [];

// //             const namePattern = /^[A-Za-z\s]+$/;
// //             const psNumberPattern = /^\d{6,10}$/; // adjust length if required
// //             const datePattern = /^\d{4}-\d{2}-\d{2}$/;

// //             for (const record of data) {
// //                 const errors = [];

// //                 // EMPLOYEENAME validation
// //                 if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// //                     errors.push("Invalid EMPLOYEENAME");
// //                 }

// //                 // PSNUMBER validation
// //                 if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// //                     errors.push("Invalid PSNUMBER");
// //                 }

// //                 // DATEOFJOINING validation
// //                 if (!record.DATEOFJOINING || !datePattern.test(record.DATEOFJOINING)) {
// //                     errors.push("Invalid DATEOFJOINING");
// //                 }

// //                 if (errors.length === 0) {
// //                     validRecords.push(record);
// //                 } else {
// //                     invalidRecords.push({ ...record, ValidationErrors: errors.join(", ") });
// //                 }
// //             }

// //             let downloadLink = null;
// //             if (invalidRecords.length > 0) {
// //                 downloadLink = await createInvalidRecordsExcel(invalidRecords);
// //             } else {
// //                 downloadLink = `/files/invalid_records_123456.xlsx`; // fallback
// //             }

// //             if (validRecords.length === 0) {
// //                 return {
// //                     message: 'No valid records found. Upload aborted.',
// //                     totalRecords: data.length,
// //                     insertedRecords: 0,
// //                     skippedRecords: invalidRecords.length,
// //                     downloadInvalidRecords: downloadLink
// //                 };
// //             }

// //             const tx = cds.transaction(req);

// //             await tx.run(DELETE.from(Employees));
// //             await tx.run(INSERT.into(Employees).entries(validRecords));

// //             return {
// //                 message: 'Upload complete',
// //                 totalRecords: data.length,
// //                 insertedRecords: validRecords.length,
// //                 skippedRecords: invalidRecords.length,
// //                 downloadInvalidRecords: downloadLink
// //             };

// //         } catch (error) {
// //             return req.error(500, `Bulk upload failed: ${error.message}`);
// //         }
// //     });
// // };

// const ExcelJS = require('exceljs');
// const path = require('path');
// const fs = require('fs');

// module.exports = async function (srv) {
//     const { Employees, InvalidEmployees } = srv.entities;

//     async function createInvalidRecordsExcel(invalidRecords) {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Invalid Records');

//         if (invalidRecords.length > 0) {
//             worksheet.columns = Object.keys(invalidRecords[0]).map(key => ({
//                 header: key,
//                 key: key,
//                 width: 20
//             }));
//             worksheet.addRows(invalidRecords);
//         }

//         const filesDir = path.join(__dirname, '..', 'files');
//         if (!fs.existsSync(filesDir)) {
//             fs.mkdirSync(filesDir, { recursive: true });
//         }

//         const timestamp = Date.now();
//         const filename = `invalid_records_${timestamp}.xlsx`;
//         const filePath = path.join(filesDir, filename);

//         await workbook.xlsx.writeFile(filePath);
//         return `/files/${filename}`;
//     }

//     srv.on("bulkUpload", async (req) => {
//         const { jsonData } = req.data;

//         try {
//             const data = JSON.parse(jsonData);

//             if (!data || !Array.isArray(data) || data.length === 0) {
//                 return req.error(400, 'No data provided or data is not an array');
//             }

//             const validRecords = [];
//             const invalidRecords = [];

//             const namePattern = /^[A-Za-z\s]+$/;
//             const psNumberPattern = /^\d{6,10}$/; // adjust length if required
//             const datePattern = /^\d{4}-\d{2}-\d{2}$/;

//             for (const record of data) {
//                 const errors = [];

//                 // EMPLOYEENAME validation
//                 if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
//                     errors.push("Invalid EMPLOYEENAME");
//                 }

//                 // PSNUMBER validation
//                 if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
//                     errors.push("Invalid PSNUMBER");
//                 }

//                 // DATEOFJOINING validation
//                 if (!record.DATEOFJOINING || !datePattern.test(record.DATEOFJOINING)) {
//                     errors.push("Invalid DATEOFJOINING");
//                 }

//                 if (errors.length === 0) {
//                     validRecords.push(record);
//                 } else {
//                     // Add error reason for HANA invalid table
//                     invalidRecords.push({
//                         ...record,
//                         ERROR_REASON: errors.join(", ")
//                     });
//                 }
//             }

//             let downloadLink = null;
//             if (invalidRecords.length > 0) {
//                 downloadLink = await createInvalidRecordsExcel(invalidRecords);
//             } else {
//                 downloadLink = `/files/invalid_records_123456.xlsx`; // fallback
//             }

//             const tx = cds.transaction(req);

//             // Insert valid records into Employees
//             if (validRecords.length > 0) {
//                 await tx.run(DELETE.from(Employees));
//                 await tx.run(INSERT.into(Employees).entries(validRecords));
//             }

//             // Insert invalid records into InvalidEmployees
//             if (invalidRecords.length > 0) {
//                 await tx.run(DELETE.from(InvalidEmployees));
//                 await tx.run(INSERT.into(InvalidEmployees).entries(invalidRecords));
//             }

//             return {
//                 message: 'Upload complete',
//                 totalRecords: data.length,
//                 insertedRecords: validRecords.length,
//                 skippedRecords: invalidRecords.length,
//                 downloadInvalidRecords: downloadLink
//             };

//         } catch (error) {
//             return req.error(500, `Bulk upload failed: ${error.message}`);
//         }
//     });

//     // Save invalid employees in a separate call (for UI "Save Invalid Records" button)
//     srv.on('saveInvalidEmployees', async (req) => {
//         const { records } = req.data;
//         if (!records || !Array.isArray(records) || records.length === 0) {
//             return req.error(400, 'No records provided');
//         }
//         try {
//             // Get the valid field names from CDS model for InvalidEmployees
//             const allowedFields = Object.keys(InvalidEmployees.elements);

//             // For each record, keep only the allowed CDS fields
//             const cleanRecords = records.map(record => {
//                 const clean = {};
//                 for (const key of allowedFields) {
//                     if (record.hasOwnProperty(key)) {
//                         clean[key] = record[key];
//                     }
//                 }
//                 return clean;
//             });

//             await INSERT.into(InvalidEmployees).entries(cleanRecords);
//             return { message: "Invalid records saved successfully." };
//         } catch (e) {
//             return req.error(500, `Failed to save invalid records: ${e.message}`);
//         }
//     });
// };

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

module.exports = async function (srv) {
    const { Employees, InvalidEmployees } = srv.entities;

    async function createInvalidRecordsExcel(invalidRecords) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invalid Records');

        if (invalidRecords.length > 0) {
            worksheet.columns = Object.keys(invalidRecords[0]).map(key => ({
                header: key,
                key: key,
                width: 20
            }));
            worksheet.addRows(invalidRecords);
        }

        const filesDir = path.join(__dirname, '..', 'files');
        if (!fs.existsSync(filesDir)) {
            fs.mkdirSync(filesDir, { recursive: true });
        }

        const timestamp = Date.now();
        const filename = `invalid_records_${timestamp}.xlsx`;
        const filePath = path.join(filesDir, filename);

        await workbook.xlsx.writeFile(filePath);
        return `/files/${filename}`;
    }

    // Utility: Clean records for entity (strip any extraneous keys)
    function cleanRecordForEntity(record, allowedFields) {
        const clean = {};
        for (const key of allowedFields) {
            if (record.hasOwnProperty(key)) {
                clean[key] = record[key];
            }
        }
        return clean;
    }

    srv.on("bulkUpload", async (req) => {
        const { jsonData } = req.data;

        try {
            const data = JSON.parse(jsonData);

            if (!data || !Array.isArray(data) || data.length === 0) {
                return req.error(400, 'No data provided or data is not an array');
            }

            const validRecords = [];
            const invalidRecords = [];

            const namePattern = /^[A-Za-z\s]+$/;
            const psNumberPattern = /^\d{6,10}$/; // adjust length if required
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            for (const record of data) {
                const errors = [];

                // EMPLOYEENAME validation
                if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
                    errors.push("Invalid EMPLOYEENAME");
                }

                // PSNUMBER validation
                if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
                    errors.push("Invalid PSNUMBER");
                }

                // DATEOFJOINING validation
                if (!record.DATEOFJOINING || !datePattern.test(record.DATEOFJOINING)) {
                    errors.push("Invalid DATEOFJOINING");
                }

                if (errors.length === 0) {
                    validRecords.push(record);
                } else {
                    // Add error reason for HANA invalid table
                    invalidRecords.push({
                        ...record,
                        ERROR_REASON: errors.join(", ")
                    });
                }
            }

            let downloadLink = null;
            if (invalidRecords.length > 0) {
                downloadLink = await createInvalidRecordsExcel(invalidRecords);
            } else {
                downloadLink = `/files/invalid_records_123456.xlsx`; // fallback
            }

            const tx = cds.transaction(req);

            // Clean fields before DB insert to avoid OData/DB errors from UI "helper" fields (e.g. _isValid)
            const allowedEmpFields = Object.keys(Employees.elements);
            const allowedInvalidFields = Object.keys(InvalidEmployees.elements);

            // Insert valid records into Employees
            if (validRecords.length > 0) {
                await tx.run(DELETE.from(Employees));
                await tx.run(INSERT.into(Employees).entries(
                    validRecords.map(rec => cleanRecordForEntity(rec, allowedEmpFields))
                ));
            }

            // Insert invalid records into InvalidEmployees
            if (invalidRecords.length > 0) {
                await tx.run(DELETE.from(InvalidEmployees));
                await tx.run(INSERT.into(InvalidEmployees).entries(
                    invalidRecords.map(rec => cleanRecordForEntity(rec, allowedInvalidFields))
                ));
            }

            return {
                message: 'Upload complete',
                totalRecords: data.length,
                insertedRecords: validRecords.length,
                skippedRecords: invalidRecords.length,
                downloadInvalidRecords: downloadLink
            };

        } catch (error) {
            return req.error(500, `Bulk upload failed: ${error.message}`);
        }
    });

    // Save invalid employees in a separate call (for UI "Save Invalid Records" button)
    srv.on('saveInvalidEmployees', async (req) => {
        const { records } = req.data;
        console.log("saveInvalidEmployees called. Payload:", records);
        if (!records || !Array.isArray(records) || records.length === 0) {
            console.log("No records provided!");
            return req.error(400, 'No records provided');
        }
        try {
            const allowedFields = Object.keys(srv.entities.InvalidEmployees.elements);
            const cleanRecords = records.map(record => {
                const clean = {};
                for (const key of allowedFields) {
                    if (record.hasOwnProperty(key)) {
                        clean[key] = record[key];
                    }
                }
                return clean;
            });
            console.log("Cleaned invalid records to insert:", cleanRecords);
    
            if (cleanRecords.length) {
                const result = await INSERT.into(srv.entities.InvalidEmployees).entries(cleanRecords);
                console.log("Insert result:", result);
            }
            return { message: "Invalid records saved successfully." };
        } catch (e) {
            console.error("Error saving invalid records:", e);
            return req.error(500, `Failed to save invalid records: ${e.message}`);
        }
    });
};