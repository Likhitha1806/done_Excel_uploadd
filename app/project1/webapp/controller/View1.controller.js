// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/m/MessageToast",
//     "sap/m/MessageBox",
//     "sap/m/Column",
//     "sap/m/Text",
//     "sap/m/ColumnListItem"
// ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem) {
//     "use strict";

//     return Controller.extend("project1.controller.View1", {
//         onInit: function () {
//             // Model for controlling visibility of invalid record buttons
//             var oUIModel = new JSONModel({ hasInvalidEmployees: false });
//             this.getView().setModel(oUIModel, "ui");
//         },

//         onDownloadTemplate: function () {
//             $.ajax({
//                 url: "model/Template.csv",
//                 dataType: "text",
//                 success: (data) => {
//                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
//                     const link = document.createElement("a");
//                     link.setAttribute("href", encodedUri);
//                     link.setAttribute("download", "Template.csv");
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                     MessageToast.show("Template downloaded!");
//                 },
//                 error: () => {
//                     MessageToast.show("Failed to fetch CSV for download.");
//                 }
//             });
//         },

//         onFileChange: function (oEvent) {
//             const file = oEvent.getParameter("files")[0];
//             this._uploadedFile = file;
//             if (file && window.FileReader) {
//                 const reader = new FileReader();

//                 reader.onload = (e) => {
//                     const csv = e.target.result;
//                     const lines = csv.split("\n").filter(Boolean);
//                     const headers = lines[0].trim().split(",");
//                     const allRecords = [];
//                     const invalidRecords = [];

//                     // Validation patterns
//                     const namePattern = /^[A-Za-z\s]+$/;
//                     const psNumberPattern = /^\d{6,10}$/;
//                     const datePattern = /^\d{4}-\d{2}-\d{2}$/;
//                     // Add other numeric columns if required
//                     const numericColumns = []; // e.g., ["SALARY", "AGE"]

//                     for (let i = 1; i < lines.length; i++) {
//                         const line = lines[i].trim();
//                         if (line) {
//                             const values = line.split(",");
//                             const record = {};
//                             headers.forEach((header, index) => {
//                                 record[header] = values[index];
//                             });

//                             // Validation logic
//                             let isValid = true;
//                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
//                                 isValid = false;
//                             }
//                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
//                                 isValid = false;
//                             }
//                             if (!record.DATEOFJOINING || !datePattern.test(record.DATEOFJOINING)) {
//                                 isValid = false;
//                             }

//                             // Numeric column validation, add your numeric columns in the array above
//                             numericColumns.forEach(col => {
//                                 if (record[col] === "" || record[col] === undefined || isNaN(Number(record[col]))) {
//                                     isValid = false;
//                                 }
//                             });

//                             record._isValid = isValid;
//                             allRecords.push(record);

//                             if (!isValid) {
//                                 invalidRecords.push(record);
//                             }
//                         }
//                     }

//                     // Set all records to the model so all are shown in the table
//                     const oView = this.getView();
//                     const allModel = new JSONModel({ employees: allRecords });
//                     oView.setModel(allModel);

//                     // Save invalid records to core model for download
//                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");

//                     // Update UI model for button visibility
//                     var oUIModel = oView.getModel("ui");
//                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);

//                     // Build table columns and rows dynamically
//                     const oTable = oView.byId("dataTable");
//                     oTable.removeAllColumns();
//                     oTable.removeAllItems();

//                     headers.forEach(header => {
//                         oTable.addColumn(new Column({
//                             header: new Text({ text: header }),
//                             width: "200px"
//                         }));
//                     });

//                     allRecords.forEach(row => {
//                         const cells = headers.map(header => new Text({ text: row[header] || "" }));
//                         const oItem = new ColumnListItem({ cells });
//                         if (row._isValid === false) {
//                             oItem.addStyleClass("invalidRow");
//                         }
//                         oTable.addItem(oItem);
//                     });

//                     oTable.setVisible(true);
//                     oView.byId("saveButton").setVisible(true);

//                     if (invalidRecords.length > 0) {
//                         MessageBox.warning("Some records are invalid. Please verify or download them.");
//                     } else {
//                         MessageToast.show("File uploaded and all records displayed!");
//                     }

//                     // Upload valid records to HANA backend,
                   
//                     const validRecords = allRecords.filter(r => r._isValid);
//                     if (validRecords.length > 0) {
//                         const mainModel = this.getView().getModel("mainModel");
//                         if (mainModel) {
//                             mainModel.callFunction("/bulkUpload", {
//                                 method: "POST",
//                                 urlParameters: {
//                                     jsonData: JSON.stringify(validRecords)
//                                 },
//                                 success: () => {
//                                     MessageToast.show("Valid records uploaded successfully.");
//                                 },
//                                 error: (error) => {
//                                     console.log("Upload error:", error);
//                                     MessageToast.show("Upload to backend failed.");
//                                 }
//                             });
//                         } else {
//                             MessageToast.show("Main model for backend upload not found.");
//                         }
//                     } else {
//                         MessageToast.show("No valid records to upload to backend.");
//                     }
//                 };

//                 reader.readAsText(file);
//             } else {
//                 MessageToast.show("This browser does not support file reading.");
//             }
//         },

//         refreshTable: function () {
//             $.ajax({
//                 url: "/odata/v4/ecommerce/Employees",
//                 method: "GET",
//                 success: (data) => {
//                     MessageToast.show("Data refreshed successfully.");
//                 },
//                 error: (error) => {
//                     MessageBox.error("Failed to refresh data.");
//                 }
//             });
//         },

//         onSave: function () {
//             const oModel = this.getView().getModel();
//             const data = oModel.getProperty("/employees");
//             console.log("Saved data:", data);
//         },

//         onopeninvalidrecords: function () {
//             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//             oRouter.navTo("invalidrecords");
//         },

//         onExportExcelButton: function () {
//             const invalidModel = sap.ui.getCore().getModel("invalidModel");
//             const invalidData = invalidModel.getProperty("/invalidEmployees");

//             if (!invalidData || invalidData.length === 0) {
//                 sap.m.MessageToast.show("No invalid records to export.");
//                 return;
//             }

//             // Use headers from the first invalid record for CSV
//             const headers = invalidData.length > 0 ? Object.keys(invalidData[0]).filter(h => h !== "_isValid") : [];
//             let csvContent = headers.join(",") + "\n";
//             invalidData.forEach(record => {
//                 csvContent += headers.map(h => record[h] || "").join(",") + "\n";
//             });

//             const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//             const link = document.createElement("a");
//             link.href = URL.createObjectURL(blob);
//             link.download = "InvalidRecords.csv";
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             URL.revokeObjectURL(link.href);

//             sap.m.MessageToast.show("Invalid records exported.");
//         }
//     });
// });

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Column",
    "sap/m/Text",
    "sap/m/ColumnListItem"
], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem) {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            var oUIModel = new JSONModel({ hasInvalidEmployees: false });
            this.getView().setModel(oUIModel, "ui");
        },

        onDownloadTemplate: function () {
            $.ajax({
                url: "model/Template.csv",
                dataType: "text",
                success: (data) => {
                    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "Template.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    MessageToast.show("Template downloaded!");
                },
                error: () => {
                    MessageToast.show("Failed to fetch CSV for download.");
                }
            });
        },

        onFileChange: function (oEvent) {
            const file = oEvent.getParameter("files")[0];
            this._uploadedFile = file;
            if (file && window.FileReader) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const csv = e.target.result;
                    const lines = csv.split("\n").filter(Boolean);
                    if (lines.length < 2) {
                        MessageBox.warning("CSV must have header and at least one data row.");
                        return;
                    }
                    const rawHeaders = lines[0].trim().split(",").map(h => h.trim());
                    // Map CSV headers to HANA entity fields
                    const csvToEntityMap = {
                        "APPLICATION ID": "APPLICATIONID",
                        "IRM PS NUMBER": "IRMPSNUMBER",
                        "IRM NAME": "IRMNAME",
                        "EMPLOYEE NAME": "EMPLOYEENAME",
                        "PS NUMBER": "PSNUMBER",
                        "BASE BU": "BASEBU",
                        "BU CODE": "BUCODE",
                        "ALLOCATED BU": "ALLOCATEDBU",
                        "LOCATION": "LOCATION",
                        "DATE OF JOINING": "DATEOFJOINING",
                        "CURRENT CONTRACT END DATE": "CURRENTCONTRACTENDDATE",
                        "VENDOR NAME": "VENDORNAME",
                        "CONTRACT EXTENSION": "CONTRACTEXTENSION",
                        "CONTRACT END DATE": "CONTRACTENDDATE",
                        "CONTRACT EXTENSION START DATE": "CONTRACTEXTENSIONSTARTDATE",
                        "CONTRACT EXTENSION END DATE": "CONTRACTEXTENSIONENDDATE",
                        "CURRENT PAY RATE": "CURRENTPAYRATE",
                        "CURRENCY": "CURRENCY",
                        "FREQUENCY": "FREQUENCY",
                        "PAY RATE CHANGE": "PAYRATECHANGE",
                        "NEW PAY RATE": "NEWPAYRATE",
                        "SKILLS": "SKILLS",
                        "PROJECT NAME": "PROJECTNAME",
                        "CLIENT NAME": "CLIENTNAME",
                        "NOTICE PERIOD": "NOTICEPERIOD",
                        "WORKING DAYS N SHIFT": "WORKINGDAYSNSHIFT",
                        "OTHER ALLOWANCES": "OTHERALLOWANCES",
                        "SPECIAL TERMS": "SPECIALTERMS",
                        "STATUS": "STATUS",
                        "SUBMITTED BY": "SUBMITTEDBY",
                        "MODIFIED BY": "MODIFIEDBY",
                        "SUBMITTED DATE": "SUBMITTEDDATE",
                        "MODIFIED DATE": "MODIFIEDDATE",
                        "WORK ORDER": "WORKORDER",
                        "VMO HEAD FLAG": "VMOHEADFLAG",
                        "VMO TEAM FLAG": "VMOTEAMFLAG",
                        "ACTION TYPE": "ACTIONTYPE",
                        "FINAL REASON": "FINALRESAON",
                        "REASON TYPE": "REASONTYPE"
                    };

                    // Only use mapped entity fields present in the CSV
                    const entityFields = rawHeaders.map(h => csvToEntityMap[h.toUpperCase()] || h);

                    const allRecords = [];
                    const invalidRecords = [];

                    // Validation patterns
                    const namePattern = /^[A-Za-z\s]+$/;
                    const psNumberPattern = /^\d{6,10}$/;
                    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
                    const numericColumns = ["CURRENTPAYRATE", "NEWPAYRATE"];
                    const booleanColumns = ["CONTRACTEXTENSION", "PAYRATECHANGE", "VMOHEADFLAG", "VMOTEAMFLAG"];

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const values = line.split(",");
                            const record = {};
                            rawHeaders.forEach((header, index) => {
                                const entityField = csvToEntityMap[header.toUpperCase()] || header;
                                record[entityField] = values[index] ? values[index].trim() : "";
                            });

                            // Date conversion
                            [
                                "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
                                "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
                                "SUBMITTEDDATE", "MODIFIEDDATE"
                            ].forEach(dateField => {
                                if (record[dateField] && /^\d{2}-\d{2}-\d{4}$/.test(record[dateField])) {
                                    const [dd, mm, yyyy] = record[dateField].split("-");
                                    record[dateField] = `${yyyy}-${mm}-${dd}`;
                                }
                            });

                            // Boolean conversion
                            booleanColumns.forEach(field => {
                                if (record[field]) {
                                    const val = record[field].toString().toLowerCase();
                                    record[field] = (val === "true" || val === "1" || val === "yes");
                                } else if (record[field] !== undefined) {
                                    record[field] = false;
                                }
                            });

                            // Numeric conversion
                            numericColumns.forEach(col => {
                                if (record[col]) {
                                    const num = parseFloat(record[col]);
                                    record[col] = isNaN(num) ? null : num;
                                }
                            });

                            // Validation logic (customize/extend as needed)
                            let isValid = true;
                            if (record.EMPLOYEENAME && !namePattern.test(record.EMPLOYEENAME)) isValid = false;
                            if (record.PSNUMBER && !psNumberPattern.test(record.PSNUMBER)) isValid = false;
                            if (record.DATEOFJOINING && !datePattern.test(record.DATEOFJOINING)) isValid = false;
                            numericColumns.forEach(col => {
                                if (record[col] !== undefined && record[col] !== null && isNaN(record[col])) isValid = false;
                            });

                            record._isValid = isValid;
                            allRecords.push(record);
                            if (!isValid) invalidRecords.push(record);
                        }
                    }

                    // Set all records to the model so all are shown in the table
                    const oView = this.getView();
                    const allModel = new JSONModel({ employees: allRecords });
                    oView.setModel(allModel);

                    // Save invalid records to core model for download
                    sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");

                    // Update UI model for button visibility
                    var oUIModel = oView.getModel("ui");
                    oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);

                    // Build table columns and rows dynamically
                    const oTable = oView.byId("dataTable");
                    oTable.removeAllColumns();
                    oTable.removeAllItems();

                    entityFields.forEach(header => {
                        oTable.addColumn(new Column({
                            header: new Text({ text: header }),
                            width: "200px"
                        }));
                    });

                    allRecords.forEach(row => {
                        const cells = entityFields.map(header => new Text({ text: (row[header] !== undefined && row[header] !== null) ? row[header].toString() : "" }));
                        const oItem = new ColumnListItem({ cells });
                        if (row._isValid === false) {
                            oItem.addStyleClass("invalidRow");
                        }
                        oTable.addItem(oItem);
                    });

                    oTable.setVisible(true);
                    oView.byId("saveButton").setVisible(true);

                    if (invalidRecords.length > 0) {
                        MessageBox.warning("Some records are invalid. Please verify or download them.");
                    } else {
                        MessageToast.show("File uploaded and all records displayed!");
                    }

                    // Upload valid records to HANA backend
                    const validRecords = allRecords.filter(r => r._isValid);
                    if (validRecords.length > 0) {
                        const mainModel = this.getView().getModel("mainModel");
                        if (mainModel) {
                            mainModel.callFunction("/bulkUpload", {
                                method: "POST",
                                urlParameters: {
                                    jsonData: JSON.stringify(validRecords)
                                },
                                success: (data) => {
                                    MessageToast.show("Valid records uploaded successfully.");
                                    if (data && data.downloadInvalidRecords) {
                                        // Optionally: show download link for invalids if backend returns one
                                        console.log("Invalid download link:", data.downloadInvalidRecords);
                                    }
                                },
                                error: (error) => {
                                    // Show backend error message if available
                                    let msg = "Upload to backend failed.";
                                    if (error && error.responseText) {
                                        try {
                                            const payload = JSON.parse(error.responseText);
                                            msg = payload.error && payload.error.message ? payload.error.message : msg;
                                        } catch (e) {}
                                    }
                                    console.log("Upload error:", error);
                                    MessageToast.show(msg);
                                }
                            });
                        } else {
                            MessageToast.show("Main model for backend upload not found.");
                        }
                    } else {
                        MessageToast.show("No valid records to upload to backend.");
                    }
                };

                reader.readAsText(file);
            } else {
                MessageToast.show("This browser does not support file reading.");
            }
        },

        refreshTable: function () {
            $.ajax({
                url: "/odata/v4/ecommerce/Employees",
                method: "GET",
                success: (data) => {
                    MessageToast.show("Data refreshed successfully.");
                },
                error: (error) => {
                    MessageBox.error("Failed to refresh data.");
                }
            });
        },

        onSave: function () {
            const oModel = this.getView().getModel();
            const data = oModel.getProperty("/employees");
            console.log("Saved data:", data);
        },

        onopeninvalidrecords: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("invalidrecords");
        },

        onExportExcelButton: function () {
            const invalidModel = sap.ui.getCore().getModel("invalidModel");
            const invalidData = invalidModel.getProperty("/invalidEmployees");

            if (!invalidData || invalidData.length === 0) {
                sap.m.MessageToast.show("No invalid records to export.");
                return;
            }

            // Use entity field headers for CSV
            const headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
            let csvContent = headers.join(",") + "\n";
            invalidData.forEach(record => {
                csvContent += headers.map(h => record[h] || "").join(",") + "\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "InvalidRecords.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            sap.m.MessageToast.show("Invalid records exported.");
        }
    });
});