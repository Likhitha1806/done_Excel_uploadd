// sap.ui.define([
//   "sap/ui/core/mvc/Controller"
// ], function (Controller) {
//   "use strict";
 
//   return Controller.extend("project1.controller.InvalidRecords", {
//     onInit: function () {
//       const invalidModel = sap.ui.getCore().getModel("invalidModel");
//       if (invalidModel) {
//         this.getView().setModel(invalidModel);
//       } else {
//         console.warn("Invalid model not found.");
//       }
//     },
//     onExport: function () {
//       var aCols, aData, oSettings, oSheet;
    
//       // Define columns
//       aCols = [
//         { label: "Name", property: "Name", type: "string" },
//         { label: "Email", property: "Email", type: "string" },
//         { label: "Phone", property: "Phone", type: "string" },
//         { label: "Joining Date", property: "JoiningDate", type: "string" }
//       ];
    
//       // Get data from model
//       aData = this.getView().getModel().getProperty("/invalidEmployees");
    
//       // Spreadsheet settings
//       oSettings = {
//         workbook: { columns: aCols },
//         dataSource: aData,
//         fileName: "Invalid_Records.xlsx",
//         worker: false // true for large data sets
//       };
    
//       // Create and build spreadsheet
//       oSheet = new sap.ui.export.Spreadsheet(oSettings);
//       oSheet.build()
//         .then(function () {
//           sap.m.MessageToast.show("Excel file has been downloaded");
//         })
//         .catch(function (err) {
//           console.error("Export failed: ", err);
//         });
//     }
    
//   });
// });
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/export/Spreadsheet",
  "sap/m/MessageToast"
], function (Controller, Spreadsheet, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.InvalidRecords", {
    onInit: function () {
      const invalidModel = sap.ui.getCore().getModel("invalidModel");
      if (invalidModel) {
        this.getView().setModel(invalidModel);
      } else {
        console.warn("Invalid model not found.");
      }
    },

    onExport: function () {
      // Define columns
      const aCols = [
        { label: "Name", property: "Name", type: "string" },
        { label: "Email", property: "Email", type: "string" },
        { label: "Phone", property: "Phone", type: "string" },
        { label: "Joining Date", property: "JoiningDate", type: "string" }
      ];

      // Get data from model
      const aData = this.getView().getModel().getProperty("/invalidEmployees");

      if (!aData || aData.length === 0) {
        MessageToast.show("No data available to export.");
        return;
      }

      // Spreadsheet settings
      const oSettings = {
        workbook: { columns: aCols },
        dataSource: aData,
        fileName: "Invalid_Records.xlsx",
        worker: false
      };

      // Create and build spreadsheet
      const oSheet = new Spreadsheet(oSettings);
      oSheet.build()
        .then(function () {
          MessageToast.show("Excel file has been downloaded");
        })
        .catch(function (err) {
          console.error("Export failed: ", err);
        });
    },
    
  });
});
