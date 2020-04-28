(function () {
    'use strict';

    angular
        .module('services.reachdata', [])
        .service('reachdatasvc', ReachDataSvc);

    ReachDataSvc.$inject = ['$q', 'ShptRestService', 'projectsSvc'];
    function ReachDataSvc($q, ShptRestService, projectsSvc) {
        var svc = this;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getQuarterReportingData = function (quarter, programme) {
            var defer = $q.defer();
            projectsSvc
                .getAllItemFilterMEReport(true, programme)
                .then(function (retData) {
                    var reachdatapromises = [];
                    _.forEach(retData, function (rtd) {
                        rtd.year = quarter.year;
                        rtd.quarter = quarter.title;
                        var qparam = "$select=Id,Status,MEPerson/Id,MEPerson/Title&$expand=MEPerson&$filter=FinancialQuarter/Id eq " + quarter.id + " and Project/Id eq " + rtd.id;
                        reachdatapromises.push(ShptRestService.getListItems("ReachData", qparam));
                    });

                    $q
                        .all(reachdatapromises)
                        .then(function (rdpres) {
                            var i = 0;
                            _.forEach(rdpres, function (d) {
                                if (d.results.length > 0) {
                                    retData[i].submitted = "YES";
                                    retData[i].status = d.results[0].Status;
                                    retData[i].mereport = [];
                                    retData[i].mereport.push({ id: d.results[0].MEPerson.Id, title: d.results[0].MEPerson.Title });
                                } else {
                                    retData[i].submitted = "NO";
                                    retData[i].status = "";
                                }
                                i += 1;
                            });
                            defer.resolve(retData);
                        })
                        .catch(function (error) {
                            defer.reject(error);
                        });

                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.getTableDetails = function (header) {
            var returnData = [];
            //var defer = $q.defer();
            if (header) {
                returnData = { age: "", female: "Female", male: "Male", other: "Others", total: "Total", pwdfemale: "Female", pwdmale: "Male", pwdother: "Others", pwdtotal: "Total" };
            } else {
                returnData = [
                    { age: "0-5", female: "", male: "", other: "", total: "", pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: "" },
                    { age: "6-18", female: "", male: "", other: "", total: "", pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: "" },
                    { age: "19-35", female: "", male: "", other: "", total: "", pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: "" },
                    { age: "36-60", female: "", male: "", other: "", total: "", pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: "" },
                    { age: "60+", female: "", male: "", other: "", total: "", pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: "" }
                ];
            }
            //defer.resolve(returnData);
            //return defer.promise;
            return returnData;
        };
    }
})();