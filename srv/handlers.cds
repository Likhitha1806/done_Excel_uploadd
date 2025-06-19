using ecommerce from '../db/schema';

type EmployeeInput {
    ID: Integer;
    Name: String;
    Age: Integer;
    Department: String;
    Email: String;
    Phone: String;
    Location: String;
    JoiningDate: Date;
}

service ECommerceService {
    entity Employees as projection on ecommerce.Employees;
    action saveUploadedEmployees(input: array of EmployeeInput);
    action bulkUpload(jsonData: String) returns {};
}
action bulkUpload(jsonData: String) returns {
    message: String;
    totalRecords: Integer;
    insertedRecords: Integer;
    skippedRecords: Integer;
    downloadInvalidRecords: String;
};


