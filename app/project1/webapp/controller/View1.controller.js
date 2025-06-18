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

            if (file && window.FileReader) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const csv = e.target.result;
                    const lines = csv.split("\n");
                    const headers = lines[0].trim().split(",");
                    const result = [];

                    let invalidName = false;
                    let invalidEmail = false;
                    let invalidPhone = false;

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            const values = line.split(",");
                            const record = {};
                            headers.forEach((header, index) => {
                                record[header] = values[index];
                            });

                            // Name validation
                            const name = record["Name"];
                            if (name && /\d/.test(name)) {
                                invalidName = true;
                            }

                            // Email validation
                            const email = record["Email"];
                            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (email && !emailPattern.test(email)) {
                                invalidEmail = true;
                            }

                            // Phone validation
                            const phone = record["Phone"];
                            const phoneStr = String(phone).padStart(10, "0");
                            const phonePattern = /^\d{10}$/;
                            if (!phonePattern.test(phoneStr)) {
                                invalidPhone = true;
                            }
                            record["Phone"] = phoneStr;

                            // JoiningDate format conversion (DD-MM-YYYY to YYYY-MM-DD)
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

                            result.push(record);
                        }
                    }

                    const oModel = new JSONModel({ employees: result });
                    const mainModel = this.getView().getModel("mainModel");
                    console.log("result",result);
                    mainModel.callFunction("/bulkUpload",{
                        method:"POST",
                        urlParameters:{
                            jsonData: JSON.stringify(result)
                        },
                        success:(data)=>{
                            MessageToast.show("Failed to fetch CSV for download.");
                        },
                        error:(error)=>{
                            console.log("error Data :",error);
                        }
                    })

                    const oView = this.getView();
                    oView.setModel(oModel);

                    const oTable = oView.byId("dataTable");
                    oTable.removeAllColumns();
                    oTable.removeAllItems();

                    headers.forEach(header => {
                        oTable.addColumn(new Column({
                            header: new Text({ text: header }),
                            width: "200px"
                        }));
                    });

                    result.forEach(row => {
                        const cells = headers.map(header => new Text({ text: row[header] }));
                        oTable.addItem(new ColumnListItem({ cells }));
                    });

                    oTable.setVisible(true);
                    oView.byId("saveButton").setVisible(true);

                    if (invalidName || invalidEmail || invalidPhone) {
                        let message = "Please correct the following:\n";
                        if (invalidName) message += "- Name should contain only characters.\n";
                        if (invalidEmail) message += "- Email format is invalid.\n";
                        if (invalidPhone) message += "- Phone number must be 10 digits.\n";
                        MessageBox.warning(message);
                    } else {
                        MessageToast.show("File uploaded and table updated!");
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
            
            const data = oModel.getProperty("/employees");
            console.log("data",data);
            
            // $.ajax({
            //     url: "/odata/v4/ecommerce/saveUploadedEmployees",
            //     method: "POST",
            //     contentType: "application/json",
            //     data: JSON.stringify({ input: data }),
            //     success: (response) => {
            //         const message = response?.message || "Employees saved successfully.";
            //         MessageToast.show(message);
            //         this.refreshTable();
            //     },
            //     error: (error) => {
            //         console.error("Error saving employees:", error.responseText);
            //         MessageBox.error("Failed to save employees.");
            //     }
            // });
        }
        
    });
});
