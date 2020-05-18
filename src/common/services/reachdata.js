(function () {
    'use strict';

    angular
        .module('services.reachdata', [])
        .service('reachdatasvc', ReachDataSvc);

    ReachDataSvc.$inject = ['$q', 'ShptRestService', 'projectsSvc', 'quartersSvc'];
    function ReachDataSvc($q, ShptRestService, projectsSvc, quartersSvc) {
        var svc = this;
        svc.hostWebUrl = ShptRestService.hostWebUrl;
        svc.userid = _spPageContextInfo.userId;

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

        svc.setTableDetails = function () {
            return [
                { age: "00-05", female: "", male: "", other: "", total: 0, pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: 0 },
                { age: "06-18", female: "", male: "", other: "", total: 0, pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: 0 },
                { age: "19-35", female: "", male: "", other: "", total: 0, pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: 0 },
                { age: "36-60", female: "", male: "", other: "", total: 0, pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: 0 },
                { age: "60+", female: "", male: "", other: "", total: 0, pwdfemale: "", pwdmale: "", pwdother: "", pwdtotal: 0 }
            ];
        };

        svc.addReachDataPlans = function (reachdata) {
            var deferPRD = $q.defer();
            var dataInsertPromises = [];

            quartersSvc
                .getAllItemsYear(reachdata.year)
                .then(function (quarters) {
                    _.forEach(reachdata.tablesTotalReach, function (dt) {
                        _.forEach(dt.data, function (cd) {
                            var data = {};
                            data.Title = "Total Reach Planning for " + reachdata.project.title + " for quarter " + (_.find(quarters, ['abbr', dt.quarter])).title;
                            data.ProjectId = reachdata.project.id;
                            data.CountryId = reachdata.country.id;
                            data.GrantCodeId = reachdata.grant.id;
                            data.MEPersonId = svc.userid;
                            data.FinancialQuarterId = (_.find(quarters, ['abbr', dt.quarter])).id;
                            data.ReachType = "Total";
                            data.OthersDetailsTR = reachdata.othersdetailtr;
                            data.Age = cd.age;
                            data.Female = _.isNaN(parseInt(cd.female)) ? 0 : parseInt(cd.female);
                            data.Male = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                            data.Other = _.isNaN(parseInt(cd.other)) ? 0 : parseInt(cd.other);
                            data.PWDFemale = _.isNaN(parseInt(cd.pwdfemale)) ? 0 : parseInt(cd.pwdfemale);
                            data.PWDMale = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                            data.PWDOther = _.isNaN(parseInt(cd.pwdother)) ? 0 : parseInt(cd.pwdother);
                            dataInsertPromises.push(ShptRestService.createNewListItem("ReachDataForeCast", data));
                        });
                    });


                    _.forEach(reachdata.tablesNewReach, function (dn) {
                        _.forEach(dn.data, function (cd) {
                            var data = {};
                            data.Title = "New Reach Planning for " + reachdata.project.title + " for quarter " + (_.find(quarters, ['abbr', dn.quarter])).title;
                            data.ProjectId = reachdata.project.id;
                            data.CountryId = reachdata.country.id;
                            data.GrantCodeId = reachdata.grant.id;
                            data.MEPersonId = svc.userid;
                            data.FinancialQuarterId = (_.find(quarters, ['abbr', dn.quarter])).id;
                            data.ReachType = "New";
                            data.OthersDetailsNR = reachdata.othersdetailnr;
                            data.Age = cd.age;
                            data.Female = _.isNaN(parseInt(cd.female)) ? 0 : parseInt(cd.female);
                            data.Male = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                            data.Other = _.isNaN(parseInt(cd.other)) ? 0 : parseInt(cd.other);
                            data.PWDFemale = _.isNaN(parseInt(cd.pwdfemale)) ? 0 : parseInt(cd.pwdfemale);
                            data.PWDMale = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                            data.PWDOther = _.isNaN(parseInt(cd.pwdother)) ? 0 : parseInt(cd.pwdother);
                            dataInsertPromises.push(ShptRestService.createNewListItem("ReachDataForeCast", data));
                        });
                    });

                    $q
                        .all(dataInsertPromises)
                        .then(function (resp) {
                            deferPRD.resolve(true);
                        })
                        .catch(function (error) {
                            console.log(error);
                            deferPRD.reject("An error occured while saving reach data plans. Contact IT Service desk for support.");
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    deferPRD.reject("An error occured while getting quarter details. Contact IT Service desk for support.");
                });
            return deferPRD.promise;
        };

        svc.getPlannedProjectData = function (projId, quarterId, reachType) {
            var deferPlan = $q.defer();
            var qparam = "$select=Id,Age,Male,Female,Other,PWDMale,PWDFemale,PWDOther&$filter=FinancialQuarter/Id eq " + quarterId + " and Project/Id eq " + projId + " and ReachType eq '" + reachType + "'";
            var returnTable = svc.setTableDetails();
            ShptRestService
                .getListItems("ReachDataForeCast", qparam)
                .then(function (data) {
                    if (data.results.length <= 0) {
                        _.forEach(returnTable, function (rrd) {
                            rrd.male = 0;
                            rrd.female = 0;
                            rrd.other = 0;
                            rrd.total = 0;
                            rrd.pwdmale = 0;
                            rrd.pwdfemale = 0;
                            rrd.pwdother = 0;
                            rrd.pwdtotal = 0;
                        })
                        deferPlan.resolve(returnTable);
                    } else {
                        _.forEach(data.results, function (pdata) {
                            _.forEach(returnTable, function (rrd) {
                                if (rrd.age == pdata.Age) {
                                    rrd.male = pdata.Male;
                                    rrd.female = pdata.Female;
                                    rrd.other = pdata.Other;
                                    rrd.total = pdata.Male + pdata.Female + pdata.Other;
                                    rrd.pwdmale = pdata.PWDMale;
                                    rrd.pwdfemale = pdata.PWDFemale;
                                    rrd.pwdother = pdata.PWDOther;
                                    rrd.pwdtotal = pdata.PWDMale + pdata.PWDFemale + pdata.PWDOther;
                                }
                            })
                        });
                        deferPlan.resolve(returnTable);
                    }
                })
                .catch(function (error) {
                    deferPlan.reject("An error occured while fetching the items. Contact IT Service desk for support.");
                    console.log(error);
                });

            return deferPlan.promise;
        };
    }
})();