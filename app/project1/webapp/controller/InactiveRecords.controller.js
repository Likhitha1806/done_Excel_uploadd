sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("project1.controller.InactiveRecords", {
        onInit: function () {
            // Load inactive records from core model to this view's model on init
            var inactiveModel = sap.ui.getCore().getModel("inactiveModel");
            if (inactiveModel) {
                var data = inactiveModel.getProperty("/inactiveEmployees") || [];
                this.getView().setModel(new JSONModel({ inactiveEmployees: data }));
            } else {
                this.getView().setModel(new JSONModel({ inactiveEmployees: [] }));
            }
        },

        onExport: function () {
            var model = this.getView().getModel();
            var data = model.getProperty("/inactiveEmployees");
            if (!data || data.length === 0) {
                MessageToast.show("No inactive records to export.");
                return;
            }
            var headers = Object.keys(data[0]);
            var csvContent = headers.join(",") + "\n";
            data.forEach(function(record) {
                csvContent += headers.map(function(h) { return record[h] || ""; }).join(",") + "\n";
            });
            var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "InactiveRecords.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            MessageToast.show("Inactive records exported.");
        }
    });
});