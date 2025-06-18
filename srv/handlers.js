
module.exports = async function (srv) {
    const { Employees } = srv.entities;

    this.on("bulkUpload", async (req) => {
        const { jsonData } = req.data;

        try {
            const data = JSON.parse(jsonData);

            if (!data || !Array.isArray(data) || data.length === 0) {
                return req.error(400, 'No data provided or data is not an array');
            }

            // Validate each record
            const validRecords = [];
            const namePattern = /^[A-Za-z\s]+$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^\d{10}$/;

            for (const record of data) {
                const nameValid = namePattern.test(record.Name);
                const emailValid = emailPattern.test(record.Email);
                const phoneValid = phonePattern.test(String(record.Phone).padStart(10, "0"));

                if (nameValid && emailValid && phoneValid) {
                    // Format phone and date if needed
                    record.Phone = String(record.Phone).padStart(10, "0");

                    const dateParts = record.JoiningDate?.split("-");
                    if (dateParts?.length === 3) {
                        const [year, month, day] = dateParts;
                        if (day.length === 2 && month.length === 2 && year.length === 4) {
                            record.JoiningDate = `${year}-${month}-${day}`;
                        } else {
                            record.JoiningDate = null;
                        }
                    }

                    validRecords.push(record);
                }
            }

            if (validRecords.length === 0) {
                return req.error(400, 'No valid records found. Upload aborted.');
            }

            const tx = cds.transaction(req);

            // Step 1: Delete all existing records
            await tx.run(DELETE.from(Employees));

            // Step 2: Insert only valid records
            await tx.run(INSERT.into(Employees).entries(validRecords));

            return {
                message: 'Records upload successful. Previous records deleted.',
                totalRecords: data.length,
                insertedRecords: validRecords.length,
                skippedRecords: data.length - validRecords.length
            };

        } catch (error) {
            console.error('Bulk upload error:', error);
            return req.error(500, `Bulk upload failed: ${error.message}`);
        }
    });
};
