const ExcelJS = require('exceljs');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
 

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

        await workbook.xlsx.writeFile(filePath);
        return `/files/${filename}`;
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
                    invalidRecords.push({ ...record, ValidationErrors: errors.join(", ") });
                }
            }

            let downloadLink = null;
            if (invalidRecords.length > 0) {
                downloadLink = await createInvalidRecordsExcel(invalidRecords);
            } else {
                downloadLink = `/files/invalid_records_123456.xlsx`; // fallback
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
            return req.error(500, `Bulk upload failed: ${error.message}`);
        }
    });
};