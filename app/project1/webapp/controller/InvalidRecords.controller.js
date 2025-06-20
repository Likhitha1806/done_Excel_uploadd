// // sap.ui.define([
// //   "sap/ui/core/mvc/Controller"
// // ], function (Controller) {
// //   "use strict";
 
// //   return Controller.extend("project1.controller.InvalidRecords", {
// //     onInit: function () {
// //       const invalidModel = sap.ui.getCore().getModel("invalidModel");
// //       if (invalidModel) {
// //         this.getView().setModel(invalidModel);
// //       } else {
// //         console.warn("Invalid model not found.");
// //       }
// //     },
// //     onExport: function () {
// //       var aCols, aData, oSettings, oSheet;
    
// //       // Define columns
// //       aCols = [
// //         { label: "Name", property: "Name", type: "string" },
// //         { label: "Email", property: "Email", type: "string" },
// //         { label: "Phone", property: "Phone", type: "string" },
// //         { label: "Joining Date", property: "JoiningDate", type: "string" }
// //       ];
    
// //       // Get data from model
// //       aData = this.getView().getModel().getProperty("/invalidEmployees");
    
// //       // Spreadsheet settings
// //       oSettings = {
// //         workbook: { columns: aCols },
// //         dataSource: aData,
// //         fileName: "Invalid_Records.xlsx",
// //         worker: false // true for large data sets
// //       };
    
// //       // Create and build spreadsheet
// //       oSheet = new sap.ui.export.Spreadsheet(oSettings);
// //       oSheet.build()
// //         .then(function () {
// //           sap.m.MessageToast.show("Excel file has been downloaded");
// //         })
// //         .catch(function (err) {
// //           console.error("Export failed: ", err);
// //         });
// //     }
    
// //   });
// // });
// sap.ui.define([
//   "sap/ui/core/mvc/Controller",
//   "sap/ui/export/Spreadsheet",
//   "sap/m/MessageToast"
// ], function (Controller, Spreadsheet, MessageToast) {
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
//       // Define columns
//       const aCols = [
//         { label: "Name", property: "Name", type: "string" },
//         { label: "Email", property: "Email", type: "string" },
//         { label: "Phone", property: "Phone", type: "string" },
//         { label: "Joining Date", property: "JoiningDate", type: "string" }
//       ];

//       // Get data from model
//       const aData = this.getView().getModel().getProperty("/invalidEmployees");

//       if (!aData || aData.length === 0) {
//         MessageToast.show("No data available to export.");
//         return;
//       }

//       // Spreadsheet settings
//       const oSettings = {
//         workbook: { columns: aCols },
//         dataSource: aData,
//         fileName: "Invalid_Records.xlsx",
//         worker: false
//       };

//       // Create and build spreadsheet
//       const oSheet = new Spreadsheet(oSettings);
//       oSheet.build()
//         .then(function () {
//           MessageToast.show("Excel file has been downloaded");
//         })
//         .catch(function (err) {
//           console.error("Export failed: ", err);
//         });
//     },
    
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
      // All columns from Employees entity
      const aCols = [
        { label: "APPLICATIONID", property: "APPLICATIONID", type: "string" },
        { label: "IRMPSNUMBER", property: "IRMPSNUMBER", type: "string" },
        { label: "IRMNAME", property: "IRMNAME", type: "string" },
        { label: "EMPLOYEENAME", property: "EMPLOYEENAME", type: "string" },
        { label: "PSNUMBER", property: "PSNUMBER", type: "string" },
        { label: "BASEBU", property: "BASEBU", type: "string" },
        { label: "BUCODE", property: "BUCODE", type: "string" },
        { label: "ALLOCATEDBU", property: "ALLOCATEDBU", type: "string" },
        { label: "LOCATION", property: "LOCATION", type: "string" },
        { label: "DATEOFJOINING", property: "DATEOFJOINING", type: "string" },
        { label: "CURRENTCONTRACTENDDATE", property: "CURRENTCONTRACTENDDATE", type: "string" },
        { label: "VENDORNAME", property: "VENDORNAME", type: "string" },
        { label: "CONTRACTEXTENSION", property: "CONTRACTEXTENSION", type: "boolean" },
        { label: "CONTRACTENDDATE", property: "CONTRACTENDDATE", type: "string" },
        { label: "CONTRACTEXTENSIONSTARTDATE", property: "CONTRACTEXTENSIONSTARTDATE", type: "string" },
        { label: "CONTRACTEXTENSIONENDDATE", property: "CONTRACTEXTENSIONENDDATE", type: "string" },
        { label: "CURRENTPAYRATE", property: "CURRENTPAYRATE", type: "number" },
        { label: "CURRENCY", property: "CURRENCY", type: "string" },
        { label: "FREQUENCY", property: "FREQUENCY", type: "string" },
        { label: "PAYRATECHANGE", property: "PAYRATECHANGE", type: "boolean" },
        { label: "NEWPAYRATE", property: "NEWPAYRATE", type: "number" },
        { label: "SKILLS", property: "SKILLS", type: "string" },
        { label: "PROJECTNAME", property: "PROJECTNAME", type: "string" },
        { label: "CLIENTNAME", property: "CLIENTNAME", type: "string" },
        { label: "NOTICEPERIOD", property: "NOTICEPERIOD", type: "string" },
        { label: "WORKINGDAYSNSHIFT", property: "WORKINGDAYSNSHIFT", type: "string" },
        { label: "OTHERALLOWANCES", property: "OTHERALLOWANCES", type: "string" },
        { label: "SPECIALTERMS", property: "SPECIALTERMS", type: "string" },
        { label: "STATUS", property: "STATUS", type: "string" },
        { label: "SUBMITTEDBY", property: "SUBMITTEDBY", type: "string" },
        { label: "MODIFIEDBY", property: "MODIFIEDBY", type: "string" },
        { label: "SUBMITTEDDATE", property: "SUBMITTEDDATE", type: "string" },
        { label: "MODIFIEDDATE", property: "MODIFIEDDATE", type: "string" },
        { label: "WORKORDER", property: "WORKORDER", type: "string" },
        { label: "VMOHEADFLAG", property: "VMOHEADFLAG", type: "boolean" },
        { label: "VMOTEAMFLAG", property: "VMOTEAMFLAG", type: "boolean" },
        { label: "ACTIONTYPE", property: "ACTIONTYPE", type: "string" },
        { label: "FINALRESAON", property: "FINALRESAON", type: "string" },
        { label: "REASONTYPE", property: "REASONTYPE", type: "string" }
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
        fileName: "Invalid_Employees.xlsx",
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
