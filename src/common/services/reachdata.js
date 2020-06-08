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
        svc.usertitle = _spPageContextInfo.userDisplayName;

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
                                retData[i].curusermeperson = _.some(retData[i].meperson, ['id', svc.userid]);
                                if (d.results.length > 0) {
                                    retData[i].submitted = "YES";
                                    retData[i].status = d.results[0].Status;
                                    retData[i].meperson = [];
                                    retData[i].meperson.push({ id: d.results[0].MEPerson.Id, title: d.results[0].MEPerson.Title });
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
                    _.forEach(returnTable, function (rrd) {
                        rrd.male = 0;
                        rrd.female = 0;
                        rrd.other = 0;
                        rrd.total = 0;
                        rrd.pwdmale = 0;
                        rrd.pwdfemale = 0;
                        rrd.pwdother = 0;
                        rrd.pwdtotal = 0;
                        _.forEach(data.results, function (pdata) {
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
                        });
                    });
                    deferPlan.resolve(returnTable);
                })
                .catch(function (error) {
                    deferPlan.reject("An error occured while fetching the items. Contact IT Service desk for support.");
                    console.log(error);
                });

            return deferPlan.promise;
        };

        svc.addReachDataSupportDocs = function (proj, quarter, doc) {
            if (proj.id && quarter.id && doc) {
                var deferDocs = $q.defer();
                var nameWithNoExt = doc.attachment.name.substring(0, doc.attachment.name.lastIndexOf('.'));
                var ext = doc.attachment.name.split('.').pop();
                doc.attachment.name = nameWithNoExt + "_" + Date.now() + "." + ext;
                var data = {
                    Title: doc.attachment.name,
                    Details: doc.details,
                    ProjectId: proj.id,
                    FinancialQuarterId: quarter.id,
                    TypeofDocumentId: doc.type.id
                };

                ShptRestService
                    .uploadFileToDocumentLibrary("ReachDataSupportDocs", "/", doc.attachment, data)
                    .then(function (fileId) {
                        var queryP = "$select=Id,Title,Details,TypeofDocument/Id,TypeofDocument/Title,FileRef,FileLeafRef,Created,Author/Id,Author/Title&$expand=TypeofDocument,Author";
                        ShptRestService
                            .getListItemById("ReachDataSupportDocs", fileId, queryP)
                            .then(function (o) {
                                var obj = {};
                                obj.id = o.Id;
                                obj.title = o.Title;
                                obj.details = o.Details;
                                obj.type = _.isNil(o.TypeofDocument) ? '' : { id: o.TypeofDocument.Id, title: o.TypeofDocument.Title };
                                obj.link = { href: o.FileRef, title: o.FileLeafRef };
                                obj.uploaddate = new Date(o.Created);
                                obj.uploadby = _.isNil(o.Author) ? '' : { id: o.Author.Id, title: o.Author.Title };
                                deferDocs.resolve(obj);
                            })
                            .catch(function (error) {
                                deferDocs.reject("An error occured. Contact IT Service desk for support." + error);
                                console.log(error);
                            });
                    })
                    .catch(function (error) {
                        deferDocs.reject("An error occured. Contact IT Service desk for support." + error);
                        console.log(error);
                    });

                return deferDocs.promise;
            }
        };

        svc.getAllDocuments = function (projId, quarterId) {
            var defDocs = $q.defer();
            var queryParams = "$select=Id,Title,Details,TypeofDocument/Id,TypeofDocument/Title,FileRef,FileLeafRef,Created,Author/Id,Author/Title&$" +
                "expand=TypeofDocument,Author&$filter=Project/Id eq '" + projId + "' and FinancialQuarter/Id eq '" + quarterId + "'";
            var documentsList = null;
            ShptRestService
                .getListItems("ReachDataSupportDocs", queryParams)
                .then(function (data) {
                    documentsList = [];
                    _.forEach(data.results, function (o) {
                        var obj = {};
                        obj.id = o.Id;
                        obj.title = o.Title;
                        obj.details = o.Details;
                        obj.type = _.isNil(o.TypeofDocument) ? '' : { id: o.TypeofDocument.Id, title: o.TypeofDocument.Title };
                        obj.link = { href: o.FileRef, title: o.FileLeafRef };
                        obj.uploaddate = new Date(o.Created);
                        obj.uploadby = _.isNil(o.Author) ? '' : { id: o.Author.Id, title: o.Author.Title };
                        documentsList.push(obj);
                    });
                    defDocs.resolve(documentsList);
                })
                .catch(function (error) {
                    defDocs.reject(error);
                });
            return defDocs.promise;
        };

        svc.checkIfReachDataPlanExists = function (year, project) {
            var defRDPExists = $q.defer();
            quartersSvc
                .getAllItemsYear(year)
                .then(function (quarters) {
                    var qproms = [];
                    _.forEach(quarters, function (q) {
                        qproms.push(svc.checkIfReachDataActualsExists(q, project, "ReachDataForeCast"));
                    });
                    $q
                        .all(qproms)
                        .then(function (resExists) {
                            var dataExists = _.some(resExists, [true]);
                            defRDPExists.resolve(dataExists);
                        })
                        .catch(function (error) {
                            console.log(error);
                            defRDPExists.reject("An error occured while checking for existing planned reach data. Contact IT Service desk for support.");
                        });
                })
                .catch(function (error) {
                    console.log(error);
                    defRDPExists.reject("An error occured while retreving quarter details. Contact IT Service desk for support.");
                });
            return defRDPExists.promise;
        };

        svc.checkIfReachDataActualsExists = function (quarter, project, listTitle) {
            var defRDExsts = $q.defer();
            var qParams = "$select=Id,Title&$filter=Project/Id eq " + project.id + " and FinancialQuarter/Id eq " + quarter.id;
            ShptRestService
                .getListItems(listTitle, qParams)
                .then(function (data) {
                    var dataExists = false;
                    if (data.results.length > 0) {
                        dataExists = true;
                    }
                    defRDExsts.resolve(dataExists);
                })
                .catch(function (error) {
                    defRDExsts.reject(error);
                });
            return defRDExsts.promise;
        };

        svc.DeleteDocument = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem("ReachDataSupportDocs", id)
                    .then(function () {
                        defer.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };

        svc.addReachData = function (reachdata) {
            var deferRDA = $q.defer();
            var dataInsertProms = [];

            _.forEach(reachdata.tablesDataTR, function (cd) {
                var data = {};
                data.Title = "Total Reach Planning for " + reachdata.project.title + " for quarter " + reachdata.quarter.title;
                data.ProjectId = reachdata.project.id;
                data.CountryId = reachdata.project.country.id;
                data.GrantCodeId = reachdata.project.grantcode.id;
                data.GlobalProgrammeId = reachdata.project.programme.id;
                data.MEPersonId = svc.userid;
                data.FinancialQuarterId = reachdata.quarter.id;
                data.ReachType = "Total";
                data.OthersDetails = reachdata.othersdetails;
                data.Age = cd.age;
                data.Female = _.isNaN(parseInt(cd.female)) ? 0 : parseInt(cd.female);
                data.Male = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                data.Other = _.isNaN(parseInt(cd.other)) ? 0 : parseInt(cd.other);
                data.PWDFemale = _.isNaN(parseInt(cd.pwdfemale)) ? 0 : parseInt(cd.pwdfemale);
                data.PWDMale = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                data.PWDOther = _.isNaN(parseInt(cd.pwdother)) ? 0 : parseInt(cd.pwdother);
                data.SpecificGroups = reachdata.specificgroups;
                data.SpecificServices = reachdata.specificservices;
                data.PrimaryActor = reachdata.primaryactor;
                data.Plans = reachdata.plans;
                data.Disability = reachdata.disability;
                data.DisabilityImpacted = reachdata.disabilityimpacted;
                data.Status = "Pending"
                dataInsertProms.push(ShptRestService.createNewListItem("ReachData", data));
            });

            _.forEach(reachdata.tablesDataNR, function (cd) {
                var data = {};
                data.Title = "New Reach Planning for " + reachdata.project.title + " for quarter " + reachdata.quarter.title;
                data.ProjectId = reachdata.project.id;
                data.CountryId = reachdata.project.country.id;
                data.GrantCodeId = reachdata.project.grantcode.id;
                data.GlobalProgrammeId = reachdata.project.programme.id;
                data.MEPersonId = svc.userid;
                data.FinancialQuarterId = reachdata.quarter.id;
                data.ReachType = "New";
                data.OthersDetails = reachdata.othersdetails;
                data.Age = cd.age;
                data.Female = _.isNaN(parseInt(cd.female)) ? 0 : parseInt(cd.female);
                data.Male = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                data.Other = _.isNaN(parseInt(cd.other)) ? 0 : parseInt(cd.other);
                data.PWDFemale = _.isNaN(parseInt(cd.pwdfemale)) ? 0 : parseInt(cd.pwdfemale);
                data.PWDMale = _.isNaN(parseInt(cd.male)) ? 0 : parseInt(cd.male);
                data.PWDOther = _.isNaN(parseInt(cd.pwdother)) ? 0 : parseInt(cd.pwdother);
                data.SpecificGroups = reachdata.specificgroups;
                data.SpecificServices = reachdata.specificservices;
                data.PrimaryActor = reachdata.primaryactor;
                data.Plans = reachdata.plans;
                data.Disability = reachdata.disability;
                data.DisabilityImpacted = reachdata.disabilityimpacted;
                data.Status = "Pending"
                dataInsertProms.push(ShptRestService.createNewListItem("ReachData", data));
            });

            var data = {};
            data.Title = reachdata.project.title + " for quarter " + reachdata.quarter.title + " year " + reachdata.year.title;
            data.ProjectId = reachdata.project.id;
            data.QuarterId = reachdata.quarter.id;
            dataInsertProms.push(ShptRestService.createNewListItem("ReachDataEntries", data));

            $q
                .all(dataInsertProms)
                .then(function (resp) {
                    deferRDA.resolve(true);
                })
                .catch(function (error) {
                    console.log(error);
                    deferRDA.reject("An error occured while saving reach data actuals. Contact IT Service desk for support.");
                });
            return deferRDA.promise;
        };

        svc.getReachDataComments = function (quarter, project) {
            var defRDComments = $q.defer();
            var reachDataComments = [];
            var qParams = "$select=Id,Title,Comment,CommentBy/Id,CommentBy/Title,CommentDate,Quarter/Id,Quarter,Title,Project/Id,Project/Title," +
                "UserType,CommentSubject&$expand=Quarter,Project,CommentBy&$filter=Project/Id eq " + project.id + " and Quarter/Id eq " + quarter.id;
            ShptRestService
                .getListItems("ReachDataComments", qParams)
                .then(function (data) {
                    _.forEach(data.results, function (o) {
                        var obj = {};
                        obj.id = o.Id;
                        obj.title = o.Title;
                        obj.comment = o.Comment;
                        obj.commentby = _.isNil(o.CommentBy) ? '' : { id: o.CommentBy.Id, title: o.CommentBy.Title };
                        obj.commentdate = new Date(o.CommentDate);
                        obj.project = _.isNil(o.Project) ? '' : { id: o.Project.Id, title: o.Project.Title };
                        obj.quarter = _.isNil(o.Quarter) ? '' : { id: o.Quarter.Id, title: o.Quarter.Title };
                        obj.usertype = o.UserType;
                        obj.subject = o.CommentSubject;
                        reachDataComments.push(obj);
                    });
                    defRDComments.resolve(reachDataComments);
                })
                .catch(function (error) {
                    defRDComments.reject(error);
                });
            return defRDComments.promise;
        };

        svc.addReachDataComments = function (quarter, project, comment, subject) {
            var defRDCommentsAdd = $q.defer();
            if (_.isNil(subject)) {
                subject = "Scale and Reach Data Comment Received";
            }
            var data = {
                Title: "Comment for ReachData for Quarter " + quarter.title + " Project " + project.title,
                Comment: comment,
                CommentDate: new Date(),
                CommentById: svc.userid,
                ProjectId: project.id,
                QuarterId: quarter.id,
                CommentSubject: subject
            };
            var qParams = "$select=Id";
            ShptRestService
                .getGroupMembers("Scale and Reach Tool Admins", qParams)
                .then(function (users) {
                    var userAdmin = _.some(users.results, ['Id', svc.userid]);
                    data.UserType = userAdmin ? "Admin" : "User";
                    ShptRestService
                        .createNewListItem("ReachDataComments", data)
                        .then(function (response) {
                            var obj = {};
                            obj.id = response.Id;
                            obj.title = data.Title;
                            obj.comment = data.Comment;
                            obj.commentby = { id: svc.userid, title: svc.usertitle };
                            obj.commentdate = data.CommentDate;
                            obj.project = data.Project;
                            obj.quarter = data.Quarter;
                            obj.usertype = data.UserType;
                            defRDCommentsAdd.resolve(obj);
                        })
                        .catch(function (error) {
                            console.log(error);
                            defRDCommentsAdd.reject("An error occured while adding the item. Contact IT Service desk for support.");
                        });
                })
                .catch(function (error) {
                    defRDCommentsAdd.reject(error);
                });

            return defRDCommentsAdd.promise;
        };

        svc.DeleteComment = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem("ReachDataComments", id)
                    .then(function () {
                        defer.resolve(true);
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };

    }
})();