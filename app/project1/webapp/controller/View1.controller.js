// // // // // // // // sap.ui.define([
// // // // // // // //     "sap/ui/core/mvc/Controller",
// // // // // // // //     "sap/ui/model/json/JSONModel",
// // // // // // // //     "sap/m/MessageToast",
// // // // // // // //     "sap/m/MessageBox",
// // // // // // // //     "sap/m/Column",
// // // // // // // //     "sap/m/Text",
// // // // // // // //     "sap/m/ColumnListItem",
// // // // // // // //     "sap/m/Button",
// // // // // // // //     "sap/m/HBox"
// // // // // // // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // // // // // // //     "use strict";

// // // // // // // //     const PAGE_SIZE = 5; // Number of records per page

// // // // // // // //     // Helper to convert DD-MM-YYYY to YYYY-MM-DD for HANA compatibility
// // // // // // // //     function convertToISO(dateStr) {
// // // // // // // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // // // // // // //             var parts = dateStr.split("-");
// // // // // // // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // // // // // // //         }
// // // // // // // //         return dateStr;
// // // // // // // //     }

// // // // // // // //     // Helper to deduplicate records by PSNUMBER (keep first occurrence)
// // // // // // // //     function deduplicateByPSNUMBER(records) {
// // // // // // // //         const seen = new Set();
// // // // // // // //         return records.filter(record => {
// // // // // // // //             if (seen.has(record.PSNUMBER)) {
// // // // // // // //                 return false;
// // // // // // // //             } else {
// // // // // // // //                 seen.add(record.PSNUMBER);
// // // // // // // //                 return true;
// // // // // // // //             }
// // // // // // // //         });
// // // // // // // //     }

// // // // // // // //     return Controller.extend("project1.controller.View1", {
// // // // // // // //         onInit: function () {
// // // // // // // //             var oUIModel = new JSONModel({ 
// // // // // // // //                 hasInvalidEmployees: false,
// // // // // // // //                 hasInactiveEmployees: false,
// // // // // // // //                 currentPage: 1,
// // // // // // // //                 totalPages: 1
// // // // // // // //             });
// // // // // // // //             this.getView().setModel(oUIModel, "ui");
// // // // // // // //         },

// // // // // // // //         onDownloadTemplate: function () {
// // // // // // // //             $.ajax({
// // // // // // // //                 url: "model/Template.csv",
// // // // // // // //                 dataType: "text",
// // // // // // // //                 success: (data) => {
// // // // // // // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // // // // // // //                     const link = document.createElement("a");
// // // // // // // //                     link.setAttribute("href", encodedUri);
// // // // // // // //                     link.setAttribute("download", "Template.csv");
// // // // // // // //                     document.body.appendChild(link);
// // // // // // // //                     link.click();
// // // // // // // //                     document.body.removeChild(link);
// // // // // // // //                     MessageToast.show("Template downloaded!");
// // // // // // // //                 },
// // // // // // // //                 error: () => {
// // // // // // // //                     MessageToast.show("Failed to fetch CSV for download.");
// // // // // // // //                 }
// // // // // // // //             });
// // // // // // // //         },

// // // // // // // //         onFileChange: function (oEvent) {
// // // // // // // //             const file = oEvent.getParameter("files")[0];
// // // // // // // //             this._uploadedFile = file;
// // // // // // // //             if (file && window.FileReader) {
// // // // // // // //                 const reader = new FileReader();

// // // // // // // //                 reader.onload = (e) => {
// // // // // // // //                     const csv = e.target.result;
// // // // // // // //                     const lines = csv.split("\n").filter(Boolean);
// // // // // // // //                     let headers = lines[0].trim().split(",");
// // // // // // // //                     const allRecords = [];
// // // // // // // //                     const invalidRecords = [];
// // // // // // // //                     const inactiveRecords = [];

// // // // // // // //                     // ApplicationID Format: SE<Year>-<UserId>-<XX>
// // // // // // // //                     const prefix = "SE";
// // // // // // // //                     const year = new Date().getFullYear();
// // // // // // // //                     // Try to get the SAP Fiori user id, fallback to "USER"
// // // // // // // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // // // // // // //                     let applicationIdCounter = 1; // Start from 1 for each upload

// // // // // // // //                     // Validation patterns
// // // // // // // //                     const namePattern = /^[A-Za-z\s]+$/;
// // // // // // // //                     const psNumberPattern = /^\d{9}$/;

// // // // // // // //                     // Ensure APPLICATIONID header is present
// // // // // // // //                     if (!headers.includes("APPLICATIONID")) {
// // // // // // // //                         headers.push("APPLICATIONID");
// // // // // // // //                     }

// // // // // // // //                     for (let i = 1; i < lines.length; i++) {
// // // // // // // //                         const line = lines[i].trim();
// // // // // // // //                         if (line) {
// // // // // // // //                             const values = line.split(",");
// // // // // // // //                             const record = {};
// // // // // // // //                             headers.forEach((header, index) => {
// // // // // // // //                                 // Skip APPLICATIONID, we'll set it ourselves
// // // // // // // //                                 if (header !== "APPLICATIONID") {
// // // // // // // //                                     record[header] = values[index] ? values[index].trim() : "";
// // // // // // // //                                 }
// // // // // // // //                             });

// // // // // // // //                             let isValid = true;

// // // // // // // //                             // Inactive records logic
// // // // // // // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // // // // // // //                                 inactiveRecords.push(record);
// // // // // // // //                                 isValid = false;
// // // // // // // //                             }

// // // // // // // //                             // Only characters and spaces for EMPLOYEENAME (no numbers)
// // // // // // // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // // // // // // //                                 isValid = false;
// // // // // // // //                             }
// // // // // // // //                             // Only 9 digits, no letters, for PSNUMBER
// // // // // // // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // // // // // // //                                 isValid = false;
// // // // // // // //                             }

// // // // // // // //                             // Convert DD-MM-YYYY to YYYY-MM-DD for all date fields (for HANA)
// // // // // // // //                             [
// // // // // // // //                                 "DATEOFJOINING", 
// // // // // // // //                                 "CURRENTCONTRACTENDDATE", 
// // // // // // // //                                 "CONTRACTENDDATE", 
// // // // // // // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // // // // // // //                                 "CONTRACTEXTENSIONENDDATE", 
// // // // // // // //                                 "SUBMITTEDDATE", 
// // // // // // // //                                 "MODIFIEDDATE"
// // // // // // // //                             ].forEach(field => {
// // // // // // // //                                 if (record[field]) {
// // // // // // // //                                     record[field] = convertToISO(record[field]);
// // // // // // // //                                 }
// // // // // // // //                             });

// // // // // // // //                             // Assign Application ID (formatted: SE<Year>-<UserId>-<XX>)
// // // // // // // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // // // // // // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // // // // // // //                             applicationIdCounter++;

// // // // // // // //                             record._isValid = isValid;
// // // // // // // //                             allRecords.push(record);

// // // // // // // //                             if (!isValid) {
// // // // // // // //                                 invalidRecords.push(record);
// // // // // // // //                             }
// // // // // // // //                         }
// // // // // // // //                     }

// // // // // // // //                     // Store for paging
// // // // // // // //                     this._allRecords = allRecords;
// // // // // // // //                     this._headers = headers;

// // // // // // // //                     // Set all records to the main model (for the table)
// // // // // // // //                     const oView = this.getView();
// // // // // // // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // // // // // // //                     // Store invalid and inactive records in core models
// // // // // // // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // // // // // // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // // // // // // //                     // Update UI model for button visibility and pagination
// // // // // // // //                     var oUIModel = oView.getModel("ui");
// // // // // // // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // // // // // // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // // // // // // //                     oUIModel.setProperty("/currentPage", 1);
// // // // // // // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / PAGE_SIZE) || 1);

// // // // // // // //                     // Show page 1
// // // // // // // //                     this._showPage(1);

// // // // // // // //                     if (invalidRecords.length > 0) {
// // // // // // // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // // // // // // //                     } else {
// // // // // // // //                         MessageToast.show("File uploaded and all records displayed!");
// // // // // // // //                     }

// // // // // // // //                     // Only upload valid and NOT inactive records
// // // // // // // //                     let validRecords = allRecords.filter(r =>
// // // // // // // //                         r._isValid &&
// // // // // // // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // // // // // // //                     );

// // // // // // // //                     // Deduplicate by PSNUMBER before sending to backend
// // // // // // // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // // // // // // //                     if (validRecords.length > 0) {
// // // // // // // //                         const mainModel = this.getView().getModel("mainModel");
// // // // // // // //                         if (mainModel) {
// // // // // // // //                             mainModel.callFunction("/bulkUpload", {
// // // // // // // //                                 method: "POST",
// // // // // // // //                                 urlParameters: {
// // // // // // // //                                     jsonData: JSON.stringify(validRecords)
// // // // // // // //                                 },
// // // // // // // //                                 success: () => {
// // // // // // // //                                     MessageToast.show("Valid records uploaded successfully.");
// // // // // // // //                                 },
// // // // // // // //                                 error: (error) => {
// // // // // // // //                                     console.log("Upload error:", error);
// // // // // // // //                                     MessageToast.show("Upload to backend failed.");
// // // // // // // //                                 }
// // // // // // // //                             });
// // // // // // // //                         } else {
// // // // // // // //                             MessageToast.show("Main model for backend upload not found.");
// // // // // // // //                         }
// // // // // // // //                     } else {
// // // // // // // //                         MessageToast.show("No valid records to upload to backend.");
// // // // // // // //                     }
// // // // // // // //                 };

// // // // // // // //                 reader.readAsText(file);
// // // // // // // //             } else {
// // // // // // // //                 MessageToast.show("This browser does not support file reading.");
// // // // // // // //             }
// // // // // // // //         },

// // // // // // // //         // PAGINATION LOGIC BEGIN
// // // // // // // //         _showPage: function (page) {
// // // // // // // //             const oView = this.getView();
// // // // // // // //             const allRecords = this._allRecords || [];
// // // // // // // //             const headers = this._headers || [];
// // // // // // // //             const pageSize = PAGE_SIZE;
// // // // // // // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // // // // // // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // // // // // // //             // Slice records for current page
// // // // // // // //             const start = (currentPage - 1) * pageSize;
// // // // // // // //             const end = start + pageSize;
// // // // // // // //             const pageRecords = allRecords.slice(start, end);

// // // // // // // //             // Rebuild table
// // // // // // // //             const oTable = oView.byId("dataTable");
// // // // // // // //             oTable.removeAllColumns();
// // // // // // // //             oTable.removeAllItems();

// // // // // // // //             headers.forEach(header => {
// // // // // // // //                 oTable.addColumn(new Column({
// // // // // // // //                     header: new Text({ text: header }),
// // // // // // // //                     width: "200px"
// // // // // // // //                 }));
// // // // // // // //             });

// // // // // // // //             pageRecords.forEach(row => {
// // // // // // // //                 const cells = headers.map(header => new Text({ text: row[header] || "" }));
// // // // // // // //                 const oItem = new ColumnListItem({ cells });
// // // // // // // //                 if (row._isValid === false) {
// // // // // // // //                     oItem.addStyleClass("invalidRow");
// // // // // // // //                 }
// // // // // // // //                 oTable.addItem(oItem);
// // // // // // // //             });

// // // // // // // //             oTable.setVisible(true);
// // // // // // // //             oView.byId("saveButton").setVisible(true);

// // // // // // // //             // Update UI model
// // // // // // // //             var oUIModel = oView.getModel("ui");
// // // // // // // //             oUIModel.setProperty("/currentPage", currentPage);
// // // // // // // //             oUIModel.setProperty("/totalPages", totalPages);

// // // // // // // //             // Rebuild pagination bar
// // // // // // // //             this._updatePaginationBar();
// // // // // // // //         },

// // // // // // // //         _updatePaginationBar: function () {
// // // // // // // //             const oView = this.getView();
// // // // // // // //             const paginationBar = oView.byId("paginationBar");
// // // // // // // //             const pageNumbersBox = oView.byId("pageNumbers");
// // // // // // // //             const oUIModel = oView.getModel("ui");
// // // // // // // //             const currentPage = oUIModel.getProperty("/currentPage");
// // // // // // // //             const totalPages = oUIModel.getProperty("/totalPages");
// // // // // // // //             const allRecords = this._allRecords || [];

// // // // // // // //             // Show bar only if > 1 page and records exist
// // // // // // // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);

// // // // // // // //             // Remove previous page number buttons
// // // // // // // //             pageNumbersBox.removeAllItems();

// // // // // // // //             // Show up to 5 page buttons
// // // // // // // //             let start = Math.max(1, currentPage - 2);
// // // // // // // //             let end = Math.min(totalPages, start + 4);
// // // // // // // //             if (end - start < 4) {
// // // // // // // //                 start = Math.max(1, end - 4);
// // // // // // // //             }
// // // // // // // //             for (let i = start; i <= end; i++) {
// // // // // // // //                 pageNumbersBox.addItem(new Button({
// // // // // // // //                     text: i.toString(),
// // // // // // // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // // // // // // //                     press: this.onPageSelect.bind(this, i),
// // // // // // // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // // // // // // //                 }));
// // // // // // // //             }

// // // // // // // //             // Enable/disable prev/next
// // // // // // // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // // // // // // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // // // // // // //         },

// // // // // // // //         onPrevPage: function () {
// // // // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // // // //             if (page > 1) this._showPage(page - 1);
// // // // // // // //         },

// // // // // // // //         onNextPage: function () {
// // // // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // // // //             let total = oUIModel.getProperty("/totalPages");
// // // // // // // //             if (page < total) this._showPage(page + 1);
// // // // // // // //         },

// // // // // // // //         onPageSelect: function (page) {
// // // // // // // //             this._showPage(page);
// // // // // // // //         },
// // // // // // // //         // PAGINATION LOGIC END

// // // // // // // //         refreshTable: function () {
// // // // // // // //             $.ajax({
// // // // // // // //                 url: "/odata/v4/ecommerce/Employees",
// // // // // // // //                 method: "GET",
// // // // // // // //                 success: (data) => {
// // // // // // // //                     MessageToast.show("Data refreshed successfully.");
// // // // // // // //                 },
// // // // // // // //                 error: (error) => {
// // // // // // // //                     MessageBox.error("Failed to refresh data.");
// // // // // // // //                 }
// // // // // // // //             });
// // // // // // // //         },

// // // // // // // //         onSave: function () {
// // // // // // // //             const oModel = this.getView().getModel();
// // // // // // // //             const data = oModel.getProperty("/employees");
// // // // // // // //             console.log("Saved data:", data);
// // // // // // // //         },

// // // // // // // //         onopeninvalidrecords: function () {
// // // // // // // //             var oView = this.getView();
// // // // // // // //             var oDialog = oView.byId("invalidRecordsDialog");
// // // // // // // //             var oTable = oView.byId("invalidRecordsTable");
// // // // // // // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // // // // // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // // // // // // //             // Remove previous columns and items
// // // // // // // //             oTable.removeAllColumns();
// // // // // // // //             oTable.removeAllItems();
        
// // // // // // // //             if (invalidData && invalidData.length > 0) {
// // // // // // // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
        
// // // // // // // //                 // Add Columns
// // // // // // // //                 headers.forEach(header => {
// // // // // // // //                     oTable.addColumn(new sap.m.Column({
// // // // // // // //                         header: new sap.m.Text({ text: header }),
// // // // // // // //                         width: "150px"
// // // // // // // //                     }));
// // // // // // // //                 });
        
// // // // // // // //                 // Add Rows
// // // // // // // //                 invalidData.forEach(row => {
// // // // // // // //                     var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // // // // // // //                     oTable.addItem(oItem);
// // // // // // // //                 });
// // // // // // // //             }
        
// // // // // // // //             oDialog.open();
// // // // // // // //         },
        
// // // // // // // //         onCloseInvalidDialog: function () {
// // // // // // // //             this.getView().byId("invalidRecordsDialog").close();
// // // // // // // //         },

// // // // // // // //         // onExportExcelButton: function () {
// // // // // // // //         //     const invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // // // // // //         //     const invalidData = invalidModel.getProperty("/invalidEmployees");

// // // // // // // //         //     if (!invalidData || invalidData.length === 0) {
// // // // // // // //         //         sap.m.MessageToast.show("No invalid records to export.");
// // // // // // // //         //         return;
// // // // // // // //         //     }

// // // // // // // //         //     const headers = invalidData.length > 0 ? Object.keys(invalidData[0]).filter(h => h !== "_isValid") : [];
// // // // // // // //         //     let csvContent = headers.join(",") + "\n";
// // // // // // // //         //     invalidData.forEach(record => {
// // // // // // // //         //         csvContent += headers.map(h => record[h] || "").join(",") + "\n";
// // // // // // // //         //     });

// // // // // // // //         //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// // // // // // // //         //     const link = document.createElement("a");
// // // // // // // //         //     link.href = URL.createObjectURL(blob);
// // // // // // // //         //     link.download = "InvalidRecords.csv";
// // // // // // // //         //     document.body.appendChild(link);
// // // // // // // //         //     link.click();
// // // // // // // //         //     document.body.removeChild(link);
// // // // // // // //         //     URL.revokeObjectURL(link.href);

// // // // // // // //         //     sap.m.MessageToast.show("Invalid records exported.");
// // // // // // // //         // },

// // // // // // // //         onShowInactiveRecords: function () {
// // // // // // // //             const oView = this.getView();
// // // // // // // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // // // // // // //             const oTable = oView.byId("inactiveRecordsTable");
// // // // // // // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // // // // // // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // // // // // // //             oTable.removeAllColumns();
// // // // // // // //             oTable.removeAllItems();
        
// // // // // // // //             if (!inactiveData || inactiveData.length === 0) {
// // // // // // // //                 sap.m.MessageToast.show("No inactive records available.");
// // // // // // // //                 return;
// // // // // // // //             }
        
// // // // // // // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
        
// // // // // // // //             // Add Columns
// // // // // // // //             headers.forEach(header => {
// // // // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // // // //                     width: "150px"
// // // // // // // //                 }));
// // // // // // // //             });
        
// // // // // // // //             // Add Rows
// // // // // // // //             inactiveData.forEach(row => {
// // // // // // // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // // // // // // //                 oTable.addItem(oItem);
// // // // // // // //             });
        
// // // // // // // //             oDialog.open();
// // // // // // // //         },
        
// // // // // // // //         onCloseInactiveDialog: function () {
// // // // // // // //             this.getView().byId("inactiveRecordsDialog").close();
// // // // // // // //         },
// // // // // // // //         onClear: function () {
// // // // // // // //             // Remove all records from the table's model
// // // // // // // //             this.getView().setModel(new JSONModel({ employees: [] }));
        
// // // // // // // //             // Reset UI model
// // // // // // // //             var oUIModel = this.getView().getModel("ui");
// // // // // // // //             if (oUIModel) {
// // // // // // // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // // // // // // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // // // // // // //                 oUIModel.setProperty("/currentPage", 1);
// // // // // // // //                 oUIModel.setProperty("/totalPages", 1);
// // // // // // // //             }
        
// // // // // // // //             // Reset invalid and inactive models
// // // // // // // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // // // // // // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
        
// // // // // // // //             // Remove table columns/items (optional, for full clear)
// // // // // // // //             var oTable = this.getView().byId("dataTable");
// // // // // // // //             if (oTable) {
// // // // // // // //                 oTable.removeAllColumns();
// // // // // // // //                 oTable.removeAllItems();
// // // // // // // //                 oTable.setVisible(false);
// // // // // // // //             }
        
// // // // // // // //             // Hide save button, pagination bar, etc. as needed
// // // // // // // //             var oSaveBtn = this.getView().byId("saveButton");
// // // // // // // //             if (oSaveBtn) {
// // // // // // // //                 oSaveBtn.setVisible(false);
// // // // // // // //             }
// // // // // // // //             var paginationBar = this.getView().byId("paginationBar");
// // // // // // // //             if (paginationBar) {
// // // // // // // //                 paginationBar.setVisible(false);
// // // // // // // //             }
        
// // // // // // // //             // Reset any file input (if you have file uploader control)
// // // // // // // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // // // // // // //             if (oFileUploader) {
// // // // // // // //                 oFileUploader.clear();
// // // // // // // //             }
// // // // // // // //             this._allRecords = [];
// // // // // // // //             this._headers = [];
        
// // // // // // // //             sap.m.MessageToast.show("Table and data cleared.");
// // // // // // // //         },
// // // // // // // //         onShowContractExtensionRecords: function () {
// // // // // // // //             // Filter _allRecords for CONTRACTEXTENSION === "yes"
// // // // // // // //             const allRecords = this._allRecords || [];
// // // // // // // //             const headers = this._headers || [];
        
// // // // // // // //             // Filter for "yes" (case insensitive, trims spaces)
// // // // // // // //             const filtered = allRecords.filter(
// // // // // // // //                 r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "yes"
// // // // // // // //             );
        
// // // // // // // //             // Get dialog and table references
// // // // // // // //             const oView = this.getView();
// // // // // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // // // // //             const oTable = oView.byId("contractExtensionTable");
        
// // // // // // // //             // Remove previous columns and items
// // // // // // // //             oTable.removeAllColumns();
// // // // // // // //             oTable.removeAllItems();
        
// // // // // // // //             // Add columns
// // // // // // // //             headers.forEach(header => {
// // // // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // // // //                     width: "150px"
// // // // // // // //                 }));
// // // // // // // //             });
        
// // // // // // // //             // Add rows
// // // // // // // //             filtered.forEach(row => {
// // // // // // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // // // // // //                 oTable.addItem(oItem);
// // // // // // // //             });
        
// // // // // // // //             // Open the dialog
// // // // // // // //             oDialog.open();
// // // // // // // //         },
        
// // // // // // // //         onCloseContractExtensionDialog: function () {
// // // // // // // //             this.getView().byId("contractExtensionDialog").close();
// // // // // // // //         },
// // // // // // // //         onShowNoContractExtensionRecords: function () {
// // // // // // // //             // Filter _allRecords for CONTRACTEXTENSION === "no"
// // // // // // // //             const allRecords = this._allRecords || [];
// // // // // // // //             const headers = this._headers || [];
        
// // // // // // // //             // Filter for "no" (case insensitive, trims spaces)
// // // // // // // //             const filtered = allRecords.filter(
// // // // // // // //                 r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "no"
// // // // // // // //             );
        
// // // // // // // //             // Get dialog and table references
// // // // // // // //             const oView = this.getView();
// // // // // // // //             const oDialog = oView.byId("noContractExtensionDialog");
// // // // // // // //             const oTable = oView.byId("noContractExtensionTable");
        
// // // // // // // //             // Remove previous columns and items
// // // // // // // //             oTable.removeAllColumns();
// // // // // // // //             oTable.removeAllItems();
        
// // // // // // // //             // Add columns
// // // // // // // //             headers.forEach(header => {
// // // // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // // // //                     width: "150px"
// // // // // // // //                 }));
// // // // // // // //             });
        
// // // // // // // //             // Add rows
// // // // // // // //             filtered.forEach(row => {
// // // // // // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // // // // // //                 oTable.addItem(oItem);
// // // // // // // //             });
        
// // // // // // // //             // Open the dialog
// // // // // // // //             oDialog.open();
// // // // // // // //         },
        
// // // // // // // //         onCloseNoContractExtensionDialog: function () {
// // // // // // // //             this.getView().byId("noContractExtensionDialog").close();
// // // // // // // //         }
// // // // // // // //     });
// // // // // // // // });

// // // // // // // sap.ui.define([
// // // // // // //     "sap/ui/core/mvc/Controller",
// // // // // // //     "sap/ui/model/json/JSONModel",
// // // // // // //     "sap/m/MessageToast",
// // // // // // //     "sap/m/MessageBox",
// // // // // // //     "sap/m/Column",
// // // // // // //     "sap/m/Text",
// // // // // // //     "sap/m/ColumnListItem",
// // // // // // //     "sap/m/Button",
// // // // // // //     "sap/m/HBox"
// // // // // // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // // // // // //     "use strict";

// // // // // // //     const PAGE_SIZE = 5; // Number of records per page

// // // // // // //     // Helper to convert DD-MM-YYYY to YYYY-MM-DD for HANA compatibility
// // // // // // //     function convertToISO(dateStr) {
// // // // // // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // // // // // //             var parts = dateStr.split("-");
// // // // // // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // // // // // //         }
// // // // // // //         return dateStr;
// // // // // // //     }

// // // // // // //     // Helper to deduplicate records by PSNUMBER (keep first occurrence)
// // // // // // //     function deduplicateByPSNUMBER(records) {
// // // // // // //         const seen = new Set();
// // // // // // //         return records.filter(record => {
// // // // // // //             if (seen.has(record.PSNUMBER)) {
// // // // // // //                 return false;
// // // // // // //             } else {
// // // // // // //                 seen.add(record.PSNUMBER);
// // // // // // //                 return true;
// // // // // // //             }
// // // // // // //         });
// // // // // // //     }

// // // // // // //     return Controller.extend("project1.controller.View1", {
// // // // // // //         onInit: function () {
// // // // // // //             var oUIModel = new JSONModel({ 
// // // // // // //                 hasInvalidEmployees: false,
// // // // // // //                 hasInactiveEmployees: false,
// // // // // // //                 hasContractExtensionYes: false,
// // // // // // //                 hasContractExtensionNo: false,
// // // // // // //                 currentPage: 1,
// // // // // // //                 totalPages: 1
// // // // // // //             });
// // // // // // //             this.getView().setModel(oUIModel, "ui");
// // // // // // //         },

// // // // // // //         onDownloadTemplate: function () {
// // // // // // //             $.ajax({
// // // // // // //                 url: "model/Template.csv",
// // // // // // //                 dataType: "text",
// // // // // // //                 success: (data) => {
// // // // // // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // // // // // //                     const link = document.createElement("a");
// // // // // // //                     link.setAttribute("href", encodedUri);
// // // // // // //                     link.setAttribute("download", "Template.csv");
// // // // // // //                     document.body.appendChild(link);
// // // // // // //                     link.click();
// // // // // // //                     document.body.removeChild(link);
// // // // // // //                     MessageToast.show("Template downloaded!");
// // // // // // //                 },
// // // // // // //                 error: () => {
// // // // // // //                     MessageToast.show("Failed to fetch CSV for download.");
// // // // // // //                 }
// // // // // // //             });
// // // // // // //         },

// // // // // // //         onFileChange: function (oEvent) {
// // // // // // //             const file = oEvent.getParameter("files")[0];
// // // // // // //             this._uploadedFile = file;
// // // // // // //             if (file && window.FileReader) {
// // // // // // //                 const reader = new FileReader();

// // // // // // //                 reader.onload = (e) => {
// // // // // // //                     const csv = e.target.result;
// // // // // // //                     const lines = csv.split("\n").filter(Boolean);
// // // // // // //                     let headers = lines[0].trim().split(",");
// // // // // // //                     const allRecords = [];
// // // // // // //                     const invalidRecords = [];
// // // // // // //                     const inactiveRecords = [];

// // // // // // //                     const prefix = "SE";
// // // // // // //                     const year = new Date().getFullYear();
// // // // // // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // // // // // //                     let applicationIdCounter = 1;

// // // // // // //                     const namePattern = /^[A-Za-z\s]+$/;
// // // // // // //                     const psNumberPattern = /^\d{9}$/;

// // // // // // //                     if (!headers.includes("APPLICATIONID")) {
// // // // // // //                         headers.push("APPLICATIONID");
// // // // // // //                     }

// // // // // // //                     for (let i = 1; i < lines.length; i++) {
// // // // // // //                         const line = lines[i].trim();
// // // // // // //                         if (line) {
// // // // // // //                             const values = line.split(",");
// // // // // // //                             const record = {};
// // // // // // //                             headers.forEach((header, index) => {
// // // // // // //                                 if (header !== "APPLICATIONID") {
// // // // // // //                                     record[header] = values[index] ? values[index].trim() : "";
// // // // // // //                                 }
// // // // // // //                             });

// // // // // // //                             let isValid = true;

// // // // // // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // // // // // //                                 inactiveRecords.push(record);
// // // // // // //                                 isValid = false;
// // // // // // //                             }
// // // // // // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // // // // // //                                 isValid = false;
// // // // // // //                             }
// // // // // // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // // // // // //                                 isValid = false;
// // // // // // //                             }

// // // // // // //                             [
// // // // // // //                                 "DATEOFJOINING", 
// // // // // // //                                 "CURRENTCONTRACTENDDATE", 
// // // // // // //                                 "CONTRACTENDDATE", 
// // // // // // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // // // // // //                                 "CONTRACTEXTENSIONENDDATE", 
// // // // // // //                                 "SUBMITTEDDATE", 
// // // // // // //                                 "MODIFIEDDATE"
// // // // // // //                             ].forEach(field => {
// // // // // // //                                 if (record[field]) {
// // // // // // //                                     record[field] = convertToISO(record[field]);
// // // // // // //                                 }
// // // // // // //                             });

// // // // // // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // // // // // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // // // // // //                             applicationIdCounter++;

// // // // // // //                             record._isValid = isValid;
// // // // // // //                             allRecords.push(record);

// // // // // // //                             if (!isValid) {
// // // // // // //                                 invalidRecords.push(record);
// // // // // // //                             }
// // // // // // //                         }
// // // // // // //                     }

// // // // // // //                     this._allRecords = allRecords;
// // // // // // //                     this._headers = headers;

// // // // // // //                     const oView = this.getView();
// // // // // // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // // // // // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // // // // // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // // // // // //                     var oUIModel = oView.getModel("ui");
// // // // // // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // // // // // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // // // // // //                     oUIModel.setProperty("/currentPage", 1);
// // // // // // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / PAGE_SIZE) || 1);

// // // // // // //                     // Set visibility for contract extension buttons
// // // // // // //                     const countYes = allRecords.filter(
// // // // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "yes"
// // // // // // //                     ).length;
// // // // // // //                     const countNo = allRecords.filter(
// // // // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "no"
// // // // // // //                     ).length;
// // // // // // //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// // // // // // //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// // // // // // //                     this._showPage(1);

// // // // // // //                     if (invalidRecords.length > 0) {
// // // // // // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // // // // // //                     } else {
// // // // // // //                         MessageToast.show("File uploaded and all records displayed!");
// // // // // // //                     }

// // // // // // //                     let validRecords = allRecords.filter(r =>
// // // // // // //                         r._isValid &&
// // // // // // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // // // // // //                     );

// // // // // // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // // // // // //                     if (validRecords.length > 0) {
// // // // // // //                         const mainModel = this.getView().getModel("mainModel");
// // // // // // //                         if (mainModel) {
// // // // // // //                             mainModel.callFunction("/bulkUpload", {
// // // // // // //                                 method: "POST",
// // // // // // //                                 urlParameters: {
// // // // // // //                                     jsonData: JSON.stringify(validRecords)
// // // // // // //                                 },
// // // // // // //                                 success: () => {
// // // // // // //                                     MessageToast.show("Valid records uploaded successfully.");
// // // // // // //                                 },
// // // // // // //                                 error: (error) => {
// // // // // // //                                     console.log("Upload error:", error);
// // // // // // //                                     MessageToast.show("Upload to backend failed.");
// // // // // // //                                 }
// // // // // // //                             });
// // // // // // //                         } else {
// // // // // // //                             MessageToast.show("Main model for backend upload not found.");
// // // // // // //                         }
// // // // // // //                     } else {
// // // // // // //                         MessageToast.show("No valid records to upload to backend.");
// // // // // // //                     }
// // // // // // //                 };

// // // // // // //                 reader.readAsText(file);
// // // // // // //             } else {
// // // // // // //                 MessageToast.show("This browser does not support file reading.");
// // // // // // //             }
// // // // // // //         },

// // // // // // //         _showPage: function (page) {
// // // // // // //             const oView = this.getView();
// // // // // // //             const allRecords = this._allRecords || [];
// // // // // // //             const headers = this._headers || [];
// // // // // // //             const pageSize = PAGE_SIZE;
// // // // // // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // // // // // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // // // // // //             const start = (currentPage - 1) * pageSize;
// // // // // // //             const end = start + pageSize;
// // // // // // //             const pageRecords = allRecords.slice(start, end);

// // // // // // //             const oTable = oView.byId("dataTable");
// // // // // // //             oTable.removeAllColumns();
// // // // // // //             oTable.removeAllItems();

// // // // // // //             headers.forEach(header => {
// // // // // // //                 oTable.addColumn(new Column({
// // // // // // //                     header: new Text({ text: header }),
// // // // // // //                     width: "200px"
// // // // // // //                 }));
// // // // // // //             });

// // // // // // //             pageRecords.forEach(row => {
// // // // // // //                 const cells = headers.map(header => new Text({ text: row[header] || "" }));
// // // // // // //                 const oItem = new ColumnListItem({ cells });
// // // // // // //                 if (row._isValid === false) {
// // // // // // //                     oItem.addStyleClass("invalidRow");
// // // // // // //                 }
// // // // // // //                 oTable.addItem(oItem);
// // // // // // //             });

// // // // // // //             oTable.setVisible(true);
// // // // // // //             oView.byId("saveButton").setVisible(true);

// // // // // // //             var oUIModel = oView.getModel("ui");
// // // // // // //             oUIModel.setProperty("/currentPage", currentPage);
// // // // // // //             oUIModel.setProperty("/totalPages", totalPages);

// // // // // // //             this._updatePaginationBar();
// // // // // // //         },

// // // // // // //         _updatePaginationBar: function () {
// // // // // // //             const oView = this.getView();
// // // // // // //             const paginationBar = oView.byId("paginationBar");
// // // // // // //             const pageNumbersBox = oView.byId("pageNumbers");
// // // // // // //             const oUIModel = oView.getModel("ui");
// // // // // // //             const currentPage = oUIModel.getProperty("/currentPage");
// // // // // // //             const totalPages = oUIModel.getProperty("/totalPages");
// // // // // // //             const allRecords = this._allRecords || [];

// // // // // // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// // // // // // //             pageNumbersBox.removeAllItems();

// // // // // // //             let start = Math.max(1, currentPage - 2);
// // // // // // //             let end = Math.min(totalPages, start + 4);
// // // // // // //             if (end - start < 4) {
// // // // // // //                 start = Math.max(1, end - 4);
// // // // // // //             }
// // // // // // //             for (let i = start; i <= end; i++) {
// // // // // // //                 pageNumbersBox.addItem(new Button({
// // // // // // //                     text: i.toString(),
// // // // // // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // // // // // //                     press: this.onPageSelect.bind(this, i),
// // // // // // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // // // // // //                 }));
// // // // // // //             }

// // // // // // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // // // // // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // // // // // //         },

// // // // // // //         onPrevPage: function () {
// // // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // // //             if (page > 1) this._showPage(page - 1);
// // // // // // //         },

// // // // // // //         onNextPage: function () {
// // // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // // //             let total = oUIModel.getProperty("/totalPages");
// // // // // // //             if (page < total) this._showPage(page + 1);
// // // // // // //         },

// // // // // // //         onPageSelect: function (page) {
// // // // // // //             this._showPage(page);
// // // // // // //         },

// // // // // // //         onopeninvalidrecords: function () {
// // // // // // //             var oView = this.getView();
// // // // // // //             var oDialog = oView.byId("invalidRecordsDialog");
// // // // // // //             var oTable = oView.byId("invalidRecordsTable");
// // // // // // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // // // // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // // // // // //             oTable.removeAllColumns();
// // // // // // //             oTable.removeAllItems();
        
// // // // // // //             if (invalidData && invalidData.length > 0) {
// // // // // // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// // // // // // //                 headers.forEach(header => {
// // // // // // //                     oTable.addColumn(new sap.m.Column({
// // // // // // //                         header: new sap.m.Text({ text: header }),
// // // // // // //                         width: "150px"
// // // // // // //                     }));
// // // // // // //                 });
// // // // // // //                 invalidData.forEach(row => {
// // // // // // //                     var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // // // // // //                     oTable.addItem(oItem);
// // // // // // //                 });
// // // // // // //             }
// // // // // // //             oDialog.open();
// // // // // // //         },
        
// // // // // // //         onCloseInvalidDialog: function () {
// // // // // // //             this.getView().byId("invalidRecordsDialog").close();
// // // // // // //         },

// // // // // // //         onShowInactiveRecords: function () {
// // // // // // //             const oView = this.getView();
// // // // // // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // // // // // //             const oTable = oView.byId("inactiveRecordsTable");
// // // // // // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // // // // // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // // // // // //             oTable.removeAllColumns();
// // // // // // //             oTable.removeAllItems();
        
// // // // // // //             if (!inactiveData || inactiveData.length === 0) {
// // // // // // //                 sap.m.MessageToast.show("No inactive records available.");
// // // // // // //                 return;
// // // // // // //             }
        
// // // // // // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// // // // // // //             headers.forEach(header => {
// // // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // // //                     width: "150px"
// // // // // // //                 }));
// // // // // // //             });
// // // // // // //             inactiveData.forEach(row => {
// // // // // // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // // // // // //                 oTable.addItem(oItem);
// // // // // // //             });
// // // // // // //             oDialog.open();
// // // // // // //         },
        
// // // // // // //         onCloseInactiveDialog: function () {
// // // // // // //             this.getView().byId("inactiveRecordsDialog").close();
// // // // // // //         },

// // // // // // //         onClear: function () {
// // // // // // //             this.getView().setModel(new JSONModel({ employees: [] }));
// // // // // // //             var oUIModel = this.getView().getModel("ui");
// // // // // // //             if (oUIModel) {
// // // // // // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // // // // // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // // // // // //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// // // // // // //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// // // // // // //                 oUIModel.setProperty("/currentPage", 1);
// // // // // // //                 oUIModel.setProperty("/totalPages", 1);
// // // // // // //             }
// // // // // // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // // // // // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// // // // // // //             var oTable = this.getView().byId("dataTable");
// // // // // // //             if (oTable) {
// // // // // // //                 oTable.removeAllColumns();
// // // // // // //                 oTable.removeAllItems();
// // // // // // //                 oTable.setVisible(false);
// // // // // // //             }
// // // // // // //             var oSaveBtn = this.getView().byId("saveButton");
// // // // // // //             if (oSaveBtn) {
// // // // // // //                 oSaveBtn.setVisible(false);
// // // // // // //             }
// // // // // // //             var paginationBar = this.getView().byId("paginationBar");
// // // // // // //             if (paginationBar) {
// // // // // // //                 paginationBar.setVisible(false);
// // // // // // //             }
// // // // // // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // // // // // //             if (oFileUploader) {
// // // // // // //                 oFileUploader.clear();
// // // // // // //             }
// // // // // // //             this._allRecords = [];
// // // // // // //             this._headers = [];
// // // // // // //             sap.m.MessageToast.show("Table and data cleared.");
// // // // // // //         },

// // // // // // //         // onShowContractExtensionRecords: function () {
// // // // // // //         //     const allRecords = this._allRecords || [];
// // // // // // //         //     const headers = this._headers || [];
// // // // // // //         //     const filtered = allRecords.filter(
// // // // // // //         //         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "yes"
// // // // // // //         //     );
// // // // // // //         //     const oView = this.getView();
// // // // // // //         //     const oDialog = oView.byId("contractExtensionDialog");
// // // // // // //         //     const oTable = oView.byId("contractExtensionTable");
// // // // // // //         //     oTable.removeAllColumns();
// // // // // // //         //     oTable.removeAllItems();
// // // // // // //         //     headers.forEach(header => {
// // // // // // //         //         oTable.addColumn(new sap.m.Column({
// // // // // // //         //             header: new sap.m.Text({ text: header }),
// // // // // // //         //             width: "150px"
// // // // // // //         //         }));
// // // // // // //         //     });
// // // // // // //         //     filtered.forEach(row => {
// // // // // // //         //         const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // //         //         const oItem = new sap.m.ColumnListItem({ cells });
// // // // // // //         //         oTable.addItem(oItem);
// // // // // // //         //     });
// // // // // // //         //     oDialog.open();
// // // // // // //         // },

// // // // // // //         // onCloseContractExtensionDialog: function () {
// // // // // // //         //     this.getView().byId("contractExtensionDialog").close();
// // // // // // //         // },

// // // // // // //         // onShowNoContractExtensionRecords: function () {
// // // // // // //         //     const allRecords = this._allRecords || [];
// // // // // // //         //     const headers = this._headers || [];
// // // // // // //         //     const filtered = allRecords.filter(
// // // // // // //         //         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "no"
// // // // // // //         //     );
// // // // // // //         //     const oView = this.getView();
// // // // // // //         //     const oDialog = oView.byId("noContractExtensionDialog");
// // // // // // //         //     const oTable = oView.byId("noContractExtensionTable");
// // // // // // //         //     oTable.removeAllColumns();
// // // // // // //         //     oTable.removeAllItems();
// // // // // // //         //     headers.forEach(header => {
// // // // // // //         //         oTable.addColumn(new sap.m.Column({
// // // // // // //         //             header: new sap.m.Text({ text: header }),
// // // // // // //         //             width: "150px"
// // // // // // //         //         }));
// // // // // // //         //     });
// // // // // // //         //     filtered.forEach(row => {
// // // // // // //         //         const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // //         //         const oItem = new sap.m.ColumnListItem({ cells });
// // // // // // //         //         oTable.addItem(oItem);
// // // // // // //         //     });
// // // // // // //         //     oDialog.open();
// // // // // // //         // },

// // // // // // //         // onCloseNoContractExtensionDialog: function () {
// // // // // // //         //     this.getView().byId("noContractExtensionDialog").close();
// // // // // // //         // }
// // // // // // //         onShowContractExtensionDialog: function () {
// // // // // // //             const oView = this.getView();
// // // // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // // // //             const oSelect = oView.byId("contractExtensionSelect");
// // // // // // //             if (oSelect) {
// // // // // // //                 oSelect.setSelectedKey("yes");
// // // // // // //             }
// // // // // // //             this.onShowContractExtensionFiltered("yes");
// // // // // // //             oDialog.open();
// // // // // // //         },
        
// // // // // // //         onShowContractExtensionFiltered: function (value) {
// // // // // // //             const allRecords = this._allRecords || [];
// // // // // // //             const headers = this._headers || [];
// // // // // // //             const filtered = allRecords.filter(
// // // // // // //                 r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === value
// // // // // // //             );
// // // // // // //             const oView = this.getView();
// // // // // // //             const oTable = oView.byId("contractExtensionTable");
// // // // // // //             oTable.removeAllColumns();
// // // // // // //             oTable.removeAllItems();
// // // // // // //             headers.forEach(header => {
// // // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // // //                     width: "150px"
// // // // // // //                 }));
// // // // // // //             });
// // // // // // //             filtered.forEach(row => {
// // // // // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // // // // //                 oTable.addItem(oItem);
// // // // // // //             });
        
// // // // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // // // //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// // // // // // //             var oUIModel = oView.getModel("ui");
// // // // // // //             if (oUIModel) {
// // // // // // //                 oUIModel.setProperty("/contractExtensionFilter", value);
// // // // // // //             }
// // // // // // //         },
        
// // // // // // //         onContractExtensionSelectChange: function (oEvent) {
// // // // // // //             const value = oEvent.getParameter("selectedItem").getKey();
// // // // // // //             this.onShowContractExtensionFiltered(value);
// // // // // // //         },
        
// // // // // // //         onCloseContractExtensionDialog: function () {
// // // // // // //             this.getView().byId("contractExtensionDialog").close();
// // // // // // //         },
// // // // // // //     });
// // // // // // // });


// // // // // // sap.ui.define([
// // // // // //     "sap/ui/core/mvc/Controller",
// // // // // //     "sap/ui/model/json/JSONModel",
// // // // // //     "sap/m/MessageToast",
// // // // // //     "sap/m/MessageBox",
// // // // // //     "sap/m/Column",
// // // // // //     "sap/m/Text",
// // // // // //     "sap/m/ColumnListItem",
// // // // // //     "sap/m/Button",
// // // // // //     "sap/m/HBox"
// // // // // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // // // // //     "use strict";

// // // // // //     const PAGE_SIZE = 5; // Number of records per page

// // // // // //     // Helper to convert DD-MM-YYYY to YYYY-MM-DD for HANA compatibility
// // // // // //     function convertToISO(dateStr) {
// // // // // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // // // // //             var parts = dateStr.split("-");
// // // // // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // // // // //         }
// // // // // //         return dateStr;
// // // // // //     }

// // // // // //     // Helper to deduplicate records by PSNUMBER (keep first occurrence)
// // // // // //     function deduplicateByPSNUMBER(records) {
// // // // // //         const seen = new Set();
// // // // // //         return records.filter(record => {
// // // // // //             if (seen.has(record.PSNUMBER)) {
// // // // // //                 return false;
// // // // // //             } else {
// // // // // //                 seen.add(record.PSNUMBER);
// // // // // //                 return true;
// // // // // //             }
// // // // // //         });
// // // // // //     }

// // // // // //     return Controller.extend("project1.controller.View1", {
// // // // // //         onInit: function () {
// // // // // //             var oUIModel = new JSONModel({ 
// // // // // //                 hasInvalidEmployees: false,
// // // // // //                 hasInactiveEmployees: false,
// // // // // //                 hasContractExtensionYes: false,
// // // // // //                 hasContractExtensionNo: false,
// // // // // //                 currentPage: 1,
// // // // // //                 totalPages: 1,
// // // // // //                 isUploaded: false
// // // // // //             });
// // // // // //             this.getView().setModel(oUIModel, "ui");
// // // // // //         },

// // // // // //         onDownloadTemplate: function () {
// // // // // //             $.ajax({
// // // // // //                 url: "model/Template.csv",
// // // // // //                 dataType: "text",
// // // // // //                 success: (data) => {
// // // // // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // // // // //                     const link = document.createElement("a");
// // // // // //                     link.setAttribute("href", encodedUri);
// // // // // //                     link.setAttribute("download", "Template.csv");
// // // // // //                     document.body.appendChild(link);
// // // // // //                     link.click();
// // // // // //                     document.body.removeChild(link);
// // // // // //                     MessageToast.show("Template downloaded!");
// // // // // //                 },
// // // // // //                 error: () => {
// // // // // //                     MessageToast.show("Failed to fetch CSV for download.");
// // // // // //                 }
// // // // // //             });
// // // // // //         },

// // // // // //         onFileChange: function (oEvent) {
// // // // // //             const file = oEvent.getParameter("files")[0];
// // // // // //             this._uploadedFile = file;
// // // // // //             if (file && window.FileReader) {
// // // // // //                 const reader = new FileReader();

// // // // // //                 reader.onload = (e) => {
// // // // // //                     const csv = e.target.result;
// // // // // //                     const lines = csv.split("\n").filter(Boolean);
// // // // // //                     let headers = lines[0].trim().split(",");
// // // // // //                     const allRecords = [];
// // // // // //                     const invalidRecords = [];
// // // // // //                     const inactiveRecords = [];

// // // // // //                     const prefix = "SE";
// // // // // //                     const year = new Date().getFullYear();
// // // // // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // // // // //                     let applicationIdCounter = 1;

// // // // // //                     const namePattern = /^[A-Za-z\s]+$/;
// // // // // //                     const psNumberPattern = /^\d{9}$/;

// // // // // //                     if (!headers.includes("APPLICATIONID")) {
// // // // // //                         headers.push("APPLICATIONID");
// // // // // //                     }

// // // // // //                     for (let i = 1; i < lines.length; i++) {
// // // // // //                         const line = lines[i].trim();
// // // // // //                         if (line) {
// // // // // //                             const values = line.split(",");
// // // // // //                             const record = {};
// // // // // //                             headers.forEach((header, index) => {
// // // // // //                                 if (header !== "APPLICATIONID") {
// // // // // //                                     record[header] = values[index] ? values[index].trim() : "";
// // // // // //                                 }
// // // // // //                             });

// // // // // //                             let isValid = true;

// // // // // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // // // // //                                 inactiveRecords.push(record);
// // // // // //                                 isValid = false;
// // // // // //                             }
// // // // // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // // // // //                                 isValid = false;
// // // // // //                             }
// // // // // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // // // // //                                 isValid = false;
// // // // // //                             }

// // // // // //                             [
// // // // // //                                 "DATEOFJOINING", 
// // // // // //                                 "CURRENTCONTRACTENDDATE", 
// // // // // //                                 "CONTRACTENDDATE", 
// // // // // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // // // // //                                 "CONTRACTEXTENSIONENDDATE", 
// // // // // //                                 "SUBMITTEDDATE", 
// // // // // //                                 "MODIFIEDDATE"
// // // // // //                             ].forEach(field => {
// // // // // //                                 if (record[field]) {
// // // // // //                                     record[field] = convertToISO(record[field]);
// // // // // //                                 }
// // // // // //                             });

// // // // // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // // // // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // // // // //                             applicationIdCounter++;

// // // // // //                             record._isValid = isValid;
// // // // // //                             allRecords.push(record);

// // // // // //                             if (!isValid) {
// // // // // //                                 invalidRecords.push(record);
// // // // // //                             }
// // // // // //                         }
// // // // // //                     }

// // // // // //                     this._allRecords = allRecords;
// // // // // //                     this._headers = headers;

// // // // // //                     const oView = this.getView();
// // // // // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // // // // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // // // // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // // // // //                     var oUIModel = oView.getModel("ui");
// // // // // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // // // // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // // // // //                     oUIModel.setProperty("/currentPage", 1);
// // // // // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / PAGE_SIZE) || 1);
// // // // // //                     // Set visibility for contract extension buttons
// // // // // //                     const countYes = allRecords.filter(
// // // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "yes"
// // // // // //                     ).length;
// // // // // //                     const countNo = allRecords.filter(
// // // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "no"
// // // // // //                     ).length;
// // // // // //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// // // // // //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// // // // // //                     // Set isUploaded to true
// // // // // //                     oUIModel.setProperty("/isUploaded", true);

// // // // // //                     this._showPage(1);

// // // // // //                     if (invalidRecords.length > 0) {
// // // // // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // // // // //                     } else {
// // // // // //                         MessageToast.show("File uploaded and all records displayed!");
// // // // // //                     }

// // // // // //                     let validRecords = allRecords.filter(r =>
// // // // // //                         r._isValid &&
// // // // // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // // // // //                     );

// // // // // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // // // // //                     if (validRecords.length > 0) {
// // // // // //                         const mainModel = this.getView().getModel("mainModel");
// // // // // //                         if (mainModel) {
// // // // // //                             mainModel.callFunction("/bulkUpload", {
// // // // // //                                 method: "POST",
// // // // // //                                 urlParameters: {
// // // // // //                                     jsonData: JSON.stringify(validRecords)
// // // // // //                                 },
// // // // // //                                 success: () => {
// // // // // //                                     MessageToast.show("Valid records uploaded successfully.");
// // // // // //                                 },
// // // // // //                                 error: (error) => {
// // // // // //                                     console.log("Upload error:", error);
// // // // // //                                     MessageToast.show("Upload to backend failed.");
// // // // // //                                 }
// // // // // //                             });
// // // // // //                         } else {
// // // // // //                             MessageToast.show("Main model for backend upload not found.");
// // // // // //                         }
// // // // // //                     } else {
// // // // // //                         MessageToast.show("No valid records to upload to backend.");
// // // // // //                     }
// // // // // //                 };

// // // // // //                 reader.readAsText(file);
// // // // // //             } else {
// // // // // //                 MessageToast.show("This browser does not support file reading.");
// // // // // //             }
// // // // // //         },

// // // // // //         _showPage: function (page) {
// // // // // //             const oView = this.getView();
// // // // // //             const allRecords = this._allRecords || [];
// // // // // //             const headers = this._headers || [];
// // // // // //             const pageSize = PAGE_SIZE;
// // // // // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // // // // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // // // // //             const start = (currentPage - 1) * pageSize;
// // // // // //             const end = start + pageSize;
// // // // // //             const pageRecords = allRecords.slice(start, end);

// // // // // //             const oTable = oView.byId("dataTable");
// // // // // //             oTable.removeAllColumns();
// // // // // //             oTable.removeAllItems();

// // // // // //             headers.forEach(header => {
// // // // // //                 oTable.addColumn(new Column({
// // // // // //                     header: new Text({ text: header }),
// // // // // //                     width: "200px"
// // // // // //                 }));
// // // // // //             });

// // // // // //             pageRecords.forEach(row => {
// // // // // //                 const cells = headers.map(header => new Text({ text: row[header] || "" }));
// // // // // //                 const oItem = new ColumnListItem({ cells });
// // // // // //                 if (row._isValid === false) {
// // // // // //                     oItem.addStyleClass("invalidRow");
// // // // // //                 }
// // // // // //                 oTable.addItem(oItem);
// // // // // //             });

// // // // // //             oTable.setVisible(true);
// // // // // //             oView.byId("saveButton").setVisible(true);

// // // // // //             var oUIModel = oView.getModel("ui");
// // // // // //             oUIModel.setProperty("/currentPage", currentPage);
// // // // // //             oUIModel.setProperty("/totalPages", totalPages);

// // // // // //             this._updatePaginationBar();
// // // // // //         },

// // // // // //         _updatePaginationBar: function () {
// // // // // //             const oView = this.getView();
// // // // // //             const paginationBar = oView.byId("paginationBar");
// // // // // //             const pageNumbersBox = oView.byId("pageNumbers");
// // // // // //             const oUIModel = oView.getModel("ui");
// // // // // //             const currentPage = oUIModel.getProperty("/currentPage");
// // // // // //             const totalPages = oUIModel.getProperty("/totalPages");
// // // // // //             const allRecords = this._allRecords || [];

// // // // // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// // // // // //             pageNumbersBox.removeAllItems();

// // // // // //             let start = Math.max(1, currentPage - 2);
// // // // // //             let end = Math.min(totalPages, start + 4);
// // // // // //             if (end - start < 4) {
// // // // // //                 start = Math.max(1, end - 4);
// // // // // //             }
// // // // // //             for (let i = start; i <= end; i++) {
// // // // // //                 pageNumbersBox.addItem(new Button({
// // // // // //                     text: i.toString(),
// // // // // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // // // // //                     press: this.onPageSelect.bind(this, i),
// // // // // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // // // // //                 }));
// // // // // //             }

// // // // // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // // // // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // // // // //         },

// // // // // //         onPrevPage: function () {
// // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // //             if (page > 1) this._showPage(page - 1);
// // // // // //         },

// // // // // //         onNextPage: function () {
// // // // // //             const oUIModel = this.getView().getModel("ui");
// // // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // // //             let total = oUIModel.getProperty("/totalPages");
// // // // // //             if (page < total) this._showPage(page + 1);
// // // // // //         },

// // // // // //         onPageSelect: function (page) {
// // // // // //             this._showPage(page);
// // // // // //         },

// // // // // //         onopeninvalidrecords: function () {
// // // // // //             var oView = this.getView();
// // // // // //             var oDialog = oView.byId("invalidRecordsDialog");
// // // // // //             var oTable = oView.byId("invalidRecordsTable");
// // // // // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // // // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // // // // //             oTable.removeAllColumns();
// // // // // //             oTable.removeAllItems();
        
// // // // // //             if (invalidData && invalidData.length > 0) {
// // // // // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// // // // // //                 headers.forEach(header => {
// // // // // //                     oTable.addColumn(new sap.m.Column({
// // // // // //                         header: new sap.m.Text({ text: header }),
// // // // // //                         width: "150px"
// // // // // //                     }));
// // // // // //                 });
// // // // // //                 invalidData.forEach(row => {
// // // // // //                     var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // // // // //                     oTable.addItem(oItem);
// // // // // //                 });
// // // // // //             }
// // // // // //             oDialog.open();
// // // // // //         },
        
// // // // // //         onCloseInvalidDialog: function () {
// // // // // //             this.getView().byId("invalidRecordsDialog").close();
// // // // // //         },

// // // // // //         onShowInactiveRecords: function () {
// // // // // //             const oView = this.getView();
// // // // // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // // // // //             const oTable = oView.byId("inactiveRecordsTable");
// // // // // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // // // // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // // // // //             oTable.removeAllColumns();
// // // // // //             oTable.removeAllItems();
        
// // // // // //             if (!inactiveData || inactiveData.length === 0) {
// // // // // //                 sap.m.MessageToast.show("No inactive records available.");
// // // // // //                 return;
// // // // // //             }
        
// // // // // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// // // // // //             headers.forEach(header => {
// // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // //                     width: "150px"
// // // // // //                 }));
// // // // // //             });
// // // // // //             inactiveData.forEach(row => {
// // // // // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // // // // //                 oTable.addItem(oItem);
// // // // // //             });
// // // // // //             oDialog.open();
// // // // // //         },
        
// // // // // //         onCloseInactiveDialog: function () {
// // // // // //             this.getView().byId("inactiveRecordsDialog").close();
// // // // // //         },

// // // // // //         onClear: function () {
// // // // // //             this.getView().setModel(new JSONModel({ employees: [] }));
// // // // // //             var oUIModel = this.getView().getModel("ui");
// // // // // //             if (oUIModel) {
// // // // // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // // // // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // // // // //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// // // // // //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// // // // // //                 oUIModel.setProperty("/currentPage", 1);
// // // // // //                 oUIModel.setProperty("/totalPages", 1);
// // // // // //                 oUIModel.setProperty("/isUploaded", false);
// // // // // //             }
// // // // // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // // // // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// // // // // //             var oTable = this.getView().byId("dataTable");
// // // // // //             if (oTable) {
// // // // // //                 oTable.removeAllColumns();
// // // // // //                 oTable.removeAllItems();
// // // // // //                 oTable.setVisible(false);
// // // // // //             }
// // // // // //             var oSaveBtn = this.getView().byId("saveButton");
// // // // // //             if (oSaveBtn) {
// // // // // //                 oSaveBtn.setVisible(false);
// // // // // //             }
// // // // // //             var paginationBar = this.getView().byId("paginationBar");
// // // // // //             if (paginationBar) {
// // // // // //                 paginationBar.setVisible(false);
// // // // // //             }
// // // // // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // // // // //             if (oFileUploader) {
// // // // // //                 oFileUploader.clear();
// // // // // //             }
// // // // // //             this._allRecords = [];
// // // // // //             this._headers = [];
// // // // // //             sap.m.MessageToast.show("Table and data cleared.");
// // // // // //         },

// // // // // //         onShowContractExtensionDialog: function () {
// // // // // //             const oView = this.getView();
// // // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // // //             const oSelect = oView.byId("contractExtensionSelect");
// // // // // //             if (oSelect) {
// // // // // //                 oSelect.setSelectedKey("yes");
// // // // // //             }
// // // // // //             this.onShowContractExtensionFiltered("yes");
// // // // // //             oDialog.open();
// // // // // //         },
        
// // // // // //         onShowContractExtensionFiltered: function (value) {
// // // // // //             const allRecords = this._allRecords || [];
// // // // // //             const headers = this._headers || [];
// // // // // //             const filtered = allRecords.filter(
// // // // // //                 r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === value
// // // // // //             );
// // // // // //             const oView = this.getView();
// // // // // //             const oTable = oView.byId("contractExtensionTable");
// // // // // //             oTable.removeAllColumns();
// // // // // //             oTable.removeAllItems();
// // // // // //             headers.forEach(header => {
// // // // // //                 oTable.addColumn(new sap.m.Column({
// // // // // //                     header: new sap.m.Text({ text: header }),
// // // // // //                     width: "150px"
// // // // // //                 }));
// // // // // //             });
// // // // // //             filtered.forEach(row => {
// // // // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // // // //                 oTable.addItem(oItem);
// // // // // //             });
        
// // // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // // //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// // // // // //             var oUIModel = oView.getModel("ui");
// // // // // //             if (oUIModel) {
// // // // // //                 oUIModel.setProperty("/contractExtensionFilter", value);
// // // // // //             }
// // // // // //         },
        
// // // // // //         onContractExtensionSelectChange: function (oEvent) {
// // // // // //             const value = oEvent.getParameter("selectedItem").getKey();
// // // // // //             this.onShowContractExtensionFiltered(value);
// // // // // //         },
        
// // // // // //         onCloseContractExtensionDialog: function () {
// // // // // //             this.getView().byId("contractExtensionDialog").close();
// // // // // //         },
// // // // // //     });
// // // // // // });

// // // // // sap.ui.define([
// // // // //     "sap/ui/core/mvc/Controller",
// // // // //     "sap/ui/model/json/JSONModel",
// // // // //     "sap/m/MessageToast",
// // // // //     "sap/m/MessageBox",
// // // // //     "sap/m/Column",
// // // // //     "sap/m/Text",
// // // // //     "sap/m/ColumnListItem",
// // // // //     "sap/m/Button",
// // // // //     "sap/m/HBox"
// // // // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // // // //     "use strict";

// // // // //     // Default page size
// // // // //     const DEFAULT_PAGE_SIZE = 5;

// // // // //     // Helper to convert DD-MM-YYYY to YYYY-MM-DD for HANA compatibility
// // // // //     function convertToISO(dateStr) {
// // // // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // // // //             var parts = dateStr.split("-");
// // // // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // // // //         }
// // // // //         return dateStr;
// // // // //     }

// // // // //     // Helper to deduplicate records by PSNUMBER (keep first occurrence)
// // // // //     function deduplicateByPSNUMBER(records) {
// // // // //         const seen = new Set();
// // // // //         return records.filter(record => {
// // // // //             if (seen.has(record.PSNUMBER)) {
// // // // //                 return false;
// // // // //             } else {
// // // // //                 seen.add(record.PSNUMBER);
// // // // //                 return true;
// // // // //             }
// // // // //         });
// // // // //     }

// // // // //     return Controller.extend("project1.controller.View1", {
// // // // //         onInit: function () {
// // // // //             var oUIModel = new JSONModel({ 
// // // // //                 hasInvalidEmployees: false,
// // // // //                 hasInactiveEmployees: false,
// // // // //                 hasContractExtensionYes: false,
// // // // //                 hasContractExtensionNo: false,
// // // // //                 currentPage: 1,
// // // // //                 totalPages: 1,
// // // // //                 isUploaded: false,
// // // // //                 pageSize: DEFAULT_PAGE_SIZE // <--- Default page size
// // // // //             });
// // // // //             this.getView().setModel(oUIModel, "ui");
// // // // //         },

// // // // //         onDownloadTemplate: function () {
// // // // //             $.ajax({
// // // // //                 url: "model/Template.csv",
// // // // //                 dataType: "text",
// // // // //                 success: (data) => {
// // // // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // // // //                     const link = document.createElement("a");
// // // // //                     link.setAttribute("href", encodedUri);
// // // // //                     link.setAttribute("download", "Template.csv");
// // // // //                     document.body.appendChild(link);
// // // // //                     link.click();
// // // // //                     document.body.removeChild(link);
// // // // //                     MessageToast.show("Template downloaded!");
// // // // //                 },
// // // // //                 error: () => {
// // // // //                     MessageToast.show("Failed to fetch CSV for download.");
// // // // //                 }
// // // // //             });
// // // // //         },

// // // // //         onFileChange: function (oEvent) {
// // // // //             const file = oEvent.getParameter("files")[0];
// // // // //             this._uploadedFile = file;
// // // // //             if (file && window.FileReader) {
// // // // //                 const reader = new FileReader();

// // // // //                 reader.onload = (e) => {
// // // // //                     const csv = e.target.result;
// // // // //                     const lines = csv.split("\n").filter(Boolean);
// // // // //                     let headers = lines[0].trim().split(",");
// // // // //                     const allRecords = [];
// // // // //                     const invalidRecords = [];
// // // // //                     const inactiveRecords = [];

// // // // //                     const prefix = "SE";
// // // // //                     const year = new Date().getFullYear();
// // // // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // // // //                     let applicationIdCounter = 1;

// // // // //                     const namePattern = /^[A-Za-z\s]+$/;
// // // // //                     const psNumberPattern = /^\d{9}$/;

// // // // //                     if (!headers.includes("APPLICATIONID")) {
// // // // //                         headers.push("APPLICATIONID");
// // // // //                     }

// // // // //                     for (let i = 1; i < lines.length; i++) {
// // // // //                         const line = lines[i].trim();
// // // // //                         if (line) {
// // // // //                             const values = line.split(",");
// // // // //                             const record = {};
// // // // //                             headers.forEach((header, index) => {
// // // // //                                 if (header !== "APPLICATIONID") {
// // // // //                                     record[header] = values[index] ? values[index].trim() : "";
// // // // //                                 }
// // // // //                             });

// // // // //                             let isValid = true;

// // // // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // // // //                                 inactiveRecords.push(record);
// // // // //                                 isValid = false;
// // // // //                             }
// // // // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // // // //                                 isValid = false;
// // // // //                             }
// // // // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // // // //                                 isValid = false;
// // // // //                             }

// // // // //                             [
// // // // //                                 "DATEOFJOINING", 
// // // // //                                 "CURRENTCONTRACTENDDATE", 
// // // // //                                 "CONTRACTENDDATE", 
// // // // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // // // //                                 "CONTRACTEXTENSIONENDDATE", 
// // // // //                                 "SUBMITTEDDATE", 
// // // // //                                 "MODIFIEDDATE"
// // // // //                             ].forEach(field => {
// // // // //                                 if (record[field]) {
// // // // //                                     record[field] = convertToISO(record[field]);
// // // // //                                 }
// // // // //                             });

// // // // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // // // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // // // //                             applicationIdCounter++;

// // // // //                             record._isValid = isValid;
// // // // //                             allRecords.push(record);

// // // // //                             if (!isValid) {
// // // // //                                 invalidRecords.push(record);
// // // // //                             }
// // // // //                         }
// // // // //                     }

// // // // //                     this._allRecords = allRecords;
// // // // //                     this._headers = headers;

// // // // //                     const oView = this.getView();
// // // // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // // // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // // // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // // // //                     var oUIModel = oView.getModel("ui");
// // // // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // // // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // // // //                     oUIModel.setProperty("/currentPage", 1);
// // // // //                     // Use the selected page size from the Select control
// // // // //                     var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // // // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

// // // // //                     // Set visibility for contract extension buttons
// // // // //                     const countYes = allRecords.filter(
// // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "yes"
// // // // //                     ).length;
// // // // //                     const countNo = allRecords.filter(
// // // // //                         r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === "no"
// // // // //                     ).length;
// // // // //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// // // // //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// // // // //                     // Set isUploaded to true
// // // // //                     oUIModel.setProperty("/isUploaded", true);

// // // // //                     this._showPage(1);

// // // // //                     if (invalidRecords.length > 0) {
// // // // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // // // //                     } else {
// // // // //                         MessageToast.show("File uploaded and all records displayed!");
// // // // //                     }

// // // // //                     let validRecords = allRecords.filter(r =>
// // // // //                         r._isValid &&
// // // // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // // // //                     );

// // // // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // // // //                     if (validRecords.length > 0) {
// // // // //                         const mainModel = this.getView().getModel("mainModel");
// // // // //                         if (mainModel) {
// // // // //                             mainModel.callFunction("/bulkUpload", {
// // // // //                                 method: "POST",
// // // // //                                 urlParameters: {
// // // // //                                     jsonData: JSON.stringify(validRecords)
// // // // //                                 },
// // // // //                                 success: () => {
// // // // //                                     MessageToast.show("Valid records uploaded successfully.");
// // // // //                                 },
// // // // //                                 error: (error) => {
// // // // //                                     console.log("Upload error:", error);
// // // // //                                     MessageToast.show("Upload to backend failed.");
// // // // //                                 }
// // // // //                             });
// // // // //                         } else {
// // // // //                             MessageToast.show("Main model for backend upload not found.");
// // // // //                         }
// // // // //                     } else {
// // // // //                         MessageToast.show("No valid records to upload to backend.");
// // // // //                     }
// // // // //                 };

// // // // //                 reader.readAsText(file);
// // // // //             } else {
// // // // //                 MessageToast.show("This browser does not support file reading.");
// // // // //             }
// // // // //         },

// // // // //         _showPage: function (page) {
// // // // //             const oView = this.getView();
// // // // //             const allRecords = this._allRecords || [];
// // // // //             const headers = this._headers || [];
// // // // //             const oUIModel = oView.getModel("ui");
// // // // //             const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // // // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // // // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // // // //             const start = (currentPage - 1) * pageSize;
// // // // //             const end = start + pageSize;
// // // // //             const pageRecords = allRecords.slice(start, end);

// // // // //             const oTable = oView.byId("dataTable");
// // // // //             oTable.removeAllColumns();
// // // // //             oTable.removeAllItems();

// // // // //             headers.forEach(header => {
// // // // //                 oTable.addColumn(new Column({
// // // // //                     header: new Text({ text: header }),
// // // // //                     width: "200px"
// // // // //                 }));
// // // // //             });

// // // // //             pageRecords.forEach(row => {
// // // // //                 const cells = headers.map(header => new Text({ text: row[header] || "" }));
// // // // //                 const oItem = new ColumnListItem({ cells });
// // // // //                 if (row._isValid === false) {
// // // // //                     oItem.addStyleClass("invalidRow");
// // // // //                 }
// // // // //                 oTable.addItem(oItem);
// // // // //             });

// // // // //             oTable.setVisible(true);
// // // // //             oView.byId("saveButton").setVisible(true);

// // // // //             oUIModel.setProperty("/currentPage", currentPage);
// // // // //             oUIModel.setProperty("/totalPages", totalPages);

// // // // //             this._updatePaginationBar();
// // // // //         },

// // // // //         _updatePaginationBar: function () {
// // // // //             const oView = this.getView();
// // // // //             const paginationBar = oView.byId("paginationBar");
// // // // //             const pageNumbersBox = oView.byId("pageNumbers");
// // // // //             const oUIModel = oView.getModel("ui");
// // // // //             const currentPage = oUIModel.getProperty("/currentPage");
// // // // //             const totalPages = oUIModel.getProperty("/totalPages");
// // // // //             const allRecords = this._allRecords || [];

// // // // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// // // // //             pageNumbersBox.removeAllItems();

// // // // //             let start = Math.max(1, currentPage - 2);
// // // // //             let end = Math.min(totalPages, start + 4);
// // // // //             if (end - start < 4) {
// // // // //                 start = Math.max(1, end - 4);
// // // // //             }
// // // // //             for (let i = start; i <= end; i++) {
// // // // //                 pageNumbersBox.addItem(new Button({
// // // // //                     text: i.toString(),
// // // // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // // // //                     press: this.onPageSelect.bind(this, i),
// // // // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // // // //                 }));
// // // // //             }

// // // // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // // // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // // // //         },

// // // // //         // Handler for changing the number of rows per page
// // // // //         onRowCountChange: function (oEvent) {
// // // // //             var oUIModel = this.getView().getModel("ui");
// // // // //             var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
// // // // //             oUIModel.setProperty("/pageSize", newPageSize);

// // // // //             // Recalculate total pages and reset to first page
// // // // //             var allRecords = this._allRecords || [];
// // // // //             oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
// // // // //             oUIModel.setProperty("/currentPage", 1);
// // // // //             this._showPage(1);
// // // // //         },

// // // // //         onPrevPage: function () {
// // // // //             const oUIModel = this.getView().getModel("ui");
// // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // //             if (page > 1) this._showPage(page - 1);
// // // // //         },

// // // // //         onNextPage: function () {
// // // // //             const oUIModel = this.getView().getModel("ui");
// // // // //             let page = oUIModel.getProperty("/currentPage");
// // // // //             let total = oUIModel.getProperty("/totalPages");
// // // // //             if (page < total) this._showPage(page + 1);
// // // // //         },

// // // // //         onPageSelect: function (page) {
// // // // //             this._showPage(page);
// // // // //         },

// // // // //         onopeninvalidrecords: function () {
// // // // //             var oView = this.getView();
// // // // //             var oDialog = oView.byId("invalidRecordsDialog");
// // // // //             var oTable = oView.byId("invalidRecordsTable");
// // // // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // // // //             oTable.removeAllColumns();
// // // // //             oTable.removeAllItems();
        
// // // // //             if (invalidData && invalidData.length > 0) {
// // // // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// // // // //                 headers.forEach(header => {
// // // // //                     oTable.addColumn(new sap.m.Column({
// // // // //                         header: new sap.m.Text({ text: header }),
// // // // //                         width: "150px"
// // // // //                     }));
// // // // //                 });
// // // // //                 invalidData.forEach(row => {
// // // // //                     var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // // // //                     oTable.addItem(oItem);
// // // // //                 });
// // // // //             }
// // // // //             oDialog.open();
// // // // //         },
        
// // // // //         onCloseInvalidDialog: function () {
// // // // //             this.getView().byId("invalidRecordsDialog").close();
// // // // //         },

// // // // //         onShowInactiveRecords: function () {
// // // // //             const oView = this.getView();
// // // // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // // // //             const oTable = oView.byId("inactiveRecordsTable");
// // // // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // // // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // // // //             oTable.removeAllColumns();
// // // // //             oTable.removeAllItems();
        
// // // // //             if (!inactiveData || inactiveData.length === 0) {
// // // // //                 sap.m.MessageToast.show("No inactive records available.");
// // // // //                 return;
// // // // //             }
        
// // // // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// // // // //             headers.forEach(header => {
// // // // //                 oTable.addColumn(new sap.m.Column({
// // // // //                     header: new sap.m.Text({ text: header }),
// // // // //                     width: "150px"
// // // // //                 }));
// // // // //             });
// // // // //             inactiveData.forEach(row => {
// // // // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // // // //                 oTable.addItem(oItem);
// // // // //             });
// // // // //             oDialog.open();
// // // // //         },
        
// // // // //         onCloseInactiveDialog: function () {
// // // // //             this.getView().byId("inactiveRecordsDialog").close();
// // // // //         },

// // // // //         onClear: function () {
// // // // //             this.getView().setModel(new JSONModel({ employees: [] }));
// // // // //             var oUIModel = this.getView().getModel("ui");
// // // // //             if (oUIModel) {
// // // // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // // // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // // // //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// // // // //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// // // // //                 oUIModel.setProperty("/currentPage", 1);
// // // // //                 oUIModel.setProperty("/totalPages", 1);
// // // // //                 oUIModel.setProperty("/isUploaded", false);
// // // // //                 oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
// // // // //             }
// // // // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // // // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// // // // //             var oTable = this.getView().byId("dataTable");
// // // // //             if (oTable) {
// // // // //                 oTable.removeAllColumns();
// // // // //                 oTable.removeAllItems();
// // // // //                 oTable.setVisible(false);
// // // // //             }
// // // // //             var oSaveBtn = this.getView().byId("saveButton");
// // // // //             if (oSaveBtn) {
// // // // //                 oSaveBtn.setVisible(false);
// // // // //             }
// // // // //             var paginationBar = this.getView().byId("paginationBar");
// // // // //             if (paginationBar) {
// // // // //                 paginationBar.setVisible(false);
// // // // //             }
// // // // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // // // //             if (oFileUploader) {
// // // // //                 oFileUploader.clear();
// // // // //             }
// // // // //             this._allRecords = [];
// // // // //             this._headers = [];
// // // // //             sap.m.MessageToast.show("Table and data cleared.");
// // // // //         },

// // // // //         onShowContractExtensionDialog: function () {
// // // // //             const oView = this.getView();
// // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // //             const oSelect = oView.byId("contractExtensionSelect");
// // // // //             if (oSelect) {
// // // // //                 oSelect.setSelectedKey("yes");
// // // // //             }
// // // // //             this.onShowContractExtensionFiltered("yes");
// // // // //             oDialog.open();
// // // // //         },
        
// // // // //         onShowContractExtensionFiltered: function (value) {
// // // // //             const allRecords = this._allRecords || [];
// // // // //             const headers = this._headers || [];
// // // // //             const filtered = allRecords.filter(
// // // // //                 r => r.CONTRACTEXTENSION && r.CONTRACTEXTENSION.trim().toLowerCase() === value
// // // // //             );
// // // // //             const oView = this.getView();
// // // // //             const oTable = oView.byId("contractExtensionTable");
// // // // //             oTable.removeAllColumns();
// // // // //             oTable.removeAllItems();
// // // // //             headers.forEach(header => {
// // // // //                 oTable.addColumn(new sap.m.Column({
// // // // //                     header: new sap.m.Text({ text: header }),
// // // // //                     width: "150px"
// // // // //                 }));
// // // // //             });
// // // // //             filtered.forEach(row => {
// // // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] || "" }));
// // // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // // //                 oTable.addItem(oItem);
// // // // //             });
        
// // // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // // //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// // // // //             var oUIModel = oView.getModel("ui");
// // // // //             if (oUIModel) {
// // // // //                 oUIModel.setProperty("/contractExtensionFilter", value);
// // // // //             }
// // // // //         },
        
// // // // //         onContractExtensionSelectChange: function (oEvent) {
// // // // //             const value = oEvent.getParameter("selectedItem").getKey();
// // // // //             this.onShowContractExtensionFiltered(value);
// // // // //         },
        
// // // // //         onCloseContractExtensionDialog: function () {
// // // // //             this.getView().byId("contractExtensionDialog").close();
// // // // //         },

// // // // //         onSaveInvalidRecords: function() {
// // // // //             var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
// // // // //             if (!invalidRecords.length) {
// // // // //                 sap.m.MessageToast.show("No invalid records to save.");
// // // // //                 return;
// // // // //             }
// // // // //             // Remove _isValid from each record and set ERROR_REASON if missing
// // // // //             var cleanRecords = invalidRecords.map(function(rec) {
// // // // //                 var copy = Object.assign({}, rec);
// // // // //                 delete copy._isValid;
// // // // //                 if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
// // // // //                 return copy;
// // // // //             });
        
// // // // //             var oModel = this.getView().getModel("mainModel");
// // // // //             if (!oModel) {
// // // // //                 sap.m.MessageToast.show("Main model not found.");
// // // // //                 return;
// // // // //             }
        
// // // // //             oModel.create("/saveInvalidEmployees", { records: cleanRecords }, {
// // // // //                 success: function() {
// // // // //                     sap.m.MessageToast.show("Invalid records saved to backend.");
// // // // //                 },
// // // // //                 error: function(oError) {
// // // // //                     sap.m.MessageToast.show("Failed to save invalid records.");
// // // // //                     console.error(oError);
// // // // //                 }
// // // // //             });
// // // // //         }
// // // // //     });
// // // // // });

// // // // sap.ui.define([
// // // //     "sap/ui/core/mvc/Controller",
// // // //     "sap/ui/model/json/JSONModel",
// // // //     "sap/m/MessageToast",
// // // //     "sap/m/MessageBox",
// // // //     "sap/m/Column",
// // // //     "sap/m/Text",
// // // //     "sap/m/ColumnListItem",
// // // //     "sap/m/Button",
// // // //     "sap/m/HBox"
// // // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // // //     "use strict";

// // // //     // Default page size
// // // //     const DEFAULT_PAGE_SIZE = 5;

// // // //     // Helper to convert DD-MM-YYYY to YYYY-MM-DD for HANA compatibility
// // // //     function convertToISO(dateStr) {
// // // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // // //             var parts = dateStr.split("-");
// // // //             // Check for a valid month and day before converting
// // // //             const month = parseInt(parts[1], 10);
// // // //             const day = parseInt(parts[0], 10);
// // // //             if (month < 1 || month > 12 || day < 1 || day > 31) return ""; // Invalid
// // // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // // //         }
// // // //         return dateStr;
// // // //     }

// // // //     // Helper to deduplicate records by PSNUMBER (keep first occurrence)
// // // //     function deduplicateByPSNUMBER(records) {
// // // //         const seen = new Set();
// // // //         return records.filter(record => {
// // // //             if (seen.has(record.PSNUMBER)) {
// // // //                 return false;
// // // //             } else {
// // // //                 seen.add(record.PSNUMBER);
// // // //                 return true;
// // // //             }
// // // //         });
// // // //     }

// // // //     // Helper to convert "Yes"/"No" strings to Boolean
// // // //     function yesNoToBoolean(val) {
// // // //         if (typeof val === "string") {
// // // //             if (val.trim().toLowerCase() === "yes") return true;
// // // //             if (val.trim().toLowerCase() === "no") return false;
// // // //         }
// // // //         return val;
// // // //     }

// // // //     // Helper to validate ISO date
// // // //     function isValidISODate(val) {
// // // //         if (!val) return false;
// // // //         // YYYY-MM-DD
// // // //         const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
// // // //         if (!match) return false;
// // // //         const year = Number(match[1]);
// // // //         const month = Number(match[2]);
// // // //         const day = Number(match[3]);
// // // //         if (month < 1 || month > 12) return false;
// // // //         if (day < 1 || day > 31) return false;
// // // //         // Check for correct day count per month, leap years, etc.
// // // //         const date = new Date(val);
// // // //         return (
// // // //             date.getFullYear() === year &&
// // // //             date.getMonth() === month - 1 &&
// // // //             date.getDate() === day
// // // //         );
// // // //     }

// // // //     return Controller.extend("project1.controller.View1", {
// // // //         onInit: function () {
// // // //             var oUIModel = new JSONModel({ 
// // // //                 hasInvalidEmployees: false,
// // // //                 hasInactiveEmployees: false,
// // // //                 hasContractExtensionYes: false,
// // // //                 hasContractExtensionNo: false,
// // // //                 currentPage: 1,
// // // //                 totalPages: 1,
// // // //                 isUploaded: false,
// // // //                 pageSize: DEFAULT_PAGE_SIZE // <--- Default page size
// // // //             });
// // // //             this.getView().setModel(oUIModel, "ui");
// // // //         },

// // // //         onDownloadTemplate: function () {
// // // //             $.ajax({
// // // //                 url: "model/Template.csv",
// // // //                 dataType: "text",
// // // //                 success: (data) => {
// // // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // // //                     const link = document.createElement("a");
// // // //                     link.setAttribute("href", encodedUri);
// // // //                     link.setAttribute("download", "Template.csv");
// // // //                     document.body.appendChild(link);
// // // //                     link.click();
// // // //                     document.body.removeChild(link);
// // // //                     MessageToast.show("Template downloaded!");
// // // //                 },
// // // //                 error: () => {
// // // //                     MessageToast.show("Failed to fetch CSV for download.");
// // // //                 }
// // // //             });
// // // //         },

// // // //         onFileChange: function (oEvent) {
// // // //             const file = oEvent.getParameter("files")[0];
// // // //             this._uploadedFile = file;
// // // //             if (file && window.FileReader) {
// // // //                 const reader = new FileReader();

// // // //                 reader.onload = (e) => {
// // // //                     const csv = e.target.result;
// // // //                     const lines = csv.split("\n").filter(Boolean);
// // // //                     let headers = lines[0].trim().split(",");
// // // //                     const allRecords = [];
// // // //                     const invalidRecords = [];
// // // //                     const inactiveRecords = [];

// // // //                     const prefix = "SE";
// // // //                     const year = new Date().getFullYear();
// // // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // // //                     let applicationIdCounter = 1;

// // // //                     const namePattern = /^[A-Za-z\s]+$/;
// // // //                     const psNumberPattern = /^\d{9}$/;

// // // //                     if (!headers.includes("APPLICATIONID")) {
// // // //                         headers.push("APPLICATIONID");
// // // //                     }

// // // //                     for (let i = 1; i < lines.length; i++) {
// // // //                         const line = lines[i].trim();
// // // //                         if (line) {
// // // //                             const values = line.split(",");
// // // //                             const record = {};
// // // //                             headers.forEach((header, index) => {
// // // //                                 if (header !== "APPLICATIONID") {
// // // //                                     record[header] = values[index] ? values[index].trim() : "";
// // // //                                 }
// // // //                             });

// // // //                             let isValid = true;

// // // //                             // Convert Yes/No fields to Boolean
// // // //                             [
// // // //                                 "CONTRACTEXTENSION",
// // // //                                 "PAYRATECHANGE",
// // // //                                 "VMOHEADFLAG",
// // // //                                 "VMOTEAMFLAG"
// // // //                             ].forEach(field => {
// // // //                                 if (field in record) {
// // // //                                     record[field] = yesNoToBoolean(record[field]);
// // // //                                 }
// // // //                             });

// // // //                             // Validate boolean fields (should be true/false or empty)
// // // //                             [
// // // //                                 "CONTRACTEXTENSION",
// // // //                                 "PAYRATECHANGE",
// // // //                                 "VMOHEADFLAG",
// // // //                                 "VMOTEAMFLAG"
// // // //                             ].forEach(field => {
// // // //                                 if (record[field] !== true && record[field] !== false && record[field] !== "" && record[field] !== undefined) {
// // // //                                     isValid = false;
// // // //                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid boolean value for ${field}`;
// // // //                                 }
// // // //                             });

// // // //                             // Validate and convert date fields
// // // //                             [
// // // //                                 "DATEOFJOINING", 
// // // //                                 "CURRENTCONTRACTENDDATE", 
// // // //                                 "CONTRACTENDDATE", 
// // // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // // //                                 "CONTRACTEXTENSIONENDDATE", 
// // // //                                 "SUBMITTEDDATE", 
// // // //                                 "MODIFIEDDATE"
// // // //                             ].forEach(field => {
// // // //                                 if (record[field]) {
// // // //                                     record[field] = convertToISO(record[field]);
// // // //                                     if (!isValidISODate(record[field])) {
// // // //                                         isValid = false;
// // // //                                         record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid date for ${field}`;
// // // //                                     }
// // // //                                 }
// // // //                             });

// // // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // // //                                 inactiveRecords.push(record);
// // // //                                 isValid = false;
// // // //                             }
// // // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // // //                                 isValid = false;
// // // //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid employee name";
// // // //                             }
// // // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // // //                                 isValid = false;
// // // //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid PSNUMBER";
// // // //                             }

// // // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // // //                             applicationIdCounter++;

// // // //                             record._isValid = isValid;
// // // //                             allRecords.push(record);

// // // //                             if (!isValid) {
// // // //                                 invalidRecords.push(record);
// // // //                             }
// // // //                         }
// // // //                     }

// // // //                     this._allRecords = allRecords;
// // // //                     this._headers = headers;

// // // //                     const oView = this.getView();
// // // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // // //                     var oUIModel = oView.getModel("ui");
// // // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // // //                     oUIModel.setProperty("/currentPage", 1);
// // // //                     // Use the selected page size from the Select control
// // // //                     var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

// // // //                     // Set visibility for contract extension buttons
// // // //                     const countYes = allRecords.filter(
// // // //                         r => r.CONTRACTEXTENSION === true
// // // //                     ).length;
// // // //                     const countNo = allRecords.filter(
// // // //                         r => r.CONTRACTEXTENSION === false
// // // //                     ).length;
// // // //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// // // //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// // // //                     // Set isUploaded to true
// // // //                     oUIModel.setProperty("/isUploaded", true);

// // // //                     this._showPage(1);

// // // //                     if (invalidRecords.length > 0) {
// // // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // // //                     } else {
// // // //                         MessageToast.show("File uploaded and all records displayed!");
// // // //                     }

// // // //                     let validRecords = allRecords.filter(r =>
// // // //                         r._isValid &&
// // // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // // //                     );

// // // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // // //                     if (validRecords.length > 0) {
// // // //                         const mainModel = this.getView().getModel("mainModel");
// // // //                         if (mainModel) {
// // // //                             mainModel.callFunction("/bulkUpload", {
// // // //                                 method: "POST",
// // // //                                 urlParameters: {
// // // //                                     jsonData: JSON.stringify(validRecords)
// // // //                                 },
// // // //                                 success: () => {
// // // //                                     MessageToast.show("Valid records uploaded successfully.");
// // // //                                 },
// // // //                                 error: (error) => {
// // // //                                     console.log("Upload error:", error);
// // // //                                     MessageToast.show("Upload to backend failed.");
// // // //                                 }
// // // //                             });
// // // //                         } else {
// // // //                             MessageToast.show("Main model for backend upload not found.");
// // // //                         }
// // // //                     } else {
// // // //                         MessageToast.show("No valid records to upload to backend.");
// // // //                     }
// // // //                 };

// // // //                 reader.readAsText(file);
// // // //             } else {
// // // //                 MessageToast.show("This browser does not support file reading.");
// // // //             }
// // // //         },

// // // //         _showPage: function (page) {
// // // //             const oView = this.getView();
// // // //             const allRecords = this._allRecords || [];
// // // //             const headers = this._headers || [];
// // // //             const oUIModel = oView.getModel("ui");
// // // //             const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // // //             const start = (currentPage - 1) * pageSize;
// // // //             const end = start + pageSize;
// // // //             const pageRecords = allRecords.slice(start, end);

// // // //             const oTable = oView.byId("dataTable");
// // // //             oTable.removeAllColumns();
// // // //             oTable.removeAllItems();

// // // //             headers.forEach(header => {
// // // //                 oTable.addColumn(new Column({
// // // //                     header: new Text({ text: header }),
// // // //                     width: "200px"
// // // //                 }));
// // // //             });

// // // //             pageRecords.forEach(row => {
// // // //                 const cells = headers.map(header => new Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// // // //                 const oItem = new ColumnListItem({ cells });
// // // //                 if (row._isValid === false) {
// // // //                     oItem.addStyleClass("invalidRow");
// // // //                 }
// // // //                 oTable.addItem(oItem);
// // // //             });

// // // //             oTable.setVisible(true);
// // // //             oView.byId("saveButton").setVisible(true);

// // // //             oUIModel.setProperty("/currentPage", currentPage);
// // // //             oUIModel.setProperty("/totalPages", totalPages);

// // // //             this._updatePaginationBar();
// // // //         },

// // // //         _updatePaginationBar: function () {
// // // //             const oView = this.getView();
// // // //             const paginationBar = oView.byId("paginationBar");
// // // //             const pageNumbersBox = oView.byId("pageNumbers");
// // // //             const oUIModel = oView.getModel("ui");
// // // //             const currentPage = oUIModel.getProperty("/currentPage");
// // // //             const totalPages = oUIModel.getProperty("/totalPages");
// // // //             const allRecords = this._allRecords || [];

// // // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// // // //             pageNumbersBox.removeAllItems();

// // // //             let start = Math.max(1, currentPage - 2);
// // // //             let end = Math.min(totalPages, start + 4);
// // // //             if (end - start < 4) {
// // // //                 start = Math.max(1, end - 4);
// // // //             }
// // // //             for (let i = start; i <= end; i++) {
// // // //                 pageNumbersBox.addItem(new Button({
// // // //                     text: i.toString(),
// // // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // // //                     press: this.onPageSelect.bind(this, i),
// // // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // // //                 }));
// // // //             }

// // // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // // //         },

// // // //         // Handler for changing the number of rows per page
// // // //         onRowCountChange: function (oEvent) {
// // // //             var oUIModel = this.getView().getModel("ui");
// // // //             var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
// // // //             oUIModel.setProperty("/pageSize", newPageSize);

// // // //             // Recalculate total pages and reset to first page
// // // //             var allRecords = this._allRecords || [];
// // // //             oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
// // // //             oUIModel.setProperty("/currentPage", 1);
// // // //             this._showPage(1);
// // // //         },

// // // //         onPrevPage: function () {
// // // //             const oUIModel = this.getView().getModel("ui");
// // // //             let page = oUIModel.getProperty("/currentPage");
// // // //             if (page > 1) this._showPage(page - 1);
// // // //         },

// // // //         onNextPage: function () {
// // // //             const oUIModel = this.getView().getModel("ui");
// // // //             let page = oUIModel.getProperty("/currentPage");
// // // //             let total = oUIModel.getProperty("/totalPages");
// // // //             if (page < total) this._showPage(page + 1);
// // // //         },

// // // //         onPageSelect: function (page) {
// // // //             this._showPage(page);
// // // //         },

// // // //         onopeninvalidrecords: function () {
// // // //             var oView = this.getView();
// // // //             var oDialog = oView.byId("invalidRecordsDialog");
// // // //             var oTable = oView.byId("invalidRecordsTable");
// // // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // // //             oTable.removeAllColumns();
// // // //             oTable.removeAllItems();
        
// // // //             if (invalidData && invalidData.length > 0) {
// // // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// // // //                 headers.forEach(header => {
// // // //                     oTable.addColumn(new sap.m.Column({
// // // //                         header: new sap.m.Text({ text: header }),
// // // //                         width: "150px"
// // // //                     }));
// // // //                 });
// // // //                 invalidData.forEach(row => {
// // // //                     var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// // // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // // //                     oTable.addItem(oItem);
// // // //                 });
// // // //             }
// // // //             oDialog.open();
// // // //         },
        
// // // //         onCloseInvalidDialog: function () {
// // // //             this.getView().byId("invalidRecordsDialog").close();
// // // //         },

// // // //         onShowInactiveRecords: function () {
// // // //             const oView = this.getView();
// // // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // // //             const oTable = oView.byId("inactiveRecordsTable");
// // // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // // //             oTable.removeAllColumns();
// // // //             oTable.removeAllItems();
        
// // // //             if (!inactiveData || inactiveData.length === 0) {
// // // //                 sap.m.MessageToast.show("No inactive records available.");
// // // //                 return;
// // // //             }
        
// // // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// // // //             headers.forEach(header => {
// // // //                 oTable.addColumn(new sap.m.Column({
// // // //                     header: new sap.m.Text({ text: header }),
// // // //                     width: "150px"
// // // //                 }));
// // // //             });
// // // //             inactiveData.forEach(row => {
// // // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// // // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // // //                 oTable.addItem(oItem);
// // // //             });
// // // //             oDialog.open();
// // // //         },
        
// // // //         onCloseInactiveDialog: function () {
// // // //             this.getView().byId("inactiveRecordsDialog").close();
// // // //         },

// // // //         onClear: function () {
// // // //             this.getView().setModel(new JSONModel({ employees: [] }));
// // // //             var oUIModel = this.getView().getModel("ui");
// // // //             if (oUIModel) {
// // // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // // //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// // // //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// // // //                 oUIModel.setProperty("/currentPage", 1);
// // // //                 oUIModel.setProperty("/totalPages", 1);
// // // //                 oUIModel.setProperty("/isUploaded", false);
// // // //                 oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
// // // //             }
// // // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// // // //             var oTable = this.getView().byId("dataTable");
// // // //             if (oTable) {
// // // //                 oTable.removeAllColumns();
// // // //                 oTable.removeAllItems();
// // // //                 oTable.setVisible(false);
// // // //             }
// // // //             var oSaveBtn = this.getView().byId("saveButton");
// // // //             if (oSaveBtn) {
// // // //                 oSaveBtn.setVisible(false);
// // // //             }
// // // //             var paginationBar = this.getView().byId("paginationBar");
// // // //             if (paginationBar) {
// // // //                 paginationBar.setVisible(false);
// // // //             }
// // // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // // //             if (oFileUploader) {
// // // //                 oFileUploader.clear();
// // // //             }
// // // //             this._allRecords = [];
// // // //             this._headers = [];
// // // //             sap.m.MessageToast.show("Table and data cleared.");
// // // //         },

// // // //         onShowContractExtensionDialog: function () {
// // // //             const oView = this.getView();
// // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // //             const oSelect = oView.byId("contractExtensionSelect");
// // // //             if (oSelect) {
// // // //                 oSelect.setSelectedKey("yes");
// // // //             }
// // // //             this.onShowContractExtensionFiltered("yes");
// // // //             oDialog.open();
// // // //         },
        
// // // //         onShowContractExtensionFiltered: function (value) {
// // // //             const allRecords = this._allRecords || [];
// // // //             const headers = this._headers || [];
// // // //             const filterVal = value === "yes" ? true : false;
// // // //             const filtered = allRecords.filter(
// // // //                 r => r.CONTRACTEXTENSION === filterVal
// // // //             );
// // // //             const oView = this.getView();
// // // //             const oTable = oView.byId("contractExtensionTable");
// // // //             oTable.removeAllColumns();
// // // //             oTable.removeAllItems();
// // // //             headers.forEach(header => {
// // // //                 oTable.addColumn(new sap.m.Column({
// // // //                     header: new sap.m.Text({ text: header }),
// // // //                     width: "150px"
// // // //                 }));
// // // //             });
// // // //             filtered.forEach(row => {
// // // //                 const cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// // // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // // //                 oTable.addItem(oItem);
// // // //             });
        
// // // //             const oDialog = oView.byId("contractExtensionDialog");
// // // //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// // // //             var oUIModel = oView.getModel("ui");
// // // //             if (oUIModel) {
// // // //                 oUIModel.setProperty("/contractExtensionFilter", value);
// // // //             }
// // // //         },
        
// // // //         onContractExtensionSelectChange: function (oEvent) {
// // // //             const value = oEvent.getParameter("selectedItem").getKey();
// // // //             this.onShowContractExtensionFiltered(value);
// // // //         },
        
// // // //         onCloseContractExtensionDialog: function () {
// // // //             this.getView().byId("contractExtensionDialog").close();
// // // //         },

// // // //         onSaveInvalidRecords: function() {
// // // //             var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
// // // //             if (!invalidRecords.length) {
// // // //                 sap.m.MessageToast.show("No invalid records to save.");
// // // //                 return;
// // // //             }
// // // //             // Remove _isValid from each record and set ERROR_REASON if missing
// // // //             var cleanRecords = invalidRecords.map(function(rec) {
// // // //                 var copy = Object.assign({}, rec);
// // // //                 delete copy._isValid;
// // // //                 if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
// // // //                 return copy;
// // // //             });

// // // //             // Convert Yes/No to Boolean and check dates before sending to backend
// // // //             cleanRecords = cleanRecords.map(function(rec) {
// // // //                 ["CONTRACTEXTENSION","PAYRATECHANGE","VMOHEADFLAG","VMOTEAMFLAG"].forEach(function(field){
// // // //                     if (field in rec)
// // // //                         rec[field] = yesNoToBoolean(rec[field]);
// // // //                 });
// // // //                 [
// // // //                     "DATEOFJOINING", 
// // // //                     "CURRENTCONTRACTENDDATE", 
// // // //                     "CONTRACTENDDATE", 
// // // //                     "CONTRACTEXTENSIONSTARTDATE", 
// // // //                     "CONTRACTEXTENSIONENDDATE", 
// // // //                     "SUBMITTEDDATE", 
// // // //                     "MODIFIEDDATE"
// // // //                 ].forEach(function(field){
// // // //                     if (rec[field])
// // // //                         rec[field] = convertToISO(rec[field]);
// // // //                 });
// // // //                 return rec;
// // // //             });
        
// // // //             var oModel = this.getView().getModel("mainModel");
// // // //             if (!oModel) {
// // // //                 sap.m.MessageToast.show("Main model not found.");
// // // //                 return;
// // // //             }
        
// // // //             oModel.create("/saveInvalidEmployees", { records: cleanRecords }, {
// // // //                 success: function() {
// // // //                     sap.m.MessageToast.show("Invalid records saved to backend.");
// // // //                 },
// // // //                 error: function(oError) {
// // // //                     sap.m.MessageToast.show("Failed to save invalid records.");
// // // //                     console.error(oError);
// // // //                 }
// // // //             });
// // // //         }
// // // //     });
// // // // });

// // // sap.ui.define([
// // //     "sap/ui/core/mvc/Controller",
// // //     "sap/ui/model/json/JSONModel",
// // //     "sap/m/MessageToast",
// // //     "sap/m/MessageBox",
// // //     "sap/m/Column",
// // //     "sap/m/Text",
// // //     "sap/m/ColumnListItem",
// // //     "sap/m/Button",
// // //     "sap/m/HBox"
// // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// // //     "use strict";

// // //     const DEFAULT_PAGE_SIZE = 5;

// // //     function convertToISO(dateStr) {
// // //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// // //             var parts = dateStr.split("-");
// // //             const month = parseInt(parts[1], 10);
// // //             const day = parseInt(parts[0], 10);
// // //             if (month < 1 || month > 12 || day < 1 || day > 31) return "";
// // //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// // //         }
// // //         return dateStr;
// // //     }

// // //     function deduplicateByPSNUMBER(records) {
// // //         const seen = new Set();
// // //         return records.filter(record => {
// // //             if (seen.has(record.PSNUMBER)) {
// // //                 return false;
// // //             } else {
// // //                 seen.add(record.PSNUMBER);
// // //                 return true;
// // //             }
// // //         });
// // //     }

// // //     function yesNoToBoolean(val) {
// // //         if (typeof val === "string") {
// // //             if (val.trim().toLowerCase() === "yes") return true;
// // //             if (val.trim().toLowerCase() === "no") return false;
// // //         }
// // //         return val;
// // //     }

// // //     function isValidISODate(val) {
// // //         if (!val) return false;
// // //         const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
// // //         if (!match) return false;
// // //         const year = Number(match[1]);
// // //         const month = Number(match[2]);
// // //         const day = Number(match[3]);
// // //         if (month < 1 || month > 12) return false;
// // //         if (day < 1 || day > 31) return false;
// // //         const date = new Date(val);
// // //         return (
// // //             date.getFullYear() === year &&
// // //             date.getMonth() === month - 1 &&
// // //             date.getDate() === day
// // //         );
// // //     }

// // //     // Utility to replace empty date strings with null and convert valid string to ISO (for backend)
// // //     function sanitizeDatesToNull(record, dateFields) {
// // //         dateFields.forEach(function(field) {
// // //             if (record[field] === "") record[field] = null;
// // //             else if (record[field]) record[field] = convertToISO(record[field]);
// // //         });
// // //     }

// // //     return Controller.extend("project1.controller.View1", {
// // //         onInit: function () {
// // //             var oUIModel = new JSONModel({ 
// // //                 hasInvalidEmployees: false,
// // //                 hasInactiveEmployees: false,
// // //                 hasContractExtensionYes: false,
// // //                 hasContractExtensionNo: false,
// // //                 currentPage: 1,
// // //                 totalPages: 1,
// // //                 isUploaded: false,
// // //                 pageSize: DEFAULT_PAGE_SIZE
// // //             });
// // //             this.getView().setModel(oUIModel, "ui");
// // //         },

// // //         onDownloadTemplate: function () {
// // //             $.ajax({
// // //                 url: "model/Template.csv",
// // //                 dataType: "text",
// // //                 success: (data) => {
// // //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// // //                     const link = document.createElement("a");
// // //                     link.setAttribute("href", encodedUri);
// // //                     link.setAttribute("download", "Template.csv");
// // //                     document.body.appendChild(link);
// // //                     link.click();
// // //                     document.body.removeChild(link);
// // //                     MessageToast.show("Template downloaded!");
// // //                 },
// // //                 error: () => {
// // //                     MessageToast.show("Failed to fetch CSV for download.");
// // //                 }
// // //             });
// // //         },

// // //         onFileChange: function (oEvent) {
// // //             const file = oEvent.getParameter("files")[0];
// // //             this._uploadedFile = file;
// // //             if (file && window.FileReader) {
// // //                 const reader = new FileReader();

// // //                 reader.onload = (e) => {
// // //                     const csv = e.target.result;
// // //                     const lines = csv.split("\n").filter(Boolean);
// // //                     let headers = lines[0].trim().split(",");
// // //                     const allRecords = [];
// // //                     const invalidRecords = [];
// // //                     const inactiveRecords = [];

// // //                     const prefix = "SE";
// // //                     const year = new Date().getFullYear();
// // //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// // //                     let applicationIdCounter = 1;

// // //                     const namePattern = /^[A-Za-z\s]+$/;
// // //                     const psNumberPattern = /^\d{9}$/;

// // //                     if (!headers.includes("APPLICATIONID")) {
// // //                         headers.push("APPLICATIONID");
// // //                     }

// // //                     for (let i = 1; i < lines.length; i++) {
// // //                         const line = lines[i].trim();
// // //                         if (line) {
// // //                             const values = line.split(",");
// // //                             const record = {};
// // //                             record.INVALID_FIELDS = {};
// // //                             headers.forEach((header, index) => {
// // //                                 if (header !== "APPLICATIONID") {
// // //                                     record[header] = values[index] ? values[index].trim() : "";
// // //                                 }
// // //                             });

// // //                             let isValid = true;

// // //                             [
// // //                                 "CONTRACTEXTENSION",
// // //                                 "PAYRATECHANGE",
// // //                                 "VMOHEADFLAG",
// // //                                 "VMOTEAMFLAG"
// // //                             ].forEach(field => {
// // //                                 if (field in record) {
// // //                                     record[field] = yesNoToBoolean(record[field]);
// // //                                 }
// // //                             });

// // //                             [
// // //                                 "CONTRACTEXTENSION",
// // //                                 "PAYRATECHANGE",
// // //                                 "VMOHEADFLAG",
// // //                                 "VMOTEAMFLAG"
// // //                             ].forEach(field => {
// // //                                 if (record[field] !== true && record[field] !== false && record[field] !== "" && record[field] !== undefined) {
// // //                                     isValid = false;
// // //                                     record.INVALID_FIELDS[field] = true;
// // //                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid boolean value for ${field}`;
// // //                                 }
// // //                             });

// // //                             [
// // //                                 "DATEOFJOINING", 
// // //                                 "CURRENTCONTRACTENDDATE", 
// // //                                 "CONTRACTENDDATE", 
// // //                                 "CONTRACTEXTENSIONSTARTDATE", 
// // //                                 "CONTRACTEXTENSIONENDDATE", 
// // //                                 "SUBMITTEDDATE", 
// // //                                 "MODIFIEDDATE"
// // //                             ].forEach(field => {
// // //                                 if (record[field]) {
// // //                                     record[field] = convertToISO(record[field]);
// // //                                     if (!isValidISODate(record[field])) {
// // //                                         isValid = false;
// // //                                         record.INVALID_FIELDS[field] = true;
// // //                                         record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid date for ${field}`;
// // //                                     }
// // //                                 } else {
// // //                                     // For empty date fields, mark as invalid for display but let backend see null
// // //                                     record[field] = "";
// // //                                     record.INVALID_FIELDS[field] = true;
// // //                                     isValid = false;
// // //                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Missing value for ${field}`;
// // //                                 }
// // //                             });

// // //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// // //                                 inactiveRecords.push(record);
// // //                                 isValid = false;
// // //                             }
// // //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// // //                                 isValid = false;
// // //                                 record.INVALID_FIELDS.EMPLOYEENAME = true;
// // //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid employee name";
// // //                             }
// // //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// // //                                 isValid = false;
// // //                                 record.INVALID_FIELDS.PSNUMBER = true;
// // //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid PSNUMBER";
// // //                             }

// // //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// // //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// // //                             applicationIdCounter++;

// // //                             record._isValid = isValid;
// // //                             allRecords.push(record);

// // //                             if (!isValid) {
// // //                                 invalidRecords.push(record);
// // //                             }
// // //                         }
// // //                     }

// // //                     this._allRecords = allRecords;
// // //                     this._headers = headers;

// // //                     const oView = this.getView();
// // //                     oView.setModel(new JSONModel({ employees: allRecords }));

// // //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// // //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// // //                     var oUIModel = oView.getModel("ui");
// // //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// // //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// // //                     oUIModel.setProperty("/currentPage", 1);
// // //                     var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

// // //                     const countYes = allRecords.filter(
// // //                         r => r.CONTRACTEXTENSION === true
// // //                     ).length;
// // //                     const countNo = allRecords.filter(
// // //                         r => r.CONTRACTEXTENSION === false
// // //                     ).length;
// // //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// // //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// // //                     oUIModel.setProperty("/isUploaded", true);

// // //                     this._showPage(1);

// // //                     if (invalidRecords.length > 0) {
// // //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// // //                     } else {
// // //                         MessageToast.show("File uploaded and all records displayed!");
// // //                     }

// // //                     let validRecords = allRecords.filter(r =>
// // //                         r._isValid &&
// // //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// // //                     );

// // //                     validRecords = deduplicateByPSNUMBER(validRecords);

// // //                     // Sanitize dates before upload
// // //                     const dateFields = [
// // //                         "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
// // //                         "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
// // //                         "SUBMITTEDDATE", "MODIFIEDDATE"
// // //                     ];
// // //                     validRecords.forEach(function(rec) {
// // //                         sanitizeDatesToNull(rec, dateFields);
// // //                     });

// // //                     if (validRecords.length > 0) {
// // //                         const mainModel = this.getView().getModel("mainModel");
// // //                         if (mainModel) {
// // //                             mainModel.callFunction("/bulkUpload", {
// // //                                 method: "POST",
// // //                                 urlParameters: {
// // //                                     jsonData: JSON.stringify(validRecords)
// // //                                 },
// // //                                 success: () => {
// // //                                     MessageToast.show("Valid records uploaded successfully.");
// // //                                 },
// // //                                 error: (error) => {
// // //                                     console.log("Upload error:", error);
// // //                                     MessageToast.show("Upload to backend failed.");
// // //                                 }
// // //                             });
// // //                         } else {
// // //                             MessageToast.show("Main model for backend upload not found.");
// // //                         }
// // //                     } else {
// // //                         MessageToast.show("No valid records to upload to backend.");
// // //                     }
// // //                 };

// // //                 reader.readAsText(file);
// // //             } else {
// // //                 MessageToast.show("This browser does not support file reading.");
// // //             }
// // //         },

// // //         _showPage: function (page) {
// // //             const oView = this.getView();
// // //             const allRecords = this._allRecords || [];
// // //             const headers = this._headers || [];
// // //             const oUIModel = oView.getModel("ui");
// // //             const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// // //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// // //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// // //             const start = (currentPage - 1) * pageSize;
// // //             const end = start + pageSize;
// // //             const pageRecords = allRecords.slice(start, end);

// // //             const oTable = oView.byId("dataTable");
// // //             oTable.removeAllColumns();
// // //             oTable.removeAllItems();

// // //             headers.forEach(header => {
// // //                 oTable.addColumn(new Column({
// // //                     header: new Text({ text: header }),
// // //                     width: "200px"
// // //                 }));
// // //             });

// // //             pageRecords.forEach(row => {
// // //                 const cells = headers.map(header => {
// // //                     const textValue = row[header] !== undefined ? String(row[header]) : "";
// // //                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// // //                         return new Text({ text: textValue }).addStyleClass("invalidCell");
// // //                     } else {
// // //                         return new Text({ text: textValue });
// // //                     }
// // //                 });
// // //                 const oItem = new ColumnListItem({ cells });
// // //                 oTable.addItem(oItem);
// // //             });

// // //             oTable.setVisible(true);
// // //             oView.byId("saveButton").setVisible(true);

// // //             oUIModel.setProperty("/currentPage", currentPage);
// // //             oUIModel.setProperty("/totalPages", totalPages);

// // //             this._updatePaginationBar();
// // //         },

// // //         _updatePaginationBar: function () {
// // //             const oView = this.getView();
// // //             const paginationBar = oView.byId("paginationBar");
// // //             const pageNumbersBox = oView.byId("pageNumbers");
// // //             const oUIModel = oView.getModel("ui");
// // //             const currentPage = oUIModel.getProperty("/currentPage");
// // //             const totalPages = oUIModel.getProperty("/totalPages");
// // //             const allRecords = this._allRecords || [];

// // //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// // //             pageNumbersBox.removeAllItems();

// // //             let start = Math.max(1, currentPage - 2);
// // //             let end = Math.min(totalPages, start + 4);
// // //             if (end - start < 4) {
// // //                 start = Math.max(1, end - 4);
// // //             }
// // //             for (let i = start; i <= end; i++) {
// // //                 pageNumbersBox.addItem(new Button({
// // //                     text: i.toString(),
// // //                     type: i === currentPage ? "Emphasized" : "Transparent",
// // //                     press: this.onPageSelect.bind(this, i),
// // //                     styleClass: i === currentPage ? "activePageButton" : ""
// // //                 }));
// // //             }

// // //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// // //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// // //         },

// // //         onRowCountChange: function (oEvent) {
// // //             var oUIModel = this.getView().getModel("ui");
// // //             var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
// // //             oUIModel.setProperty("/pageSize", newPageSize);

// // //             var allRecords = this._allRecords || [];
// // //             oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
// // //             oUIModel.setProperty("/currentPage", 1);
// // //             this._showPage(1);
// // //         },

// // //         onPrevPage: function () {
// // //             const oUIModel = this.getView().getModel("ui");
// // //             let page = oUIModel.getProperty("/currentPage");
// // //             if (page > 1) this._showPage(page - 1);
// // //         },

// // //         onNextPage: function () {
// // //             const oUIModel = this.getView().getModel("ui");
// // //             let page = oUIModel.getProperty("/currentPage");
// // //             let total = oUIModel.getProperty("/totalPages");
// // //             if (page < total) this._showPage(page + 1);
// // //         },

// // //         onPageSelect: function (page) {
// // //             this._showPage(page);
// // //         },

// // //         onopeninvalidrecords: function () {
// // //             var oView = this.getView();
// // //             var oDialog = oView.byId("invalidRecordsDialog");
// // //             var oTable = oView.byId("invalidRecordsTable");
// // //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// // //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// // //             oTable.removeAllColumns();
// // //             oTable.removeAllItems();
        
// // //             if (invalidData && invalidData.length > 0) {
// // //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// // //                 headers.forEach(header => {
// // //                     oTable.addColumn(new sap.m.Column({
// // //                         header: new sap.m.Text({ text: header }),
// // //                         width: "150px"
// // //                     }));
// // //                 });
// // //                 invalidData.forEach(row => {
// // //                     var cells = headers.map(header => {
// // //                         const textValue = row[header] !== undefined ? String(row[header]) : "";
// // //                         if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// // //                             return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
// // //                         } else {
// // //                             return new sap.m.Text({ text: textValue });
// // //                         }
// // //                     });
// // //                     var oItem = new sap.m.ColumnListItem({ cells });
// // //                     oTable.addItem(oItem);
// // //                 });
// // //             }
// // //             oDialog.open();
// // //         },
        
// // //         onCloseInvalidDialog: function () {
// // //             this.getView().byId("invalidRecordsDialog").close();
// // //         },

// // //         onShowInactiveRecords: function () {
// // //             const oView = this.getView();
// // //             const oDialog = oView.byId("inactiveRecordsDialog");
// // //             const oTable = oView.byId("inactiveRecordsTable");
// // //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// // //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// // //             oTable.removeAllColumns();
// // //             oTable.removeAllItems();
        
// // //             if (!inactiveData || inactiveData.length === 0) {
// // //                 sap.m.MessageToast.show("No inactive records available.");
// // //                 return;
// // //             }
        
// // //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// // //             headers.forEach(header => {
// // //                 oTable.addColumn(new sap.m.Column({
// // //                     header: new sap.m.Text({ text: header }),
// // //                     width: "150px"
// // //                 }));
// // //             });
// // //             inactiveData.forEach(row => {
// // //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// // //                 var oItem = new sap.m.ColumnListItem({ cells });
// // //                 oTable.addItem(oItem);
// // //             });
// // //             oDialog.open();
// // //         },
        
// // //         onCloseInactiveDialog: function () {
// // //             this.getView().byId("inactiveRecordsDialog").close();
// // //         },

// // //         onClear: function () {
// // //             this.getView().setModel(new JSONModel({ employees: [] }));
// // //             var oUIModel = this.getView().getModel("ui");
// // //             if (oUIModel) {
// // //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// // //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// // //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// // //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// // //                 oUIModel.setProperty("/currentPage", 1);
// // //                 oUIModel.setProperty("/totalPages", 1);
// // //                 oUIModel.setProperty("/isUploaded", false);
// // //                 oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
// // //             }
// // //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// // //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// // //             var oTable = this.getView().byId("dataTable");
// // //             if (oTable) {
// // //                 oTable.removeAllColumns();
// // //                 oTable.removeAllItems();
// // //                 oTable.setVisible(false);
// // //             }
// // //             var oSaveBtn = this.getView().byId("saveButton");
// // //             if (oSaveBtn) {
// // //                 oSaveBtn.setVisible(false);
// // //             }
// // //             var paginationBar = this.getView().byId("paginationBar");
// // //             if (paginationBar) {
// // //                 paginationBar.setVisible(false);
// // //             }
// // //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// // //             if (oFileUploader) {
// // //                 oFileUploader.clear();
// // //             }
// // //             this._allRecords = [];
// // //             this._headers = [];
// // //             sap.m.MessageToast.show("Table and data cleared.");
// // //         },

// // //         onShowContractExtensionDialog: function () {
// // //             const oView = this.getView();
// // //             const oDialog = oView.byId("contractExtensionDialog");
// // //             const oSelect = oView.byId("contractExtensionSelect");
// // //             if (oSelect) {
// // //                 oSelect.setSelectedKey("yes");
// // //             }
// // //             this.onShowContractExtensionFiltered("yes");
// // //             oDialog.open();
// // //         },
        
// // //         onShowContractExtensionFiltered: function (value) {
// // //             const allRecords = this._allRecords || [];
// // //             const headers = this._headers || [];
// // //             const filterVal = value === "yes" ? true : false;
// // //             const filtered = allRecords.filter(
// // //                 r => r.CONTRACTEXTENSION === filterVal
// // //             );
// // //             const oView = this.getView();
// // //             const oTable = oView.byId("contractExtensionTable");
// // //             oTable.removeAllColumns();
// // //             oTable.removeAllItems();
// // //             headers.forEach(header => {
// // //                 oTable.addColumn(new sap.m.Column({
// // //                     header: new sap.m.Text({ text: header }),
// // //                     width: "150px"
// // //                 }));
// // //             });
// // //             filtered.forEach(row => {
// // //                 const cells = headers.map(header => {
// // //                     const textValue = row[header] !== undefined ? String(row[header]) : "";
// // //                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// // //                         return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
// // //                     } else {
// // //                         return new sap.m.Text({ text: textValue });
// // //                     }
// // //                 });
// // //                 const oItem = new sap.m.ColumnListItem({ cells });
// // //                 oTable.addItem(oItem);
// // //             });
        
// // //             const oDialog = oView.byId("contractExtensionDialog");
// // //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// // //             var oUIModel = oView.getModel("ui");
// // //             if (oUIModel) {
// // //                 oUIModel.setProperty("/contractExtensionFilter", value);
// // //             }
// // //         },
        
// // //         onContractExtensionSelectChange: function (oEvent) {
// // //             const value = oEvent.getParameter("selectedItem").getKey();
// // //             this.onShowContractExtensionFiltered(value);
// // //         },
        
// // //         onCloseContractExtensionDialog: function () {
// // //             this.getView().byId("contractExtensionDialog").close();
// // //         },

// // //         onSaveInvalidRecords: function() {
// // //             var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
// // //             if (!invalidRecords.length) {
// // //                 sap.m.MessageToast.show("No invalid records to save.");
// // //                 return;
// // //             }
// // //             var cleanRecords = invalidRecords.map(function(rec) {
// // //                 var copy = Object.assign({}, rec);
// // //                 delete copy._isValid;
// // //                 delete copy.INVALID_FIELDS;
// // //                 if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
// // //                 return copy;
// // //             });

// // //             // Set empty date strings to null for backend
// // //             const dateFields = [
// // //                 "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
// // //                 "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
// // //                 "SUBMITTEDDATE", "MODIFIEDDATE"
// // //             ];
// // //             cleanRecords.forEach(function(rec) {
// // //                 sanitizeDatesToNull(rec, dateFields);
// // //             });

// // //             ["CONTRACTEXTENSION","PAYRATECHANGE","VMOHEADFLAG","VMOTEAMFLAG"].forEach(function(field){
// // //                 cleanRecords.forEach(function(rec){
// // //                     if (field in rec)
// // //                         rec[field] = yesNoToBoolean(rec[field]);
// // //                 });
// // //             });

// // //             var oModel = this.getView().getModel("mainModel");
// // //             if (!oModel) {
// // //                 sap.m.MessageToast.show("Main model not found.");
// // //                 return;
// // //             }

// // //             oModel.create("/saveInvalidEmployees", { records: cleanRecords }, {
// // //                 success: function() {
// // //                     sap.m.MessageToast.show("Invalid records saved to backend.");
// // //                 },
// // //                 error: function(oError) {
// // //                     // Try to extract backend error message for duplicates
// // //                     let errMsg = "Failed to save invalid records.";
// // //                     if (oError && oError.responseText) {
// // //                         try {
// // //                             const resp = JSON.parse(oError.responseText);
// // //                             if (resp.error && resp.error.message && resp.error.message.value) {
// // //                                 errMsg = resp.error.message.value;
// // //                             }
// // //                         } catch (e) {}
// // //                     }
// // //                     sap.m.MessageToast.show(errMsg);
// // //                     console.error(oError);
// // //                 }
// // //             });
// // //         }
// // //     });
// // // });

// // sap.ui.define([
// //     "sap/ui/core/mvc/Controller",
// //     "sap/ui/model/json/JSONModel",
// //     "sap/m/MessageToast",
// //     "sap/m/MessageBox",
// //     "sap/m/Column",
// //     "sap/m/Text",
// //     "sap/m/ColumnListItem",
// //     "sap/m/Button",
// //     "sap/m/HBox"
// // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
// //     "use strict";

// //     const DEFAULT_PAGE_SIZE = 5;

// //     function convertToISO(dateStr) {
// //         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
// //             var parts = dateStr.split("-");
// //             const month = parseInt(parts[1], 10);
// //             const day = parseInt(parts[0], 10);
// //             if (month < 1 || month > 12 || day < 1 || day > 31) return "";
// //             return parts[2] + "-" + parts[1] + "-" + parts[0];
// //         }
// //         return dateStr;
// //     }

// //     function deduplicateByPSNUMBER(records) {
// //         const seen = new Set();
// //         return records.filter(record => {
// //             if (seen.has(record.PSNUMBER)) {
// //                 return false;
// //             } else {
// //                 seen.add(record.PSNUMBER);
// //                 return true;
// //             }
// //         });
// //     }

// //     function yesNoToBoolean(val) {
// //         if (typeof val === "string") {
// //             if (val.trim().toLowerCase() === "yes") return true;
// //             if (val.trim().toLowerCase() === "no") return false;
// //         }
// //         return val;
// //     }

// //     function isValidISODate(val) {
// //         if (!val) return false;
// //         const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
// //         if (!match) return false;
// //         const year = Number(match[1]);
// //         const month = Number(match[2]);
// //         const day = Number(match[3]);
// //         if (month < 1 || month > 12) return false;
// //         if (day < 1 || day > 31) return false;
// //         const date = new Date(val);
// //         return (
// //             date.getFullYear() === year &&
// //             date.getMonth() === month - 1 &&
// //             date.getDate() === day
// //         );
// //     }

// //     // Utility to replace empty date strings with null and convert valid string to ISO (for backend)
// //     function sanitizeDatesToNull(record, dateFields) {
// //         dateFields.forEach(function(field) {
// //             if (record[field] === "") record[field] = null;
// //             else if (record[field]) record[field] = convertToISO(record[field]);
// //         });
// //     }

// //     // Utility: Fetch existing APPLICATIONID values from backend
// //     function fetchExistingIds(oModel, entitySet, idField) {
// //         // Returns a Promise that resolves to a Set of existing IDs
// //         return new Promise(function(resolve, reject) {
// //             oModel.read(entitySet, {
// //                 success: function(data) {
// //                     var idSet = new Set();
// //                     var results = data.results || [];
// //                     results.forEach(function(row) {
// //                         if (row[idField]) {
// //                             idSet.add(row[idField]);
// //                         }
// //                     });
// //                     resolve(idSet);
// //                 },
// //                 error: function(error) {
// //                     reject(error);
// //                 }
// //             });
// //         });
// //     }

// //     return Controller.extend("project1.controller.View1", {
// //         onInit: function () {
// //             var oUIModel = new JSONModel({ 
// //                 hasInvalidEmployees: false,
// //                 hasInactiveEmployees: false,
// //                 hasContractExtensionYes: false,
// //                 hasContractExtensionNo: false,
// //                 currentPage: 1,
// //                 totalPages: 1,
// //                 isUploaded: false,
// //                 pageSize: DEFAULT_PAGE_SIZE
// //             });
// //             this.getView().setModel(oUIModel, "ui");
// //         },

// //         onDownloadTemplate: function () {
// //             $.ajax({
// //                 url: "model/Template.csv",
// //                 dataType: "text",
// //                 success: (data) => {
// //                     const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
// //                     const link = document.createElement("a");
// //                     link.setAttribute("href", encodedUri);
// //                     link.setAttribute("download", "Template.csv");
// //                     document.body.appendChild(link);
// //                     link.click();
// //                     document.body.removeChild(link);
// //                     MessageToast.show("Template downloaded!");
// //                 },
// //                 error: () => {
// //                     MessageToast.show("Failed to fetch CSV for download.");
// //                 }
// //             });
// //         },

// //         onFileChange: function (oEvent) {
// //             const file = oEvent.getParameter("files")[0];
// //             this._uploadedFile = file;
// //             if (file && window.FileReader) {
// //                 const reader = new FileReader();

// //                 reader.onload = (e) => {
// //                     const csv = e.target.result;
// //                     const lines = csv.split("\n").filter(Boolean);
// //                     let headers = lines[0].trim().split(",");
// //                     const allRecords = [];
// //                     const invalidRecords = [];
// //                     const inactiveRecords = [];

// //                     const prefix = "SE";
// //                     const year = new Date().getFullYear();
// //                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
// //                     let applicationIdCounter = 1;

// //                     const namePattern = /^[A-Za-z\s]+$/;
// //                     const psNumberPattern = /^\d{9}$/;

// //                     if (!headers.includes("APPLICATIONID")) {
// //                         headers.push("APPLICATIONID");
// //                     }

// //                     for (let i = 1; i < lines.length; i++) {
// //                         const line = lines[i].trim();
// //                         if (line) {
// //                             const values = line.split(",");
// //                             const record = {};
// //                             record.INVALID_FIELDS = {};
// //                             headers.forEach((header, index) => {
// //                                 if (header !== "APPLICATIONID") {
// //                                     record[header] = values[index] ? values[index].trim() : "";
// //                                 }
// //                             });

// //                             let isValid = true;

// //                             [
// //                                 "CONTRACTEXTENSION",
// //                                 "PAYRATECHANGE",
// //                                 "VMOHEADFLAG",
// //                                 "VMOTEAMFLAG"
// //                             ].forEach(field => {
// //                                 if (field in record) {
// //                                     record[field] = yesNoToBoolean(record[field]);
// //                                 }
// //                             });

// //                             [
// //                                 "CONTRACTEXTENSION",
// //                                 "PAYRATECHANGE",
// //                                 "VMOHEADFLAG",
// //                                 "VMOTEAMFLAG"
// //                             ].forEach(field => {
// //                                 if (record[field] !== true && record[field] !== false && record[field] !== "" && record[field] !== undefined) {
// //                                     isValid = false;
// //                                     record.INVALID_FIELDS[field] = true;
// //                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid boolean value for ${field}`;
// //                                 }
// //                             });

// //                             [
// //                                 "DATEOFJOINING", 
// //                                 "CURRENTCONTRACTENDDATE", 
// //                                 "CONTRACTENDDATE", 
// //                                 "CONTRACTEXTENSIONSTARTDATE", 
// //                                 "CONTRACTEXTENSIONENDDATE", 
// //                                 "SUBMITTEDDATE", 
// //                                 "MODIFIEDDATE"
// //                             ].forEach(field => {
// //                                 if (record[field]) {
// //                                     record[field] = convertToISO(record[field]);
// //                                     if (!isValidISODate(record[field])) {
// //                                         isValid = false;
// //                                         record.INVALID_FIELDS[field] = true;
// //                                         record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid date for ${field}`;
// //                                     }
// //                                 } else {
// //                                     // For empty date fields, mark as invalid for display but let backend see null
// //                                     record[field] = "";
// //                                     record.INVALID_FIELDS[field] = true;
// //                                     isValid = false;
// //                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Missing value for ${field}`;
// //                                 }
// //                             });

// //                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
// //                                 inactiveRecords.push(record);
// //                                 isValid = false;
// //                             }
// //                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
// //                                 isValid = false;
// //                                 record.INVALID_FIELDS.EMPLOYEENAME = true;
// //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid employee name";
// //                             }
// //                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
// //                                 isValid = false;
// //                                 record.INVALID_FIELDS.PSNUMBER = true;
// //                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid PSNUMBER";
// //                             }

// //                             const suffix = String(applicationIdCounter).padStart(2, '0');
// //                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
// //                             applicationIdCounter++;

// //                             record._isValid = isValid;
// //                             allRecords.push(record);

// //                             if (!isValid) {
// //                                 invalidRecords.push(record);
// //                             }
// //                         }
// //                     }

// //                     this._allRecords = allRecords;
// //                     this._headers = headers;

// //                     const oView = this.getView();
// //                     oView.setModel(new JSONModel({ employees: allRecords }));

// //                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
// //                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

// //                     var oUIModel = oView.getModel("ui");
// //                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
// //                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
// //                     oUIModel.setProperty("/currentPage", 1);
// //                     var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// //                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

// //                     const countYes = allRecords.filter(
// //                         r => r.CONTRACTEXTENSION === true
// //                     ).length;
// //                     const countNo = allRecords.filter(
// //                         r => r.CONTRACTEXTENSION === false
// //                     ).length;
// //                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
// //                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

// //                     oUIModel.setProperty("/isUploaded", true);

// //                     this._showPage(1);

// //                     if (invalidRecords.length > 0) {
// //                         MessageBox.warning("Some records are invalid. Please verify or download them.");
// //                     } else {
// //                         MessageToast.show("File uploaded and all records displayed!");
// //                     }

// //                     let validRecords = allRecords.filter(r =>
// //                         r._isValid &&
// //                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
// //                     );

// //                     validRecords = deduplicateByPSNUMBER(validRecords);

// //                     // Sanitize dates before upload
// //                     const dateFields = [
// //                         "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
// //                         "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
// //                         "SUBMITTEDDATE", "MODIFIEDDATE"
// //                     ];
// //                     validRecords.forEach(function(rec) {
// //                         sanitizeDatesToNull(rec, dateFields);
// //                     });

// //                     if (validRecords.length > 0) {
// //                         const mainModel = this.getView().getModel("mainModel");
// //                         if (mainModel) {
// //                             mainModel.callFunction("/bulkUpload", {
// //                                 method: "POST",
// //                                 urlParameters: {
// //                                     jsonData: JSON.stringify(validRecords)
// //                                 },
// //                                 success: () => {
// //                                     MessageToast.show("Valid records uploaded successfully.");
// //                                 },
// //                                 error: (error) => {
// //                                     console.log("Upload error:", error);
// //                                     MessageToast.show("Upload to backend failed.");
// //                                 }
// //                             });
// //                         } else {
// //                             MessageToast.show("Main model for backend upload not found.");
// //                         }
// //                     } else {
// //                         MessageToast.show("No valid records to upload to backend.");
// //                     }
// //                 };

// //                 reader.readAsText(file);
// //             } else {
// //                 MessageToast.show("This browser does not support file reading.");
// //             }
// //         },

// //         _showPage: function (page) {
// //             const oView = this.getView();
// //             const allRecords = this._allRecords || [];
// //             const headers = this._headers || [];
// //             const oUIModel = oView.getModel("ui");
// //             const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
// //             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
// //             const currentPage = Math.min(Math.max(page, 1), totalPages);

// //             const start = (currentPage - 1) * pageSize;
// //             const end = start + pageSize;
// //             const pageRecords = allRecords.slice(start, end);

// //             const oTable = oView.byId("dataTable");
// //             oTable.removeAllColumns();
// //             oTable.removeAllItems();

// //             headers.forEach(header => {
// //                 oTable.addColumn(new Column({
// //                     header: new Text({ text: header }),
// //                     width: "200px"
// //                 }));
// //             });

// //             pageRecords.forEach(row => {
// //                 const cells = headers.map(header => {
// //                     const textValue = row[header] !== undefined ? String(row[header]) : "";
// //                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// //                         return new Text({ text: textValue }).addStyleClass("invalidCell");
// //                     } else {
// //                         return new Text({ text: textValue });
// //                     }
// //                 });
// //                 const oItem = new ColumnListItem({ cells });
// //                 oTable.addItem(oItem);
// //             });

// //             oTable.setVisible(true);
// //             oView.byId("saveButton").setVisible(true);

// //             oUIModel.setProperty("/currentPage", currentPage);
// //             oUIModel.setProperty("/totalPages", totalPages);

// //             this._updatePaginationBar();
// //         },

// //         _updatePaginationBar: function () {
// //             const oView = this.getView();
// //             const paginationBar = oView.byId("paginationBar");
// //             const pageNumbersBox = oView.byId("pageNumbers");
// //             const oUIModel = oView.getModel("ui");
// //             const currentPage = oUIModel.getProperty("/currentPage");
// //             const totalPages = oUIModel.getProperty("/totalPages");
// //             const allRecords = this._allRecords || [];

// //             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
// //             pageNumbersBox.removeAllItems();

// //             let start = Math.max(1, currentPage - 2);
// //             let end = Math.min(totalPages, start + 4);
// //             if (end - start < 4) {
// //                 start = Math.max(1, end - 4);
// //             }
// //             for (let i = start; i <= end; i++) {
// //                 pageNumbersBox.addItem(new Button({
// //                     text: i.toString(),
// //                     type: i === currentPage ? "Emphasized" : "Transparent",
// //                     press: this.onPageSelect.bind(this, i),
// //                     styleClass: i === currentPage ? "activePageButton" : ""
// //                 }));
// //             }

// //             oView.byId("btnPrev").setEnabled(currentPage > 1);
// //             oView.byId("btnNext").setEnabled(currentPage < totalPages);
// //         },

// //         onRowCountChange: function (oEvent) {
// //             var oUIModel = this.getView().getModel("ui");
// //             var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
// //             oUIModel.setProperty("/pageSize", newPageSize);

// //             var allRecords = this._allRecords || [];
// //             oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
// //             oUIModel.setProperty("/currentPage", 1);
// //             this._showPage(1);
// //         },

// //         onPrevPage: function () {
// //             const oUIModel = this.getView().getModel("ui");
// //             let page = oUIModel.getProperty("/currentPage");
// //             if (page > 1) this._showPage(page - 1);
// //         },

// //         onNextPage: function () {
// //             const oUIModel = this.getView().getModel("ui");
// //             let page = oUIModel.getProperty("/currentPage");
// //             let total = oUIModel.getProperty("/totalPages");
// //             if (page < total) this._showPage(page + 1);
// //         },

// //         onPageSelect: function (page) {
// //             this._showPage(page);
// //         },

// //         onopeninvalidrecords: function () {
// //             var oView = this.getView();
// //             var oDialog = oView.byId("invalidRecordsDialog");
// //             var oTable = oView.byId("invalidRecordsTable");
// //             var invalidModel = sap.ui.getCore().getModel("invalidModel");
// //             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
// //             oTable.removeAllColumns();
// //             oTable.removeAllItems();
        
// //             if (invalidData && invalidData.length > 0) {
// //                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
// //                 headers.forEach(header => {
// //                     oTable.addColumn(new sap.m.Column({
// //                         header: new sap.m.Text({ text: header }),
// //                         width: "150px"
// //                     }));
// //                 });
// //                 invalidData.forEach(row => {
// //                     var cells = headers.map(header => {
// //                         const textValue = row[header] !== undefined ? String(row[header]) : "";
// //                         if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// //                             return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
// //                         } else {
// //                             return new sap.m.Text({ text: textValue });
// //                         }
// //                     });
// //                     var oItem = new sap.m.ColumnListItem({ cells });
// //                     oTable.addItem(oItem);
// //                 });
// //             }
// //             oDialog.open();
// //         },
        
// //         onCloseInvalidDialog: function () {
// //             this.getView().byId("invalidRecordsDialog").close();
// //         },

// //         onShowInactiveRecords: function () {
// //             const oView = this.getView();
// //             const oDialog = oView.byId("inactiveRecordsDialog");
// //             const oTable = oView.byId("inactiveRecordsTable");
// //             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
// //             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
// //             oTable.removeAllColumns();
// //             oTable.removeAllItems();
        
// //             if (!inactiveData || inactiveData.length === 0) {
// //                 sap.m.MessageToast.show("No inactive records available.");
// //                 return;
// //             }
        
// //             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
// //             headers.forEach(header => {
// //                 oTable.addColumn(new sap.m.Column({
// //                     header: new sap.m.Text({ text: header }),
// //                     width: "150px"
// //                 }));
// //             });
// //             inactiveData.forEach(row => {
// //                 var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
// //                 var oItem = new sap.m.ColumnListItem({ cells });
// //                 oTable.addItem(oItem);
// //             });
// //             oDialog.open();
// //         },
        
// //         onCloseInactiveDialog: function () {
// //             this.getView().byId("inactiveRecordsDialog").close();
// //         },

// //         onClear: function () {
// //             this.getView().setModel(new JSONModel({ employees: [] }));
// //             var oUIModel = this.getView().getModel("ui");
// //             if (oUIModel) {
// //                 oUIModel.setProperty("/hasInvalidEmployees", false);
// //                 oUIModel.setProperty("/hasInactiveEmployees", false);
// //                 oUIModel.setProperty("/hasContractExtensionYes", false);
// //                 oUIModel.setProperty("/hasContractExtensionNo", false);
// //                 oUIModel.setProperty("/currentPage", 1);
// //                 oUIModel.setProperty("/totalPages", 1);
// //                 oUIModel.setProperty("/isUploaded", false);
// //                 oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
// //             }
// //             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
// //             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
// //             var oTable = this.getView().byId("dataTable");
// //             if (oTable) {
// //                 oTable.removeAllColumns();
// //                 oTable.removeAllItems();
// //                 oTable.setVisible(false);
// //             }
// //             var oSaveBtn = this.getView().byId("saveButton");
// //             if (oSaveBtn) {
// //                 oSaveBtn.setVisible(false);
// //             }
// //             var paginationBar = this.getView().byId("paginationBar");
// //             if (paginationBar) {
// //                 paginationBar.setVisible(false);
// //             }
// //             var oFileUploader = this.getView().byId("yourFileUploaderId");
// //             if (oFileUploader) {
// //                 oFileUploader.clear();
// //             }
// //             this._allRecords = [];
// //             this._headers = [];
// //             sap.m.MessageToast.show("Table and data cleared.");
// //         },

// //         onShowContractExtensionDialog: function () {
// //             const oView = this.getView();
// //             const oDialog = oView.byId("contractExtensionDialog");
// //             const oSelect = oView.byId("contractExtensionSelect");
// //             if (oSelect) {
// //                 oSelect.setSelectedKey("yes");
// //             }
// //             this.onShowContractExtensionFiltered("yes");
// //             oDialog.open();
// //         },
        
// //         onShowContractExtensionFiltered: function (value) {
// //             const allRecords = this._allRecords || [];
// //             const headers = this._headers || [];
// //             const filterVal = value === "yes" ? true : false;
// //             const filtered = allRecords.filter(
// //                 r => r.CONTRACTEXTENSION === filterVal
// //             );
// //             const oView = this.getView();
// //             const oTable = oView.byId("contractExtensionTable");
// //             oTable.removeAllColumns();
// //             oTable.removeAllItems();
// //             headers.forEach(header => {
// //                 oTable.addColumn(new sap.m.Column({
// //                     header: new sap.m.Text({ text: header }),
// //                     width: "150px"
// //                 }));
// //             });
// //             filtered.forEach(row => {
// //                 const cells = headers.map(header => {
// //                     const textValue = row[header] !== undefined ? String(row[header]) : "";
// //                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
// //                         return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
// //                     } else {
// //                         return new sap.m.Text({ text: textValue });
// //                     }
// //                 });
// //                 const oItem = new sap.m.ColumnListItem({ cells });
// //                 oTable.addItem(oItem);
// //             });
        
// //             const oDialog = oView.byId("contractExtensionDialog");
// //             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
// //             var oUIModel = oView.getModel("ui");
// //             if (oUIModel) {
// //                 oUIModel.setProperty("/contractExtensionFilter", value);
// //             }
// //         },
        
// //         onContractExtensionSelectChange: function (oEvent) {
// //             const value = oEvent.getParameter("selectedItem").getKey();
// //             this.onShowContractExtensionFiltered(value);
// //         },
        
// //         onCloseContractExtensionDialog: function () {
// //             this.getView().byId("contractExtensionDialog").close();
// //         },

// //         onSaveInvalidRecords: async function() {
// //             var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
// //             if (!invalidRecords.length) {
// //                 sap.m.MessageToast.show("No invalid records to save.");
// //                 return;
// //             }
// //             var cleanRecords = invalidRecords.map(function(rec) {
// //                 var copy = Object.assign({}, rec);
// //                 delete copy._isValid;
// //                 delete copy.INVALID_FIELDS;
// //                 if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
// //                 return copy;
// //             });

// //             // Set empty date strings to null for backend
// //             const dateFields = [
// //                 "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
// //                 "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
// //                 "SUBMITTEDDATE", "MODIFIEDDATE"
// //             ];
// //             cleanRecords.forEach(function(rec) {
// //                 sanitizeDatesToNull(rec, dateFields);
// //             });

// //             ["CONTRACTEXTENSION","PAYRATECHANGE","VMOHEADFLAG","VMOTEAMFLAG"].forEach(function(field){
// //                 cleanRecords.forEach(function(rec){
// //                     if (field in rec)
// //                         rec[field] = yesNoToBoolean(rec[field]);
// //                 });
// //             });

// //             var oModel = this.getView().getModel("mainModel");
// //             if (!oModel) {
// //                 sap.m.MessageToast.show("Main model not found.");
// //                 return;
// //             }

// //             // --- Fetch existing records and filter duplicates before saving ---
// //             var entitySet = "/InvalidEmployees"; // <-- UPDATE to your OData entityset if needed
// //             var idField = "APPLICATIONID";       // <-- UPDATE to your unique field if needed
// //             let existingIds;
// //             try {
// //                 existingIds = await fetchExistingIds(oModel, entitySet, idField);
// //             } catch (error) {
// //                 sap.m.MessageToast.show("Could not fetch existing invalid records. Save aborted.");
// //                 return;
// //             }
// //             var recordsToSave = cleanRecords.filter(function(rec) {
// //                 return rec[idField] && !existingIds.has(rec[idField]);
// //             });
// //             if (!recordsToSave.length) {
// //                 sap.m.MessageToast.show("No new invalid records to save (all exist already).");
// //                 return;
// //             }

// //             oModel.create("/saveInvalidEmployees", { records: recordsToSave }, {
// //                 success: function() {
// //                     sap.m.MessageToast.show("Invalid records saved to backend.");
// //                 },
// //                 error: function(oError) {
// //                     let errMsg = "Failed to save invalid records.";
// //                     if (oError && oError.responseText) {
// //                         try {
// //                             const resp = JSON.parse(oError.responseText);
// //                             if (resp.error && resp.error.message && resp.error.message.value) {
// //                                 errMsg = resp.error.message.value;
// //                             }
// //                         } catch (e) {}
// //                     }
// //                     sap.m.MessageToast.show(errMsg);
// //                     console.error(oError);
// //                 }
// //             });
// //         }
// //     });
// // });


// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/m/MessageToast",
//     "sap/m/MessageBox",
//     "sap/m/Column",
//     "sap/m/Text",
//     "sap/m/ColumnListItem",
//     "sap/m/Button",
//     "sap/m/HBox"
// ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
//     "use strict";

//     const DEFAULT_PAGE_SIZE = 5;

//     function convertToISO(dateStr) {
//         if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
//             var parts = dateStr.split("-");
//             const month = parseInt(parts[1], 10);
//             const day = parseInt(parts[0], 10);
//             if (month < 1 || month > 12 || day < 1 || day > 31) return "";
//             return parts[2] + "-" + parts[1] + "-" + parts[0];
//         }
//         return dateStr;
//     }

//     function deduplicateByPSNUMBER(records) {
//         const seen = new Set();
//         return records.filter(record => {
//             if (seen.has(record.PSNUMBER)) {
//                 return false;
//             } else {
//                 seen.add(record.PSNUMBER);
//                 return true;
//             }
//         });
//     }

//     function yesNoToBoolean(val) {
//         if (typeof val === "string") {
//             if (val.trim().toLowerCase() === "yes") return true;
//             if (val.trim().toLowerCase() === "no") return false;
//         }
//         return val;
//     }

//     function isValidISODate(val) {
//         if (!val) return false;
//         const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
//         if (!match) return false;
//         const year = Number(match[1]);
//         const month = Number(match[2]);
//         const day = Number(match[3]);
//         if (month < 1 || month > 12) return false;
//         if (day < 1 || day > 31) return false;
//         const date = new Date(val);
//         return (
//             date.getFullYear() === year &&
//             date.getMonth() === month - 1 &&
//             date.getDate() === day
//         );
//     }

//     // Utility to replace empty date strings with null and convert valid string to ISO (for backend)
//     function sanitizeDatesToNull(record, dateFields) {
//         dateFields.forEach(function(field) {
//             if (record[field] === "") record[field] = null;
//             else if (record[field]) record[field] = convertToISO(record[field]);
//         });
//     }

//     // Utility: Fetch existing APPLICATIONID values from backend
//     function fetchExistingIds(oModel, entitySet, idField) {
//         return new Promise(function(resolve, reject) {
//             oModel.read(entitySet, {
//                 success: function(data) {
//                     var idSet = new Set();
//                     var results = data.results || [];
//                     results.forEach(function(row) {
//                         if (row[idField]) {
//                             idSet.add(row[idField]);
//                         }
//                     });
//                     resolve(idSet);
//                 },
//                 error: function(error) {
//                     reject(error);
//                 }
//             });
//         });
//     }

//     return Controller.extend("project1.controller.View1", {
//         onInit: function () {
//             var oUIModel = new JSONModel({ 
//                 hasInvalidEmployees: false,
//                 hasInactiveEmployees: false,
//                 hasContractExtensionYes: false,
//                 hasContractExtensionNo: false,
//                 currentPage: 1,
//                 totalPages: 1,
//                 isUploaded: false,
//                 pageSize: DEFAULT_PAGE_SIZE
//             });
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

//             // --- Refresh invalid/inactive records and UI flags before upload ---
//             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
//             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
//             var oUIModel = this.getView().getModel("ui");
//             if (oUIModel) {
//                 oUIModel.setProperty("/hasInvalidEmployees", false);
//                 oUIModel.setProperty("/hasInactiveEmployees", false);
//             }
//             // ---------------------------------------------------------------

//             if (file && window.FileReader) {
//                 const reader = new FileReader();

//                 reader.onload = (e) => {
//                     const csv = e.target.result;
//                     const lines = csv.split("\n").filter(Boolean);
//                     let headers = lines[0].trim().split(",");
//                     const allRecords = [];
//                     const invalidRecords = [];
//                     const inactiveRecords = [];

//                     const prefix = "SE";
//                     const year = new Date().getFullYear();
//                     var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
//                     let applicationIdCounter = 1;

//                     const namePattern = /^[A-Za-z\s]+$/;
//                     const psNumberPattern = /^\d{9}$/;

//                     if (!headers.includes("APPLICATIONID")) {
//                         headers.push("APPLICATIONID");
//                     }

//                     for (let i = 1; i < lines.length; i++) {
//                         const line = lines[i].trim();
//                         if (line) {
//                             const values = line.split(",");
//                             const record = {};
//                             record.INVALID_FIELDS = {};
//                             headers.forEach((header, index) => {
//                                 if (header !== "APPLICATIONID") {
//                                     record[header] = values[index] ? values[index].trim() : "";
//                                 }
//                             });

//                             let isValid = true;

//                             [
//                                 "CONTRACTEXTENSION",
//                                 "PAYRATECHANGE",
//                                 "VMOHEADFLAG",
//                                 "VMOTEAMFLAG"
//                             ].forEach(field => {
//                                 if (field in record) {
//                                     record[field] = yesNoToBoolean(record[field]);
//                                 }
//                             });

//                             [
//                                 "CONTRACTEXTENSION",
//                                 "PAYRATECHANGE",
//                                 "VMOHEADFLAG",
//                                 "VMOTEAMFLAG"
//                             ].forEach(field => {
//                                 if (record[field] !== true && record[field] !== false && record[field] !== "" && record[field] !== undefined) {
//                                     isValid = false;
//                                     record.INVALID_FIELDS[field] = true;
//                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid boolean value for ${field}`;
//                                 }
//                             });

//                             [
//                                 "DATEOFJOINING", 
//                                 "CURRENTCONTRACTENDDATE", 
//                                 "CONTRACTENDDATE", 
//                                 "CONTRACTEXTENSIONSTARTDATE", 
//                                 "CONTRACTEXTENSIONENDDATE", 
//                                 "SUBMITTEDDATE", 
//                                 "MODIFIEDDATE"
//                             ].forEach(field => {
//                                 if (record[field]) {
//                                     record[field] = convertToISO(record[field]);
//                                     if (!isValidISODate(record[field])) {
//                                         isValid = false;
//                                         record.INVALID_FIELDS[field] = true;
//                                         record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid date for ${field}`;
//                                     }
//                                 } else {
//                                     record[field] = "";
//                                     record.INVALID_FIELDS[field] = true;
//                                     isValid = false;
//                                     record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Missing value for ${field}`;
//                                 }
//                             });

//                             if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
//                                 inactiveRecords.push(record);
//                                 isValid = false;
//                             }
//                             if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
//                                 isValid = false;
//                                 record.INVALID_FIELDS.EMPLOYEENAME = true;
//                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid employee name";
//                             }
//                             if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
//                                 isValid = false;
//                                 record.INVALID_FIELDS.PSNUMBER = true;
//                                 record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid PSNUMBER";
//                             }

//                             const suffix = String(applicationIdCounter).padStart(2, '0');
//                             record.APPLICATIONID = `${prefix}${year}-${userId}-${suffix}`;
//                             applicationIdCounter++;

//                             record._isValid = isValid;
//                             allRecords.push(record);

//                             if (!isValid) {
//                                 invalidRecords.push(record);
//                             }
//                         }
//                     }

//                     this._allRecords = allRecords;
//                     this._headers = headers;

//                     const oView = this.getView();
//                     oView.setModel(new JSONModel({ employees: allRecords }));

//                     sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
//                     sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

//                     var oUIModel = oView.getModel("ui");
//                     oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
//                     oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
//                     oUIModel.setProperty("/currentPage", 1);
//                     var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
//                     oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

//                     const countYes = allRecords.filter(
//                         r => r.CONTRACTEXTENSION === true
//                     ).length;
//                     const countNo = allRecords.filter(
//                         r => r.CONTRACTEXTENSION === false
//                     ).length;
//                     oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
//                     oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

//                     oUIModel.setProperty("/isUploaded", true);

//                     this._showPage(1);

//                     if (invalidRecords.length > 0) {
//                         MessageBox.warning("Some records are invalid. Please verify or download them.");
//                     } else {
//                         MessageToast.show("File uploaded and all records displayed!");
//                     }

//                     let validRecords = allRecords.filter(r =>
//                         r._isValid &&
//                         (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
//                     );

//                     validRecords = deduplicateByPSNUMBER(validRecords);

//                     // Sanitize dates before upload
//                     const dateFields = [
//                         "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
//                         "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
//                         "SUBMITTEDDATE", "MODIFIEDDATE"
//                     ];
//                     validRecords.forEach(function(rec) {
//                         sanitizeDatesToNull(rec, dateFields);
//                     });

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

//         _showPage: function (page) {
//             const oView = this.getView();
//             const allRecords = this._allRecords || [];
//             const headers = this._headers || [];
//             const oUIModel = oView.getModel("ui");
//             const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
//             const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
//             const currentPage = Math.min(Math.max(page, 1), totalPages);

//             const start = (currentPage - 1) * pageSize;
//             const end = start + pageSize;
//             const pageRecords = allRecords.slice(start, end);

//             const oTable = oView.byId("dataTable");
//             oTable.removeAllColumns();
//             oTable.removeAllItems();

//             headers.forEach(header => {
//                 oTable.addColumn(new Column({
//                     header: new Text({ text: header }),
//                     width: "200px"
//                 }));
//             });

//             pageRecords.forEach(row => {
//                 const cells = headers.map(header => {
//                     const textValue = row[header] !== undefined ? String(row[header]) : "";
//                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
//                         return new Text({ text: textValue }).addStyleClass("invalidCell");
//                     } else {
//                         return new Text({ text: textValue });
//                     }
//                 });
//                 const oItem = new ColumnListItem({ cells });
//                 oTable.addItem(oItem);
//             });

//             oTable.setVisible(true);
//             oView.byId("saveButton").setVisible(true);

//             oUIModel.setProperty("/currentPage", currentPage);
//             oUIModel.setProperty("/totalPages", totalPages);

//             this._updatePaginationBar();
//         },

//         _updatePaginationBar: function () {
//             const oView = this.getView();
//             const paginationBar = oView.byId("paginationBar");
//             const pageNumbersBox = oView.byId("pageNumbers");
//             const oUIModel = oView.getModel("ui");
//             const currentPage = oUIModel.getProperty("/currentPage");
//             const totalPages = oUIModel.getProperty("/totalPages");
//             const allRecords = this._allRecords || [];

//             paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
//             pageNumbersBox.removeAllItems();

//             let start = Math.max(1, currentPage - 2);
//             let end = Math.min(totalPages, start + 4);
//             if (end - start < 4) {
//                 start = Math.max(1, end - 4);
//             }
//             for (let i = start; i <= end; i++) {
//                 pageNumbersBox.addItem(new Button({
//                     text: i.toString(),
//                     type: i === currentPage ? "Emphasized" : "Transparent",
//                     press: this.onPageSelect.bind(this, i),
//                     styleClass: i === currentPage ? "activePageButton" : ""
//                 }));
//             }

//             oView.byId("btnPrev").setEnabled(currentPage > 1);
//             oView.byId("btnNext").setEnabled(currentPage < totalPages);
//         },

//         onRowCountChange: function (oEvent) {
//             var oUIModel = this.getView().getModel("ui");
//             var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
//             oUIModel.setProperty("/pageSize", newPageSize);

//             var allRecords = this._allRecords || [];
//             oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
//             oUIModel.setProperty("/currentPage", 1);
//             this._showPage(1);
//         },

//         onPrevPage: function () {
//             const oUIModel = this.getView().getModel("ui");
//             let page = oUIModel.getProperty("/currentPage");
//             if (page > 1) this._showPage(page - 1);
//         },

//         onNextPage: function () {
//             const oUIModel = this.getView().getModel("ui");
//             let page = oUIModel.getProperty("/currentPage");
//             let total = oUIModel.getProperty("/totalPages");
//             if (page < total) this._showPage(page + 1);
//         },

//         onPageSelect: function (page) {
//             this._showPage(page);
//         },

//         onopeninvalidrecords: function () {
//             var oView = this.getView();
//             var oDialog = oView.byId("invalidRecordsDialog");
//             var oTable = oView.byId("invalidRecordsTable");
//             var invalidModel = sap.ui.getCore().getModel("invalidModel");
//             var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
//             oTable.removeAllColumns();
//             oTable.removeAllItems();
        
//             if (invalidData && invalidData.length > 0) {
//                 var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
//                 headers.forEach(header => {
//                     oTable.addColumn(new sap.m.Column({
//                         header: new sap.m.Text({ text: header }),
//                         width: "150px"
//                     }));
//                 });
//                 invalidData.forEach(row => {
//                     var cells = headers.map(header => {
//                         const textValue = row[header] !== undefined ? String(row[header]) : "";
//                         if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
//                             return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
//                         } else {
//                             return new sap.m.Text({ text: textValue });
//                         }
//                     });
//                     var oItem = new sap.m.ColumnListItem({ cells });
//                     oTable.addItem(oItem);
//                 });
//             }
//             oDialog.open();
//         },
        
//         onCloseInvalidDialog: function () {
//             this.getView().byId("invalidRecordsDialog").close();
//         },

//         onShowInactiveRecords: function () {
//             const oView = this.getView();
//             const oDialog = oView.byId("inactiveRecordsDialog");
//             const oTable = oView.byId("inactiveRecordsTable");
//             const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
//             const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
//             oTable.removeAllColumns();
//             oTable.removeAllItems();
        
//             if (!inactiveData || inactiveData.length === 0) {
//                 sap.m.MessageToast.show("No inactive records available.");
//                 return;
//             }
        
//             var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
//             headers.forEach(header => {
//                 oTable.addColumn(new sap.m.Column({
//                     header: new sap.m.Text({ text: header }),
//                     width: "150px"
//                 }));
//             });
//             inactiveData.forEach(row => {
//                 var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
//                 var oItem = new sap.m.ColumnListItem({ cells });
//                 oTable.addItem(oItem);
//             });
//             oDialog.open();
//         },
        
//         onCloseInactiveDialog: function () {
//             this.getView().byId("inactiveRecordsDialog").close();
//         },

//         onClear: function () {
//             this.getView().setModel(new JSONModel({ employees: [] }));
//             var oUIModel = this.getView().getModel("ui");
//             if (oUIModel) {
//                 oUIModel.setProperty("/hasInvalidEmployees", false);
//                 oUIModel.setProperty("/hasInactiveEmployees", false);
//                 oUIModel.setProperty("/hasContractExtensionYes", false);
//                 oUIModel.setProperty("/hasContractExtensionNo", false);
//                 oUIModel.setProperty("/currentPage", 1);
//                 oUIModel.setProperty("/totalPages", 1);
//                 oUIModel.setProperty("/isUploaded", false);
//                 oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
//             }
//             sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
//             sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
//             var oTable = this.getView().byId("dataTable");
//             if (oTable) {
//                 oTable.removeAllColumns();
//                 oTable.removeAllItems();
//                 oTable.setVisible(false);
//             }
//             var oSaveBtn = this.getView().byId("saveButton");
//             if (oSaveBtn) {
//                 oSaveBtn.setVisible(false);
//             }
//             var paginationBar = this.getView().byId("paginationBar");
//             if (paginationBar) {
//                 paginationBar.setVisible(false);
//             }
//             var oFileUploader = this.getView().byId("yourFileUploaderId");
//             if (oFileUploader) {
//                 oFileUploader.clear();
//             }
//             this._allRecords = [];
//             this._headers = [];
//             sap.m.MessageToast.show("Table and data cleared.");
//         },

//         onShowContractExtensionDialog: function () {
//             const oView = this.getView();
//             const oDialog = oView.byId("contractExtensionDialog");
//             const oSelect = oView.byId("contractExtensionSelect");
//             if (oSelect) {
//                 oSelect.setSelectedKey("yes");
//             }
//             this.onShowContractExtensionFiltered("yes");
//             oDialog.open();
//         },
        
//         onShowContractExtensionFiltered: function (value) {
//             const allRecords = this._allRecords || [];
//             const headers = this._headers || [];
//             const filterVal = value === "yes" ? true : false;
//             const filtered = allRecords.filter(
//                 r => r.CONTRACTEXTENSION === filterVal
//             );
//             const oView = this.getView();
//             const oTable = oView.byId("contractExtensionTable");
//             oTable.removeAllColumns();
//             oTable.removeAllItems();
//             headers.forEach(header => {
//                 oTable.addColumn(new sap.m.Column({
//                     header: new sap.m.Text({ text: header }),
//                     width: "150px"
//                 }));
//             });
//             filtered.forEach(row => {
//                 const cells = headers.map(header => {
//                     const textValue = row[header] !== undefined ? String(row[header]) : "";
//                     if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
//                         return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
//                     } else {
//                         return new sap.m.Text({ text: textValue });
//                     }
//                 });
//                 const oItem = new sap.m.ColumnListItem({ cells });
//                 oTable.addItem(oItem);
//             });
        
//             const oDialog = oView.byId("contractExtensionDialog");
//             oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
//             var oUIModel = oView.getModel("ui");
//             if (oUIModel) {
//                 oUIModel.setProperty("/contractExtensionFilter", value);
//             }
//         },
        
//         onContractExtensionSelectChange: function (oEvent) {
//             const value = oEvent.getParameter("selectedItem").getKey();
//             this.onShowContractExtensionFiltered(value);
//         },
        
//         onCloseContractExtensionDialog: function () {
//             this.getView().byId("contractExtensionDialog").close();
//         },

//         onSaveInvalidRecords: async function() {
//             var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
//             if (!invalidRecords.length) {
//                 sap.m.MessageToast.show("No invalid records to save.");
//                 return;
//             }
//             var cleanRecords = invalidRecords.map(function(rec) {
//                 var copy = Object.assign({}, rec);
//                 delete copy._isValid;
//                 delete copy.INVALID_FIELDS;
//                 if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
//                 return copy;
//             });

//             // Set empty date strings to null for backend
//             const dateFields = [
//                 "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
//                 "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
//                 "SUBMITTEDDATE", "MODIFIEDDATE"
//             ];
//             cleanRecords.forEach(function(rec) {
//                 sanitizeDatesToNull(rec, dateFields);
//             });

//             ["CONTRACTEXTENSION","PAYRATECHANGE","VMOHEADFLAG","VMOTEAMFLAG"].forEach(function(field){
//                 cleanRecords.forEach(function(rec){
//                     if (field in rec)
//                         rec[field] = yesNoToBoolean(rec[field]);
//                 });
//             });

//             var oModel = this.getView().getModel("mainModel");
//             if (!oModel) {
//                 sap.m.MessageToast.show("Main model not found.");
//                 return;
//             }

//             // --- Fetch existing records and filter duplicates before saving ---
//             var entitySet = "/InvalidEmployees"; // <-- UPDATE to your OData entityset if needed
//             var idField = "APPLICATIONID";       // <-- UPDATE to your unique field if needed
//             let existingIds;
//             try {
//                 existingIds = await fetchExistingIds(oModel, entitySet, idField);
//             } catch (error) {
//                 sap.m.MessageToast.show("Could not fetch existing invalid records. Save aborted.");
//                 return;
//             }
//             var recordsToSave = cleanRecords.filter(function(rec) {
//                 return rec[idField] && !existingIds.has(rec[idField]);
//             });
//             if (!recordsToSave.length) {
//                 sap.m.MessageToast.show("No new invalid records to save (all exist already).");
//                 return;
//             }

//             oModel.create("/saveInvalidEmployees", { records: recordsToSave }, {
//                 success: function() {
//                     sap.m.MessageToast.show("Invalid records saved to backend.");
//                 },
//                 error: function(oError) {
//                     let errMsg = "Failed to save invalid records.";
//                     if (oError && oError.responseText) {
//                         try {
//                             const resp = JSON.parse(oError.responseText);
//                             if (resp.error && resp.error.message && resp.error.message.value) {
//                                 errMsg = resp.error.message.value;
//                             }
//                         } catch (e) {}
//                     }
//                     sap.m.MessageToast.show(errMsg);
//                     console.error(oError);
//                 }
//             });
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
    "sap/m/ColumnListItem",
    "sap/m/Button",
    "sap/m/HBox"
], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem, Button, HBox) {
    "use strict";

    const DEFAULT_PAGE_SIZE = 5;

    function convertToISO(dateStr) {
        if (dateStr && /^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
            var parts = dateStr.split("-");
            const month = parseInt(parts[1], 10);
            const day = parseInt(parts[0], 10);
            if (month < 1 || month > 12 || day < 1 || day > 31) return "";
            return parts[2] + "-" + parts[1] + "-" + parts[0];
        }
        return dateStr;
    }

    function deduplicateByPSNUMBER(records) {
        const seen = new Set();
        return records.filter(record => {
            if (seen.has(record.PSNUMBER)) {
                return false;
            } else {
                seen.add(record.PSNUMBER);
                return true;
            }
        });
    }

    function yesNoToBoolean(val) {
        if (typeof val === "string") {
            if (val.trim().toLowerCase() === "yes") return true;
            if (val.trim().toLowerCase() === "no") return false;
        }
        return val;
    }

    function isValidISODate(val) {
        if (!val) return false;
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
        if (!match) return false;
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        const date = new Date(val);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }

    // Utility to replace empty date strings with null and convert valid string to ISO (for backend)
    function sanitizeDatesToNull(record, dateFields) {
        dateFields.forEach(function(field) {
            if (record[field] === "") record[field] = null;
            else if (record[field]) record[field] = convertToISO(record[field]);
        });
    }

    // Utility: Fetch existing APPLICATIONID values from backend
    function fetchExistingIds(oModel, entitySet, idField) {
        // Returns a Promise that resolves to a Set of existing IDs
        return new Promise(function(resolve, reject) {
            oModel.read(entitySet, {
                success: function(data) {
                    var idSet = new Set();
                    var results = data.results || [];
                    results.forEach(function(row) {
                        if (row[idField]) {
                            idSet.add(row[idField]);
                        }
                    });
                    resolve(idSet);
                },
                error: function(error) {
                    reject(error);
                }
            });
        });
    }

    // Helper to generate unique APPLICATIONID (adds timestamp for every upload)
    function generateApplicationId(prefix, year, userId, counter) {
        const suffix = String(counter).padStart(2, '0');
        const timestamp = Date.now();
        return `${prefix}${year}-${userId}-${suffix}-${timestamp}`;
    }

    return Controller.extend("project1.controller.View1", {
        onInit: function () {
            var oUIModel = new JSONModel({ 
                hasInvalidEmployees: false,
                hasInactiveEmployees: false,
                hasContractExtensionYes: false,
                hasContractExtensionNo: false,
                currentPage: 1,
                totalPages: 1,
                isUploaded: false,
                pageSize: DEFAULT_PAGE_SIZE
            });
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
            // --- Reset invalid/inactive records and UI flags before processing new file ---
            sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
            sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
            var oUIModel = this.getView().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/hasInvalidEmployees", false);
                oUIModel.setProperty("/hasInactiveEmployees", false);
            }
            // -------------------------------------------------------------------------------

            const file = oEvent.getParameter("files")[0];
            this._uploadedFile = file;
            if (file && window.FileReader) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const csv = e.target.result;
                    const lines = csv.split("\n").filter(Boolean);
                    let headers = lines[0].trim().split(",");
                    const allRecords = [];
                    const invalidRecords = [];
                    const inactiveRecords = [];

                    const prefix = "SE";
                    const year = new Date().getFullYear();
                    var userId = sap.ushell && sap.ushell.Container && sap.ushell.Container.getUser ? sap.ushell.Container.getUser().getId() : "USER";
                    let applicationIdCounter = 1;

                    const namePattern = /^[A-Za-z\s]+$/;
                    const psNumberPattern = /^\d{9}$/;

                    if (!headers.includes("APPLICATIONID")) {
                        headers.push("APPLICATIONID");
                    }
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const values = line.split(",");
                            const record = {};
                            record.INVALID_FIELDS = {};
                            headers.forEach((header, index) => {
                                if (header !== "APPLICATIONID") {
                                    record[header] = values[index] ? values[index].trim() : "";
                                }
                            });

                            let isValid = true;

                            [
                                "CONTRACTEXTENSION",
                                "PAYRATECHANGE",
                                "VMOHEADFLAG",
                                "VMOTEAMFLAG"
                            ].forEach(field => {
                                if (field in record) {
                                    record[field] = yesNoToBoolean(record[field]);
                                }
                            });

                            [
                                "CONTRACTEXTENSION",
                                "PAYRATECHANGE",
                                "VMOHEADFLAG",
                                "VMOTEAMFLAG"
                            ].forEach(field => {
                                if (record[field] !== true && record[field] !== false && record[field] !== "" && record[field] !== undefined) {
                                    isValid = false;
                                    record.INVALID_FIELDS[field] = true;
                                    record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid boolean value for ${field}`;
                                }
                            });

                            [
                                "DATEOFJOINING", 
                                "CURRENTCONTRACTENDDATE", 
                                "CONTRACTENDDATE", 
                                "CONTRACTEXTENSIONSTARTDATE", 
                                "CONTRACTEXTENSIONENDDATE", 
                                "SUBMITTEDDATE", 
                                "MODIFIEDDATE"
                            ].forEach(field => {
                                if (record[field]) {
                                    record[field] = convertToISO(record[field]);
                                    if (!isValidISODate(record[field])) {
                                        isValid = false;
                                        record.INVALID_FIELDS[field] = true;
                                        record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Invalid date for ${field}`;
                                    }
                                } else {
                                    // For empty date fields, mark as invalid for display but let backend see null
                                    record[field] = "";
                                    record.INVALID_FIELDS[field] = true;
                                    isValid = false;
                                    record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + `Missing value for ${field}`;
                                }
                            });

                            if (record.STATUS && record.STATUS.trim().toLowerCase() === "inactive") {
                                inactiveRecords.push(record);
                                isValid = false;
                            }
                            if (!record.EMPLOYEENAME || !namePattern.test(record.EMPLOYEENAME)) {
                                isValid = false;
                                record.INVALID_FIELDS.EMPLOYEENAME = true;
                                record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid employee name";
                            }
                            if (!record.PSNUMBER || !psNumberPattern.test(record.PSNUMBER)) {
                                isValid = false;
                                record.INVALID_FIELDS.PSNUMBER = true;
                                record.ERROR_REASON = (record.ERROR_REASON ? record.ERROR_REASON + "; " : "") + "Invalid PSNUMBER";
                            }

                            // --- Generate a unique APPLICATIONID for every upload ---
                            record.APPLICATIONID = generateApplicationId(prefix, year, userId, applicationIdCounter);
                            applicationIdCounter++;
                            // -------------------------------------------------------

                            record._isValid = isValid;
                            allRecords.push(record);

                            if (!isValid) {
                                invalidRecords.push(record);
                            }
                        }
                    }

                    this._allRecords = allRecords;
                    this._headers = headers;

                    const oView = this.getView();
                    oView.setModel(new JSONModel({ employees: allRecords }));

                    sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: invalidRecords }), "invalidModel");
                    sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: inactiveRecords }), "inactiveModel");

                    var oUIModel = oView.getModel("ui");
                    oUIModel.setProperty("/hasInvalidEmployees", invalidRecords.length > 0);
                    oUIModel.setProperty("/hasInactiveEmployees", inactiveRecords.length > 0);
                    oUIModel.setProperty("/currentPage", 1);
                    var pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
                    oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / pageSize) || 1);

                    const countYes = allRecords.filter(
                        r => r.CONTRACTEXTENSION === true
                    ).length;
                    const countNo = allRecords.filter(
                        r => r.CONTRACTEXTENSION === false
                    ).length;
                    oUIModel.setProperty("/hasContractExtensionYes", countYes > 0);
                    oUIModel.setProperty("/hasContractExtensionNo", countNo > 0);

                    oUIModel.setProperty("/isUploaded", true);

                    this._showPage(1);

                    if (invalidRecords.length > 0) {
                        MessageBox.warning("Some records are invalid. Please verify or download them.");
                    } else {
                        MessageToast.show("File uploaded and all records displayed!");
                    }

                    let validRecords = allRecords.filter(r =>
                        r._isValid &&
                        (!r.STATUS || r.STATUS.trim().toLowerCase() !== "inactive")
                    );

                    validRecords = deduplicateByPSNUMBER(validRecords);

                    // Sanitize dates before upload
                    const dateFields = [
                        "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
                        "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
                        "SUBMITTEDDATE", "MODIFIEDDATE"
                    ];
                    validRecords.forEach(function(rec) {
                        sanitizeDatesToNull(rec, dateFields);
                    });

                    if (validRecords.length > 0) {
                        const mainModel = this.getView().getModel("mainModel");
                        if (mainModel) {
                            mainModel.callFunction("/bulkUpload", {
                                method: "POST",
                                urlParameters: {
                                    jsonData: JSON.stringify(validRecords)
                                },
                                success: () => {
                                    MessageToast.show("Valid records uploaded successfully.");
                                },
                                error: (error) => {
                                    console.log("Upload error:", error);
                                    MessageToast.show("Upload to backend failed.");
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

        _showPage: function (page) {
            const oView = this.getView();
            const allRecords = this._allRecords || [];
            const headers = this._headers || [];
            const oUIModel = oView.getModel("ui");
            const pageSize = oUIModel.getProperty("/pageSize") || DEFAULT_PAGE_SIZE;
            const totalPages = Math.ceil(allRecords.length / pageSize) || 1;
            const currentPage = Math.min(Math.max(page, 1), totalPages);

            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageRecords = allRecords.slice(start, end);

            const oTable = oView.byId("dataTable");
            oTable.removeAllColumns();
            oTable.removeAllItems();

            headers.forEach(header => {
                oTable.addColumn(new Column({
                    header: new Text({ text: header }),
                    width: "200px"
                }));
            });

            pageRecords.forEach(row => {
                const cells = headers.map(header => {
                    const textValue = row[header] !== undefined ? String(row[header]) : "";
                    if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
                        return new Text({ text: textValue }).addStyleClass("invalidCell");
                    } else {
                        return new Text({ text: textValue });
                    }
                });
                const oItem = new ColumnListItem({ cells });
                oTable.addItem(oItem);
            });

            oTable.setVisible(true);
            oView.byId("saveButton").setVisible(true);

            oUIModel.setProperty("/currentPage", currentPage);
            oUIModel.setProperty("/totalPages", totalPages);

            this._updatePaginationBar();
        },

        _updatePaginationBar: function () {
            const oView = this.getView();
            const paginationBar = oView.byId("paginationBar");
            const pageNumbersBox = oView.byId("pageNumbers");
            const oUIModel = oView.getModel("ui");
            const currentPage = oUIModel.getProperty("/currentPage");
            const totalPages = oUIModel.getProperty("/totalPages");
            const allRecords = this._allRecords || [];

            paginationBar.setVisible(totalPages > 1 && allRecords.length > 0);
            pageNumbersBox.removeAllItems();

            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + 4);
            if (end - start < 4) {
                start = Math.max(1, end - 4);
            }
            for (let i = start; i <= end; i++) {
                pageNumbersBox.addItem(new Button({
                    text: i.toString(),
                    type: i === currentPage ? "Emphasized" : "Transparent",
                    press: this.onPageSelect.bind(this, i),
                    styleClass: i === currentPage ? "activePageButton" : ""
                }));
            }

            oView.byId("btnPrev").setEnabled(currentPage > 1);
            oView.byId("btnNext").setEnabled(currentPage < totalPages);
        },

        onRowCountChange: function (oEvent) {
            var oUIModel = this.getView().getModel("ui");
            var newPageSize = parseInt(oEvent.getParameter("selectedItem").getKey(), 10) || DEFAULT_PAGE_SIZE;
            oUIModel.setProperty("/pageSize", newPageSize);

            var allRecords = this._allRecords || [];
            oUIModel.setProperty("/totalPages", Math.ceil(allRecords.length / newPageSize) || 1);
            oUIModel.setProperty("/currentPage", 1);
            this._showPage(1);
        },

        onPrevPage: function () {
            const oUIModel = this.getView().getModel("ui");
            let page = oUIModel.getProperty("/currentPage");
            if (page > 1) this._showPage(page - 1);
        },

        onNextPage: function () {
            const oUIModel = this.getView().getModel("ui");
            let page = oUIModel.getProperty("/currentPage");
            let total = oUIModel.getProperty("/totalPages");
            if (page < total) this._showPage(page + 1);
        },

        onPageSelect: function (page) {
            this._showPage(page);
        },

        onopeninvalidrecords: function () {
            var oView = this.getView();
            var oDialog = oView.byId("invalidRecordsDialog");
            var oTable = oView.byId("invalidRecordsTable");
            var invalidModel = sap.ui.getCore().getModel("invalidModel");
            var invalidData = invalidModel ? invalidModel.getProperty("/invalidEmployees") : [];
        
            oTable.removeAllColumns();
            oTable.removeAllItems();
        
            if (invalidData && invalidData.length > 0) {
                var headers = Object.keys(invalidData[0]).filter(h => h !== "_isValid");
                headers.forEach(header => {
                    oTable.addColumn(new sap.m.Column({
                        header: new sap.m.Text({ text: header }),
                        width: "150px"
                    }));
                });
                invalidData.forEach(row => {
                    var cells = headers.map(header => {
                        const textValue = row[header] !== undefined ? String(row[header]) : "";
                        if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
                            return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
                        } else {
                            return new sap.m.Text({ text: textValue });
                        }
                    });
                    var oItem = new sap.m.ColumnListItem({ cells });
                    oTable.addItem(oItem);
                });
            }
            oDialog.open();
        },
        
        onCloseInvalidDialog: function () {
            this.getView().byId("invalidRecordsDialog").close();
        },

        onShowInactiveRecords: function () {
            const oView = this.getView();
            const oDialog = oView.byId("inactiveRecordsDialog");
            const oTable = oView.byId("inactiveRecordsTable");
            const inactiveModel = sap.ui.getCore().getModel("inactiveModel");
            const inactiveData = inactiveModel ? inactiveModel.getProperty("/inactiveEmployees") : [];
        
            oTable.removeAllColumns();
            oTable.removeAllItems();
        
            if (!inactiveData || inactiveData.length === 0) {
                sap.m.MessageToast.show("No inactive records available.");
                return;
            }
        
            var headers = Object.keys(inactiveData[0]).filter(h => h !== "_isValid");
            headers.forEach(header => {
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({ text: header }),
                    width: "150px"
                }));
            });
            inactiveData.forEach(row => {
                var cells = headers.map(header => new sap.m.Text({ text: row[header] !== undefined ? String(row[header]) : "" }));
                var oItem = new sap.m.ColumnListItem({ cells });
                oTable.addItem(oItem);
            });
            oDialog.open();
        },
        
        onCloseInactiveDialog: function () {
            this.getView().byId("inactiveRecordsDialog").close();
        },

        onClear: function () {
            this.getView().setModel(new JSONModel({ employees: [] }));
            var oUIModel = this.getView().getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/hasInvalidEmployees", false);
                oUIModel.setProperty("/hasInactiveEmployees", false);
                oUIModel.setProperty("/hasContractExtensionYes", false);
                oUIModel.setProperty("/hasContractExtensionNo", false);
                oUIModel.setProperty("/currentPage", 1);
                oUIModel.setProperty("/totalPages", 1);
                oUIModel.setProperty("/isUploaded", false);
                oUIModel.setProperty("/pageSize", DEFAULT_PAGE_SIZE);
            }
            sap.ui.getCore().setModel(new JSONModel({ invalidEmployees: [] }), "invalidModel");
            sap.ui.getCore().setModel(new JSONModel({ inactiveEmployees: [] }), "inactiveModel");
            var oTable = this.getView().byId("dataTable");
            if (oTable) {
                oTable.removeAllColumns();
                oTable.removeAllItems();
                oTable.setVisible(false);
            }
            var oSaveBtn = this.getView().byId("saveButton");
            if (oSaveBtn) {
                oSaveBtn.setVisible(false);
            }
            var paginationBar = this.getView().byId("paginationBar");
            if (paginationBar) {
                paginationBar.setVisible(false);
            }
            var oFileUploader = this.getView().byId("yourFileUploaderId");
            if (oFileUploader) {
                oFileUploader.clear();
            }
            this._allRecords = [];
            this._headers = [];
            sap.m.MessageToast.show("Table and data cleared.");
        },

        onShowContractExtensionDialog: function () {
            const oView = this.getView();
            const oDialog = oView.byId("contractExtensionDialog");
            const oSelect = oView.byId("contractExtensionSelect");
            if (oSelect) {
                oSelect.setSelectedKey("yes");
            }
            this.onShowContractExtensionFiltered("yes");
            oDialog.open();
        },
        
        onShowContractExtensionFiltered: function (value) {
            const allRecords = this._allRecords || [];
            const headers = this._headers || [];
            const filterVal = value === "yes" ? true : false;
            const filtered = allRecords.filter(
                r => r.CONTRACTEXTENSION === filterVal
            );
            const oView = this.getView();
            const oTable = oView.byId("contractExtensionTable");
            oTable.removeAllColumns();
            oTable.removeAllItems();
            headers.forEach(header => {
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Text({ text: header }),
                    width: "150px"
                }));
            });
            filtered.forEach(row => {
                const cells = headers.map(header => {
                    const textValue = row[header] !== undefined ? String(row[header]) : "";
                    if (row.INVALID_FIELDS && row.INVALID_FIELDS[header]) {
                        return new sap.m.Text({ text: textValue }).addStyleClass("invalidCell");
                    } else {
                        return new sap.m.Text({ text: textValue });
                    }
                });
                const oItem = new sap.m.ColumnListItem({ cells });
                oTable.addItem(oItem);
            });
        
            const oDialog = oView.byId("contractExtensionDialog");
            oDialog.setTitle("Contract Extension: " + (value === "yes" ? "Yes" : "No"));
        
            var oUIModel = oView.getModel("ui");
            if (oUIModel) {
                oUIModel.setProperty("/contractExtensionFilter", value);
            }
        },
        
        onContractExtensionSelectChange: function (oEvent) {
            const value = oEvent.getParameter("selectedItem").getKey();
            this.onShowContractExtensionFiltered(value);
        },
        
        onCloseContractExtensionDialog: function () {
            this.getView().byId("contractExtensionDialog").close();
        },

        onSaveInvalidRecords: async function() {
            var invalidRecords = sap.ui.getCore().getModel("invalidModel").getProperty("/invalidEmployees") || [];
            if (!invalidRecords.length) {
                sap.m.MessageToast.show("No invalid records to save.");
                return;
            }
            var cleanRecords = invalidRecords.map(function(rec) {
                var copy = Object.assign({}, rec);
                delete copy._isValid;
                delete copy.INVALID_FIELDS;
                if (!copy.ERROR_REASON) copy.ERROR_REASON = "Validation failed";
                return copy;
            });

            // Set empty date strings to null for backend
            const dateFields = [
                "DATEOFJOINING", "CURRENTCONTRACTENDDATE", "CONTRACTENDDATE",
                "CONTRACTEXTENSIONSTARTDATE", "CONTRACTEXTENSIONENDDATE",
                "SUBMITTEDDATE", "MODIFIEDDATE"
            ];
            cleanRecords.forEach(function(rec) {
                sanitizeDatesToNull(rec, dateFields);
            });

            ["CONTRACTEXTENSION","PAYRATECHANGE","VMOHEADFLAG","VMOTEAMFLAG"].forEach(function(field){
                cleanRecords.forEach(function(rec){
                    if (field in rec)
                        rec[field] = yesNoToBoolean(rec[field]);
                });
            });

            var oModel = this.getView().getModel("mainModel");
            if (!oModel) {
                sap.m.MessageToast.show("Main model not found.");
                return;
            }

            // --- Fetch existing records and filter duplicates before saving ---
            var entitySet = "/InvalidEmployees"; // <-- UPDATE to your OData entityset if needed
            var idField = "APPLICATIONID";       // <-- UPDATE to your unique field if needed
            let existingIds;
            try {
                existingIds = await fetchExistingIds(oModel, entitySet, idField);
            } catch (error) {
                sap.m.MessageToast.show("Could not fetch existing invalid records. Save aborted.");
                return;
            }
            var recordsToSave = cleanRecords.filter(function(rec) {
                return rec[idField] && !existingIds.has(rec[idField]);
            });
            if (!recordsToSave.length) {
                sap.m.MessageToast.show("No new invalid records to save (all exist already).");
                return;
            }

            oModel.create("/saveInvalidEmployees", { records: recordsToSave }, {
                success: function() {
                    sap.m.MessageToast.show("Invalid records saved to backend.");
                },
                error: function(oError) {
                    let errMsg = "Failed to save invalid records.";
                    if (oError && oError.responseText) {
                        try {
                            const resp = JSON.parse(oError.responseText);
                            if (resp.error && resp.error.message && resp.error.message.value) {
                                errMsg = resp.error.message.value;
                            }
                        } catch (e) {}
                    }
                    sap.m.MessageToast.show(errMsg);
                    console.error(oError);
                }
            });
        }
    });
});