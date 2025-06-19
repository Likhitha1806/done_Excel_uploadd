// // // sap.ui.define([
// // //     "sap/ui/core/mvc/Controller",
// // //     "sap/ui/model/json/JSONModel",
// // //     "sap/m/MessageToast",
// // //     "sap/m/MessageBox",
// // //     "sap/m/Column",
// // //     "sap/m/Text",
// // //     "sap/m/ColumnListItem"
// // // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem) {
// // //     "use strict";

// // //     return Controller.extend("project1.controller.View1", {
// // //         onInit: function () {},

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

// // //             if (file && window.FileReader) {
// // //                 const reader = new FileReader();

// // //                 reader.onload = (e) => {
// // //                     const csv = e.target.result;
// // //                     const lines = csv.split("\n");
// // //                     const headers = lines[0].trim().split(",");
// // //                     const result = [];

// // //                     let invalidName = false;
// // //                     let invalidEmail = false;
// // //                     let invalidPhone = false;

// // //                     for (let i = 1; i < lines.length; i++) {
// // //                         const line = lines[i].trim();
// // //                         if (line) {
// // //                             const values = line.split(",");
// // //                             const record = {};
// // //                             headers.forEach((header, index) => {
// // //                                 record[header] = values[index];
// // //                             });

// // //                             // Name validation
// // //                             const name = record["Name"];
// // //                             if (name && /\d/.test(name)) {
// // //                                 invalidName = true;
// // //                             }

// // //                             // Email validation
// // //                             const email = record["Email"];
// // //                             const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// // //                             if (email && !emailPattern.test(email)) {
// // //                                 invalidEmail = true;
// // //                             }

// // //                             // Phone validation
// // //                             const phone = record["Phone"];
// // //                             const phoneStr = String(phone).padStart(10, "0");
// // //                             const phonePattern = /^\d{10}$/;
// // //                             if (!phonePattern.test(phoneStr)) {
// // //                                 invalidPhone = true;
// // //                             }
// // //                             record["Phone"] = phoneStr;

// // //                             // JoiningDate format conversion (DD-MM-YYYY to YYYY-MM-DD)
// // //                             const joiningDate = record["JoiningDate"];
// // //                             const dateParts = joiningDate.split("-");
// // //                             if (dateParts.length === 3) {
// // //                                 const [day, month, year] = dateParts;
// // //                                 if (day.length === 2 && month.length === 2 && year.length === 4) {
// // //                                     record["JoiningDate"] = `${year}-${month}-${day}`;
// // //                                 } else {
// // //                                     record["JoiningDate"] = null;
// // //                                 }
// // //                             }

// // //                             result.push(record);
// // //                         }
// // //                     }

// // //                     const oModel = new JSONModel({ employees: result });
// // //                     const mainModel = this.getView().getModel("mainModel");
// // //                     console.log("result",result);
// // //                     mainModel.callFunction("/bulkUpload",{
// // //                         method:"POST",
// // //                         urlParameters:{
// // //                             jsonData: JSON.stringify(result)
// // //                         },
// // //                         success:(data)=>{
// // //                             MessageToast.show("Failed to fetch CSV for download.");
// // //                         },
// // //                         error:(error)=>{
// // //                             console.log("error Data :",error);
// // //                         }
// // //                     })

// // //                     const oView = this.getView();
// // //                     oView.setModel(oModel);

// // //                     const oTable = oView.byId("dataTable");
// // //                     oTable.removeAllColumns();
// // //                     oTable.removeAllItems();

// // //                     headers.forEach(header => {
// // //                         oTable.addColumn(new Column({
// // //                             header: new Text({ text: header }),
// // //                             width: "200px"
// // //                         }));
// // //                     });

// // //                     result.forEach(row => {
// // //                         const cells = headers.map(header => new Text({ text: row[header] }));
// // //                         oTable.addItem(new ColumnListItem({ cells }));
// // //                     });

// // //                     oTable.setVisible(true);
// // //                     oView.byId("saveButton").setVisible(true);

// // //                     if (invalidName || invalidEmail || invalidPhone) {
// // //                         let message = "Please correct the following:\n";
// // //                         if (invalidName) message += "- Name should contain only characters.\n";
// // //                         if (invalidEmail) message += "- Email format is invalid.\n";
// // //                         if (invalidPhone) message += "- Phone number must be 10 digits.\n";
// // //                         MessageBox.warning(message);
// // //                     } else {
// // //                         MessageToast.show("File uploaded and table updated!");
// // //                     }
// // //                 };

// // //                 reader.readAsText(file);
// // //             } else {
// // //                 MessageToast.show("This browser does not support file reading.");
// // //             }
// // //         },

// // //         refreshTable: function () {
// // //             $.ajax({
// // //                 url: "/odata/v4/ecommerce/Employees",
// // //                 method: "GET",
// // //                 success: (data) => {
// // //                     console.log("Data fetched:", data);
// // //                     MessageToast.show("Data refreshed successfully.");
// // //                 },
// // //                 error: (error) => {
// // //                     console.error("Refresh error:", error);
// // //                     MessageBox.error("Failed to refresh data.");
// // //                 }
// // //             });
// // //         },
        
       
// // //         onSave: function () {
            
// // //             const data = oModel.getProperty("/employees");
// // //             console.log("data",data);
            
           
// // //         },
// // //     });
// // // });
// // sap.ui.define([
// //     "sap/ui/core/mvc/Controller",
// //     "sap/ui/model/json/JSONModel",
// //     "sap/m/MessageToast",
// //     "sap/m/MessageBox",
// //     "sap/m/Column",
// //     "sap/m/Text",
// //     "sap/m/ColumnListItem"
// // ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem) {
// //     "use strict";

// //     return Controller.extend("project1.controller.View1", {
// //         onInit: function () {
// //             this._oModel = new JSONModel();
// //             this.getView().setModel(this._oModel, "mainModel");
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

// //             if (file && window.FileReader) {
// //                 const reader = new FileReader();

// //                 reader.onload = (e) => {
// //                     const csv = e.target.result;
// //                     const lines = csv.split("\n");
// //                     const headers = lines[0].trim().split(",");
// //                     const result = [];

// //                     for (let i = 1; i < lines.length; i++) {
// //                         const line = lines[i].trim();
// //                         if (line) {
// //                             const values = line.split(",");
// //                             const record = {};
// //                             headers.forEach((header, index) => {
// //                                 record[header] = values[index];
// //                             });

// //                             // Format phone
// //                             record["Phone"] = String(record["Phone"]).padStart(10, "0");

// //                             // Format date
// //                             const joiningDate = record["JoiningDate"];
// //                             const dateParts = joiningDate?.split("-");
// //                             if (dateParts?.length === 3) {
// //                                 const [day, month, year] = dateParts;
// //                                 record["JoiningDate"] = `${year}-${month}-${day}`;
// //                             }

// //                             result.push(record);
// //                         }
// //                     }

// //                     this._oModel.setProperty("/employees", result);

// //                     const oTable = this.getView().byId("dataTable");
// //                     oTable.removeAllColumns();
// //                     oTable.removeAllItems();

// //                     headers.forEach(header => {
// //                         oTable.addColumn(new Column({
// //                             header: new Text({ text: header }),
// //                             width: "200px"
// //                         }));
// //                     });

// //                     result.forEach(row => {
// //                         const cells = headers.map(header => new Text({ text: row[header] }));
// //                         oTable.addItem(new ColumnListItem({ cells }));
// //                     });

// //                     oTable.setVisible(true);
// //                     this.getView().byId("saveButton").setVisible(true);
// //                 };

// //                 reader.readAsText(file);
// //             } else {
// //                 MessageToast.show("This browser does not support file reading.");
// //             }
// //         },

// //         onSave: function () {
// //             const data = this._oModel.getProperty("/employees");

// //             if (!data || data.length === 0) {
// //                 MessageToast.show("No data to upload.");
// //                 return;
// //             }

// //             const mainModel = this.getView().getModel("mainModel");

// //             mainModel.callFunction("/bulkUpload", {
// //                 method: "POST",
// //                 urlParameters: {
// //                     jsonData: JSON.stringify(data)
// //                 },
// //                 success: (result) => {
// //                     MessageToast.show(result.message);

// //                     if (result.downloadInvalidRecords) {
// //                         this.downloadLink = result.downloadInvalidRecords;
// //                         this.getView().byId("downloadBtn").setVisible(true);
// //                     }
// //                 },
// //                 error: (error) => {
// //                     console.error("Upload error:", error);
// //                     MessageBox.error("Upload failed.");
// //                 }
// //             });
            
// //         },
// //         onopeninvalidrecords: function () {
// //             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
// //             oRouter.navTo("invalidrecords");
// //         },
        

// //         onDownloadPress: function () {
// //             if (this.downloadLink) {
// //                 window.open(this.downloadLink, "_blank");
            
// // } else {
// //  sap.m.MessageToast.show("No file available to download.");
// //   }
    
// //         },

// //         refreshTable: function () {
// //             $.ajax({
// //                 url: "/odata/v4/ecommerce/Employees",
// //                 method: "GET",
// //                 success: (data) => {
// //                     console.log("Data fetched:", data);
// //                     MessageToast.show("Data refreshed successfully.");
// //                 },
// //                 error: (error) => {
// //                     console.error("Refresh error:", error);
// //                     MessageBox.error("Failed to refresh data.");
// //                 }
// //             });
// //         }
// //     });
// // });


// sap.ui.define([
//         "sap/ui/core/mvc/Controller",
//         "sap/ui/model/json/JSONModel",
//         "sap/m/MessageToast",
//         "sap/m/MessageBox",
//         "sap/m/Column",
//         "sap/m/Text",
//         "sap/m/ColumnListItem"
//     ], function (Controller, JSONModel, MessageToast, MessageBox, Column, Text, ColumnListItem) {
//         "use strict";
     
//         return Controller.extend("project1.controller.View1", {
//             onInit: function () {},
     
//             onDownloadTemplate: function () {
//                 $.ajax({
//                     url: "model/Template.csv",
//                     dataType: "text",
//                     success: (data) => {
//                         const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(data);
//                         const link = document.createElement("a");
//                         link.setAttribute("href", encodedUri);
//                         link.setAttribute("download", "Template.csv");
//                         document.body.appendChild(link);
//                         link.click();
//                         document.body.removeChild(link);
//                         MessageToast.show("Template downloaded!");
//                     },
//                     error: () => {
//                         MessageToast.show("Failed to fetch CSV for download.");
//                     }
//                 });
//             },
     
//             onFileChange: function (oEvent) {
//                 const file = oEvent.getParameter("files")[0];
     
//                 if (file && window.FileReader) {
//                     const reader = new FileReader();
     
//                     reader.onload = (e) => {
//                         const csv = e.target.result;
//                         const lines = csv.split("\n");
//                         const headers = lines[0].trim().split(",");
//                         const validRecords = [];
//                         const invalidRecords = [];
     
//                         for (let i = 1; i < lines.length; i++) {
//                             const line = lines[i].trim();
//                             if (line) {
//                                 const values = line.split(",");
//                                 const record = {};
//                                 headers.forEach((header, index) => {
//                                     record[header] = values[index];
//                                 });
     
//                                 let isValid = true;
     
//                                 const name = record["Name"];
//                                 if (name && /\d/.test(name)) isValid = false;
     
//                                 const email = record["Email"];
//                                 const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//                                 if (email && !emailPattern.test(email)) isValid = false;
     
//                                 const phone = record["Phone"];
//                                 const phoneStr = String(phone).padStart(10, "0");
//                                 const phonePattern = /^\d{10}$/;
//                                 if (!phonePattern.test(phoneStr)) isValid = false;
//                                 record["Phone"] = phoneStr;
     
//                                 const joiningDate = record["JoiningDate"];
//                                 const dateParts = joiningDate.split("-");
//                                 if (dateParts.length === 3) {
//                                     const [day, month, year] = dateParts;
//                                     if (day.length === 2 && month.length === 2 && year.length === 4) {
//                                         record["JoiningDate"] = `${year}-${month}-${day}`;
//                                     } else {
//                                         record["JoiningDate"] = null;
//                                     }
//                                 }
     
//                                 if (isValid) {
//                                     validRecords.push(record);
//                                 } else {
//                                     invalidRecords.push(record);
//                                 }
//                             }
//                         }
     
//                         const validModel = new JSONModel({ employees: validRecords });
//                         const invalidModel = new JSONModel({ InvalidEmployees: invalidRecords });
     
//                         this.getView().setModel(validModel, "mainModel");
//                         sap.ui.getCore().setModel(invalidModel, "invalidModel");
     
//                         const mainModel = this.getView().getModel("mainModel");
//                         mainModel.callFunction("/bulkUpload", {
//                             method: "POST",
//                             urlParameters: {
//                                 jsonData: JSON.stringify(validRecords)
//                             },
//                             success: () => {
//                                 MessageToast.show("Valid records uploaded successfully.");
//                             },
//                             error: (error) => {
//                                 console.log("Upload error:", error);
//                             }
//                         });
     
//                         const oTable = this.getView().byId("dataTable");
//                         oTable.removeAllColumns();
//                         oTable.removeAllItems();
     
//                         headers.forEach(header => {
//                             oTable.addColumn(new Column({
//                                 header: new Text({ text: header }),
//                                 width: "200px"
//                             }));
//                         });
     
//                         validRecords.forEach(row => {
//                             const cells = headers.map(header => new Text({ text: row[header] }));
//                             oTable.addItem(new ColumnListItem({ cells }));
//                         });
     
//                         oTable.setVisible(true);
//                         this.getView().byId("saveButton").setVisible(true);
     
//                         if (invalidRecords.length > 0) {
//                             MessageBox.warning("Some records are invalid. Click XYZ to view them.");
//                         } else {
//                             MessageToast.show("All records are valid and uploaded.");
//                         }
//                     };
     
//                     reader.readAsText(file);
//                 } else {
//                     MessageToast.show("This browser does not support file reading.");
//                 }
//             },
     
//             onSave: function () {
//                 const data = this.getView().getModel("mainModel").getProperty("/employees");
//                 console.log("Saving data:", data);
//             },
     
//             onopeninvalidrecords: function () {
//                             var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//                             oRouter.navTo("invalidrecords");
//                         },
//         });
//     });
     
     
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
        onInit: function () {},
 
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
                    const lines = csv.split("\n");
                    const headers = lines[0].trim().split(",");
                    const validRecords = [];
                    const invalidRecords = [];
 
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const values = line.split(",");
                            const record = {};
                            headers.forEach((header, index) => {
                                record[header] = values[index];
                            });
 
                            let isValid = true;
 
                            // Name validation
                            const name = record["Name"];
                            if (name && /\d/.test(name)) {
                                isValid = false;
                            }
 
                            // Email validation
                            const email = record["Email"];
                            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (email && !emailPattern.test(email)) {
                                isValid = false;
                            }
 
                            // Phone validation
                            const phone = record["Phone"];
                            const phoneStr = String(phone).padStart(10, "0");
                            const phonePattern = /^\d{10}$/;
                            if (!phonePattern.test(phoneStr)) {
                                isValid = false;
                            }
                            record["Phone"] = phoneStr;
 
                            // JoiningDate format conversion
                            const joiningDate = record["JoiningDate"];
                            const dateParts = joiningDate.split("-");
                            if (dateParts.length === 3) {
                                const [day, month, year] = dateParts;
                                if (day.length === 2 && month.length === 2 && year.length === 4) {
                                    record["JoiningDate"] = `${year}-${month}-${day}`;
                                } else {
                                    record["JoiningDate"] = null;
                                }
                            }
 
                            if (isValid) {
                                validRecords.push(record);
                            } else {
                                invalidRecords.push(record);
                            }
                        }
                    }
 
                    const oView = this.getView();
                    const validModel = new JSONModel({ employees: validRecords });
                    const invalidModel = new JSONModel({ invalidEmployees: invalidRecords });
 
                    oView.setModel(validModel);
                    sap.ui.getCore().setModel(invalidModel, "invalidModel");
 
                    const oTable = oView.byId("dataTable");
                    oTable.removeAllColumns();
                    oTable.removeAllItems();
 
                    headers.forEach(header => {
                        oTable.addColumn(new Column({
                            header: new Text({ text: header }),
                            width: "200px"
                        }));
                    });
 
                    validRecords.forEach(row => {
                        const cells = headers.map(header => new Text({ text: row[header] }));
                        oTable.addItem(new ColumnListItem({ cells }));
                    });
 
                    oTable.setVisible(true);
                    oView.byId("saveButton").setVisible(true);
 
                    if (invalidRecords.length > 0) {
                        MessageBox.warning("Some records are invalid.Please verify");
                    } else {
                        MessageToast.show("File uploaded and table updated!");
                    }
 
                    // Upload valid records to SAP HANA
                    const mainModel = this.getView().getModel("mainModel");
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
                        }
                    });
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
                    console.log("Data fetched:", data);
                    MessageToast.show("Data refreshed successfully.");
                },
                error: (error) => {
                    console.error("Refresh error:", error);
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
         
            let csvContent = "Name,Email,Phone,JoiningDate\n";
            invalidData.forEach(record => {
                csvContent += `${record.Name},${record.Email},${record.Phone},${record.JoiningDate}\n`;
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
        },
       
        
        
    });
});
 
 