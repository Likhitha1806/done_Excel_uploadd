using ecommerce from '../db/schema';

type EmployeeInput {
    APPLICATIONID: String;
    IRMPSNUMBER: String;
    IRMNAME: String;
    EMPLOYEENAME: String;
    PSNUMBER: String;
    BASEBU: String;
    BUCODE: String;
    ALLOCATEDBU: String;
    LOCATION: String;
    DATEOFJOINING: Date;
    CURRENTCONTRACTENDDATE: Date;
    VENDORNAME: String;
    CONTRACTEXTENSION: Boolean;
    CONTRACTENDDATE: Date;
    CONTRACTEXTENSIONSTARTDATE: Date;
    CONTRACTEXTENSIONENDDATE: Date;
    CURRENTPAYRATE: Decimal(10,2);
    CURRENCY: String;
    FREQUENCY: String;
    PAYRATECHANGE: Boolean;
    NEWPAYRATE: Decimal(10,2);
    SKILLS: String;
    PROJECTNAME: String;
    CLIENTNAME: String;
    NOTICEPERIOD: String;
    WORKINGDAYSNSHIFT: String;
    OTHERALLOWANCES: String;
    SPECIALTERMS: String;
    STATUS: String;
    SUBMITTEDBY: String;
    MODIFIEDBY: String;
    SUBMITTEDDATE: Date;
    MODIFIEDDATE: Date;
    WORKORDER: String;
    VMOHEADFLAG: Boolean;
    VMOTEAMFLAG: Boolean;
    ACTIONTYPE: String;
    FINALRESAON: String;
    REASONTYPE: String;
}

service ECommerceService {
    entity Employees as projection on ecommerce.Employees;
    action saveUploadedEmployees(input: array of EmployeeInput);
    action bulkUpload(jsonData: String) returns {
        message: String;
        totalRecords: Integer;
        insertedRecords: Integer;
        skippedRecords: Integer;
        downloadInvalidRecords: String;
    };
}