
// // // // module.exports = async function (srv) {
// // // //     const { Employees } = srv.entities;

// // // //     this.on("bulkUpload", async (req) => {
// // // //         const { jsonData } = req.data;

// // // //         try {
// // // //             const data = JSON.parse(jsonData);

// // // //             if (!data || !Array.isArray(data) || data.length === 0) {
// // // //                 return req.error(400, 'No data provided or data is not an array');
// // // //             }

// // // //             // Validate each record
// // // //             const validRecords = [];
// // // //             const namePattern = /^[A-Za-z\s]+$/;
// // // //             const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // // //             const phonePattern = /^\d{10}$/;

// // // //             for (const record of data) {
// // // //                 const nameValid = namePattern.test(record.Name);
// // // //                 const emailValid = emailPattern.test(record.Email);
// // // //                 const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));
// // // //                 if (nameValid && emailValid && phoneValid) {
// // // //                     // Format phone and date if needed
// // // //                     record.Phone = String(record.Phone).padStart(10, "0");
// // // //                     const dateParts = record.JoiningDate?.split("-");
// // // //                     if (dateParts?.length === 3) {
// // // //                         const [year, month, day] = dateParts;
// // // //                         if (day.length === 2 && month.length === 2 && year.length === 4) {
// // // //                             record.JoiningDate = `${year}-${month}-${day}`;
// // // //                         } else {
// // // //                             record.JoiningDate = null;
// // // //                         }
// // // //                     }

// // // //                     validRecords.push(record);
// // // //                 }
// // // //             }

// // // //             if (validRecords.length === 0) {
// // // //                 return req.error(400, 'No valid records found. Upload aborted.');
// // // //             }

// // // //             const tx = cds.transaction(req);

// // // //             // Step 1: Delete all existing records
// // // //             await tx.run(DELETE.from(Employees));

// // // //             // Step 2: Insert only valid records
// // // //             await tx.run(INSERT.into(Employees).entries(validRecords));

// // // //             return {
// // // //                 message: 'Records upload successful. Previous records deleted.',
// // // //                 totalRecords: data.length,
// // // //                 insertedRecords: validRecords.length,
// // // //                 skippedRecords: data.length - validRecords.length
// // // //             };

// // // //         } catch (error) {
// // // //             console.error('Bulk upload error:', error);
// // // //             return req.error(500, `Bulk upload failed: ${error.message}`);
// // // //         }
// // // //     });
// // // // };
// // // const ExcelJS = require('exceljs');
// // // const fs = require('fs');
// // // const path = require('path');

// // // module.exports = async function (srv) {
// // //     const { Employees } = srv.entities;

// // //     async function createInvalidRecordsExcel(invalidRecords) {
// // //         const workbook = new ExcelJS.Workbook();
// // //         const worksheet = workbook.addWorksheet('Invalid Records');

// // //         if (invalidRecords.length > 0) {
// // //             worksheet.columns = Object.keys(invalidRecords[0]).map(key => ({
// // //                 header: key,
// // //                 key: key,
// // //                 width: 20
// // //             }));

// // //             worksheet.addRows(invalidRecords);
// // //         }

// // //         const filePath = path.join(__dirname, '..', 'public', 'invalid_records.xlsx');
// // //         await workbook.xlsx.writeFile(filePath);
// // //         return filePath;
// // //     }

// // //     srv.on("bulkUpload", async (req) => {
// // //         const { jsonData } = req.data;

// // //         try {
// // //             const data = JSON.parse(jsonData);

// // //             if (!data || !Array.isArray(data) || data.length === 0) {
// // //                 return req.error(400, 'No data provided or data is not an array');
// // //             }

// // //             const validRecords = [];
// // //             const invalidRecords = [];

// // //             const namePattern = /^[A-Za-z\s]+$/;
// // //             const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // //             const phonePattern = /^\d{10}$/;

// // //             for (const record of data) {
// // //                 const nameValid = namePattern.test(record.Name);
// // //                 const emailValid = emailPattern.test(record.Email);
// // //                 const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));

// // //                 if (nameValid && emailValid && phoneValid) {
// // //                     record.Phone = String(record.Phone).padStart(10, "0");

// // //                     const dateParts = record.JoiningDate?.split("-");
// // //                     if (dateParts?.length === 3) {
// // //                         const [year, month, day] = dateParts;
// // //                         if (day.length === 2 && month.length === 2 && year.length === 4) {
// // //                             record.JoiningDate = `${year}-${month}-${day}`;
// // //                         } else {
// // //                             record.JoiningDate = null;
// // //                         }
// // //                     }

// // //                     validRecords.push(record);
// // //                 } else {
// // //                     invalidRecords.push(record);
// // //                 }
// // //             }

// // //             if (validRecords.length === 0) {
// // //                 if (invalidRecords.length > 0) {
// // //                     await createInvalidRecordsExcel(invalidRecords);
// // //                 }
// // //                 return req.error(400, 'No valid records found. Upload aborted.');
// // //             }

// // //             const tx = cds.transaction(req);

// // //             await tx.run(DELETE.from(Employees));
// // //             await tx.run(INSERT.into(Employees).entries(validRecords));

// // //             let downloadLink = null;
// // //             if (invalidRecords.length > 0) {
// // //                 await createInvalidRecordsExcel(invalidRecords);
// // //                 downloadLink = `/public/invalid_records.xlsx`;
// // //             }

// // //             return {
// // //                 message: 'Records upload successful. Previous records deleted.',
// // //                 totalRecords: data.length,
// // //                 insertedRecords: validRecords.length,
// // //                 skippedRecords: invalidRecords.length,
// // //                 downloadInvalidRecords: downloadLink
// // //             };

// // //         } catch (error) {
// // //             console.error('Bulk upload error:', error);
// // //             return req.error(500, `Bulk upload failed: ${error.message}`);
// // //         }
// // //     });
// // // };
// // const ExcelJS = require('exceljs');
// // const fs = require('fs');
// // const path = require('path');

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

// //         // Ensure the 'files' directory exists
// //         const filesDir = path.join(__dirname, '..', 'files');
// //         if (!fs.existsSync(filesDir)) {
// //             fs.mkdirSync(filesDir, { recursive: true });
// //         }

// //         const filePath = path.join(filesDir, 'invalid_records.xlsx');
// //         await workbook.xlsx.writeFile(filePath);
// //         return filePath;
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
// //             const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// //             const phonePattern = /^\d{10}$/;

// //             for (const record of data) {
// //                 const nameValid = namePattern.test(record.Name);
// //                 const emailValid = emailPattern.test(record.Email);
// //                 const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));

// //                 if (nameValid && emailValid && phoneValid) {
// //                     record.Phone = String(record.Phone).padStart(10, "0");

// //                     const dateParts = record.JoiningDate?.split("-");
// //                     if (dateParts?.length === 3) {
// //                         const [year, month, day] = dateParts;
// //                         if (day.length === 2 && month.length === 2 && year.length === 4) {
// //                             record.JoiningDate = `${year}-${month}-${day}`;
// //                         } else {
// //                             record.JoiningDate = null;
// //                         }
// //                     }

// //                     validRecords.push(record);
// //                 } else {
// //                     invalidRecords.push(record);
// //                 }
// //             }

// //             let downloadLink = null;
// //             if (invalidRecords.length > 0) {
// //                 await createInvalidRecordsExcel(invalidRecords);
// //                 downloadLink = `/files/invalid_records.xlsx`; // Updated to match server.js static route
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
// //                 message: 'Records upload successful. Previous records deleted.',
// //                 totalRecords: data.length,
// //                 insertedRecords: validRecords.length,
// //                 skippedRecords: invalidRecords.length,
// //                 downloadInvalidRecords: downloadLink
// //             };

// //         } catch (error) {
// //             console.error('Bulk upload error:', error);
// //             return req.error(500, `Bulk upload failed: ${error.message}`);
// //         }
// //     });
// // };

// const ExcelJS = require('exceljs');
// const fs = require('fs');
// const path = require('path');

// module.exports = async function (srv) {
//     const { Employees } = srv.entities;

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

//         // ✅ Generate a unique filename using timestamp
//         const timestamp = Date.now();
//         const filename = `invalid_records_${timestamp}.xlsx`;
//         const filePath = path.join(filesDir, filename);

//         console.log("Creating Excel file for invalid records...");

//         await workbook.xlsx.writeFile(filePath);
//         return `/files/${filename}`; // Return relative path for download
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
//             const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             const phonePattern = /^\d{10}$/;

//             for (const record of data) {
                
// if (invalidRecords.length > 0) {
// console.log("Invalid records found:", invalidRecords.length);
// downloadLink = await createInvalidRecordsExcel(invalidRecords);
//     }
    
//                 const errors = [];

//                 const nameValid = namePattern.test(record.Name);
//                 if (!nameValid) errors.push("Invalid Name");

//                 const emailValid = emailPattern.test(record.Email);
//                 if (!emailValid) errors.push("Invalid Email");

//                 const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));
//                 if (!phoneValid) errors.push("Invalid Phone");

//                 const dateParts = record.JoiningDate?.split("-");
//                 let dateValid = false;
//                 if (dateParts?.length === 3) {
//                     const [year, month, day] = dateParts;
//                     dateValid = day.length === 2 && month.length === 2 && year.length === 4;
//                 }
//                 if (!dateValid) errors.push("Invalid JoiningDate");

//                 if (errors.length === 0) {
//                     record.Phone = String(record.Phone).padStart(10, "0");
//                     record.JoiningDate = dateValid ? `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}` : null;
//                     validRecords.push(record);
//                 } else {
//                     invalidRecords.push({ ...record, ValidationErrors: errors.join(", ") });
//                 }
//             }

//             let downloadLink = null;
//             if (invalidRecords.length > 0) {
//                 downloadLink = await createInvalidRecordsExcel(invalidRecords);
//             }

//             if (validRecords.length === 0) {
//                 return {
//                     message: 'No valid records found. Upload aborted.',
//                     totalRecords: data.length,
//                     insertedRecords: 0,
//                     skippedRecords: invalidRecords.length,
//                     downloadInvalidRecords: downloadLink
//                 };
//             }

//             const tx = cds.transaction(req);

//             await tx.run(DELETE.from(Employees));
//             await tx.run(INSERT.into(Employees).entries(validRecords));

//             return {
//                 message: 'Records upload successful. Previous records deleted.',
//                 totalRecords: data.length,
//                 insertedRecords: validRecords.length,
//                 skippedRecords: invalidRecords.length,
//                 downloadInvalidRecords: downloadLink
//             };

//         } catch (error) {
//             console.error('Bulk upload error:', error);
//             return req.error(500, `Bulk upload failed: ${error.message}`);
//         }
//     });
// };
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

module.exports = async function (srv) {
    const { Employees } = srv.entities;

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

        console.log("Creating Excel file for invalid records...");

        await workbook.xlsx.writeFile(filePath);
        return `/files/${filename}`;
    }

    srv.on("bulkUpload", async (req) => {
        console.log("bulkUpload triggered"); 
        const { jsonData } = req.data;

        try {
            const data = JSON.parse(jsonData);

            if (!data || !Array.isArray(data) || data.length === 0) {
                return req.error(400, 'No data provided or data is not an array');
            }

            const validRecords = [];
            const invalidRecords = [];

            const namePattern = /^[A-Za-z\s]+$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^\d{10}$/;

            for (const record of data) {
                const errors = [];

                const nameValid = namePattern.test(record.Name);
                if (!nameValid) errors.push("Invalid Name");

                const emailValid = emailPattern.test(record.Email);
                if (!emailValid) errors.push("Invalid Email");

                const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));
                if (!phoneValid) errors.push("Invalid Phone");

                const dateParts = record.JoiningDate?.split("-");
                let dateValid = false;
                if (dateParts?.length === 3) {
                    const [year, month, day] = dateParts;
                    dateValid = day.length === 2 && month.length === 2 && year.length === 4;
                }
                if (!dateValid) errors.push("Invalid JoiningDate");

                if (errors.length === 0) {
                    record.Phone = String(record.Phone).padStart(10, "0");
                    record.JoiningDate = dateValid ? `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}` : null;
                    validRecords.push(record);
                } else {
                    invalidRecords.push({ ...record, ValidationErrors: errors.join(", ") });
                }
            }

            let downloadLink = null;
            if (invalidRecords.length > 0) {
                downloadLink = await createInvalidRecordsExcel(invalidRecords);
            } else {
                // Optional: return a default file or message if no invalid records
                downloadLink = `/files/invalid_records_123456.xlsx`; // static fallback
            }

            if (validRecords.length === 0) {
                return {
                    message: 'No valid records found. Upload aborted.',
                    totalRecords: data.length,
                    insertedRecords: 0,
                    skippedRecords: invalidRecords.length,
                    downloadInvalidRecords: downloadLink
                };
            }

            const tx = cds.transaction(req);

            await tx.run(DELETE.from(Employees));
            await tx.run(INSERT.into(Employees).entries(validRecords));

            return {
                message: 'Upload complete',
                totalRecords: data.length,
                insertedRecords: validRecords.length,
                skippedRecords: invalidRecords.length,
                downloadInvalidRecords: downloadLink
            };

        } catch (error) {
            console.error('Bulk upload error:', error);
            return req.error(500, `Bulk upload failed: ${error.message}`);
        }
    });
};
