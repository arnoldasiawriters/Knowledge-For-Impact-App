(function () {
    'use strict';

    angular
        .module('reachdata-add', [])
        .controller('reachDataAddCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', '$dialogAlert', '$dialogConfirm', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'docTypesSvc', 'quartersSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'spinnerService', 'growl'];
    function ReachDataCtrl($q, $dialogAlert, $dialogConfirm, reachdatasvc, YearsSvc, programmesSvc, docTypesSvc, quartersSvc, countriesSvc, grantsSvc, projectsSvc, spinnerService, growl) {
        spinnerService.show('spinner1');
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.title = "Plan Scale & Reach Data";
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;
        ctrl.reachdata = {};
        ctrl.reachdata.tablesDataTR = [];
        ctrl.reachdata.tablesDataNR = [];
        ctrl.tablesDataTRPlan = [];
        ctrl.tablesDataNRPlan = [];
        ctrl.document = {};
        ctrl.supportingDocs = [];
        ctrl.planningDataAvalable = true;
        ctrl.projectRDSubmitted = false;
        ctrl.projectMEPerson = false;
        ctrl.comments = [];
        ctrl.comment = "";
        setTables();

        var promises = [];
        promises.push(YearsSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(grantsSvc.getAllItems());
        promises.push(projectsSvc.getAllItems());
        promises.push(docTypesSvc.getAllItems());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.years = results[0];
                ctrl.programmes = results[1];
                ctrl.countries = results[2];
                ctrl.grants = results[3];
                ctrl.projects = results[4];
                ctrl.doctypes = results[5];
            }).catch(function (error) {
                growl.error(error);
            }).finally(function () {
                spinnerService.closeAll();
            });

        ctrl.SelectQuarter = function () {
            ctrl.quarters = [];
            if (ctrl.reachdata.year) {
                spinnerService.show('spinner1');
                quartersSvc
                    .getAllItemsYear(ctrl.reachdata.year)
                    .then(function (res) {
                        ctrl.quarters = res;
                    })
                    .catch(function (error) {
                        growl.error(error);
                    })
                    .finally(function () {
                        spinnerService.closeAll();
                    });
            }
        };


        ctrl.getPlannedData = function () {
            if (ctrl.reachdata.quarter && ctrl.reachdata.project) {
                spinnerService.show('spinner1');
                var planspromises = [];
                planspromises.push(reachdatasvc.getPlannedProjectData(ctrl.reachdata.project.id, ctrl.reachdata.quarter.id, "Total"));
                planspromises.push(reachdatasvc.getPlannedProjectData(ctrl.reachdata.project.id, ctrl.reachdata.quarter.id, "New"));
                planspromises.push(reachdatasvc.getAllDocuments(ctrl.reachdata.project.id, ctrl.reachdata.quarter.id));
                planspromises.push(reachdatasvc.checkIfReachDataActualsExists(ctrl.reachdata.quarter, ctrl.reachdata.project, "ReachData"));
                planspromises.push(reachdatasvc.getReachDataComments(ctrl.reachdata.quarter, ctrl.reachdata.project));
                planspromises.push(projectsSvc.getProjectMEPersons(ctrl.reachdata.project.id));
                $q
                    .all(planspromises)
                    .then(function (results) {
                        ctrl.tablesDataTRPlan = results[0];
                        ctrl.tablesDataNRPlan = results[1];
                        ctrl.supportingDocs = results[2];
                        ctrl.projectRDSubmitted = results[3];
                        ctrl.comments = results[4];
                        ctrl.projectMEPerson = _.some(results[5], ['id', ctrl.userid]);
                        var plannedTRData = CheckIfDataIsThere(ctrl.tablesDataTRPlan);
                        var plannedNRData = CheckIfDataIsThere(ctrl.tablesDataNRPlan);

                        if (plannedTRData.total <= 0 && plannedTRData.pwdtotal <= 0 && plannedNRData.total <= 0 && plannedNRData.pwdtotal <= 0) {
                            ctrl.planningDataAvalable = false;
                            growl.warning("There is no planning data. You won't be able to submit your data!");
                        } else {
                            ctrl.planningDataAvalable = true;
                        }

                        if (ctrl.projectRDSubmitted) {
                            growl.warning("Actual Reach Data for the project for the quarter is already done! Update the actuals instead of adding a new one. You won't be able to submit Reach data for the project");
                        }

                        if (!ctrl.projectMEPerson) {
                            growl.warning("You are not among the ME Report Persons for the Project. You won't be able to submit Reach data for the project");
                        }
                    })
                    .catch(function (error) {
                        growl.error(error);
                    })
                    .finally(function () {
                        spinnerService.closeAll();
                    });
            } else {
                $dialogAlert("Kindly select the financial year and project.", "Missing Details");
                ctrl.reachdata.project = "";
            }
        };

        ctrl.calculateTotal = function (data) {
            var female = _.isNaN(parseInt(data.female)) ? 0 : parseInt(data.female);
            var male = _.isNaN(parseInt(data.male)) ? 0 : parseInt(data.male);
            var other = _.isNaN(parseInt(data.other)) ? 0 : parseInt(data.other);
            var pwdfemale = _.isNaN(parseInt(data.pwdfemale)) ? 0 : parseInt(data.pwdfemale);
            var pwdmale = _.isNaN(parseInt(data.pwdmale)) ? 0 : parseInt(data.pwdmale);
            var pwdother = _.isNaN(parseInt(data.pwdother)) ? 0 : parseInt(data.pwdother);
            data.total = female + male + other;
            data.pwdtotal = pwdfemale + pwdmale + pwdother;
        };

        ctrl.submitReachDataActuals = function () {
            var returnMsg = checkSelections();
            if (!returnMsg.passed) {
                $dialogAlert(returnMsg.message, "Missing Details");
                return;
            }

            if (!ctrl.planningDataAvalable) {
                $dialogAlert("Kindly submit planning data for the selected period and project.", "Missing Details");
                return;
            }

            var otherDetailsFilledTR = CheckIfOthersDetailsFilled(true);
            var otherDetailsFilledNR = CheckIfOthersDetailsFilled(false);
            var anyFieldFilled = CheckIfAnyFieldsFilled();

            if (otherDetailsFilledTR && (ctrl.reachdata.othersdetails == "" || !ctrl.reachdata.othersdetails)) {
                $dialogAlert("Please provide as much detail as possible on who is included within 'other' in the quarter for total reach!", "Missing Details");
                return;
            } else if (otherDetailsFilledNR && (ctrl.reachdata.othersdetails == "" || !ctrl.reachdata.othersdetails)) {
                $dialogAlert("Please provide as much detail as possible on who is included within 'other' in the quarter for new reach!", "Missing Details");
                return;
            } else if (!anyFieldFilled) {
                $dialogAlert("You have not filled any numbers!", "Missing Details");
                return;
            }
            if (ctrl.projectRDSubmitted) {
                $dialogAlert("Actual Reach Data for the project for the quarter is already submitted! Update the actuals instead of adding a new one. You won't be able to submit Reach data for the project!", "Duplicates Detected");
                return;
            }
            if (!ctrl.projectMEPerson) {
                $dialogAlert("You are not among the ME Report Persons for the Project. Contact the System Admin/ Service Desk", "Missing Details")
                return;
            }

            $dialogConfirm('Add Records?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    reachdatasvc
                        .addReachData(ctrl.reachdata)
                        .then(function (res) {
                            ctrl.reachdata = {};
                            setTables();
                            ctrl.tablesDataTRPlan = [];
                            ctrl.tablesDataNRPlan = [];
                            growl.success("Actual Reach data for the project for the period added Successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        function CheckIfOthersDetailsFilled(tReach) {
            var othersDetailsFilledNR = false;
            var checkinData = [];
            if (tReach) {
                checkinData = ctrl.reachdata.tablesDataTR;
            } else {
                checkinData = ctrl.reachdata.tablesDataNR
            }
            _.forEach(checkinData, function (rdpdata) {
                if ((_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 || (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                    othersDetailsFilledNR = true;
                }
            });
            return othersDetailsFilledNR;
        }

        function CheckIfAnyFieldsFilled() {
            var fieldsFilled = false;
            _.forEach(ctrl.reachdata.tablesDataTR, function (rdpdata) {
                if ((_.isNaN(parseInt(rdpdata.female)) ? 0 : parseInt(rdpdata.female)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.male)) ? 0 : parseInt(rdpdata.male)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdfemale)) ? 0 : parseInt(rdpdata.pwdfemale)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdmale)) ? 0 : parseInt(rdpdata.pwdmale)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                    fieldsFilled = true;
                }
            });
            _.forEach(ctrl.reachdata.tablesDataNR, function (rdpdata) {
                if ((_.isNaN(parseInt(rdpdata.female)) ? 0 : parseInt(rdpdata.female)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.male)) ? 0 : parseInt(rdpdata.male)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdfemale)) ? 0 : parseInt(rdpdata.pwdfemale)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdmale)) ? 0 : parseInt(rdpdata.pwdmale)) > 0 ||
                    (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                    fieldsFilled = true;
                }
            });
            return fieldsFilled;
        }

        ctrl.uploadDocument = function () {
            var returnMsg = checkSelections();
            if (!returnMsg.passed) {
                $dialogAlert(returnMsg.message, "Missing Details");
                return;
            }

            if (!ctrl.document.type) {
                $dialogAlert("Kindly select the document type of the document you are uploading!", "Missing Details");
                return;
            } else if (!ctrl.document.attachment) {
                $dialogAlert("Kindly select the attachment you are uploading", "Missing Details");
                return;
            }
            $dialogConfirm('Add Document?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    reachdatasvc.
                        addReachDataSupportDocs(ctrl.reachdata.project, ctrl.reachdata.quarter, ctrl.document)
                        .then(function (upDoc) {
                            ctrl.supportingDocs.push(upDoc);
                            growl.success("Support Document added Successfully!");
                            ctrl.document = {};
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.RemoveDocument = function (docid) {
            $dialogConfirm('Delete Document?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    reachdatasvc
                        .DeleteDocument(docid)
                        .then(function (res) {
                            _.remove(ctrl.supportingDocs, {
                                id: docid
                            });
                            growl.success("Document deleted successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };

        ctrl.addComment = function () {
            var returnMsg = checkSelections();
            if (!returnMsg.passed) {
                $dialogAlert(returnMsg.message, "Missing Details");
                return;
            }
            if (!ctrl.comment) {
                $dialogAlert("Kindly provide the comment you want to add!", "Missing Details");
                return;
            }

            $dialogConfirm('Add Comment?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');

                    reachdatasvc
                        .addReachDataComments(ctrl.reachdata.quarter, ctrl.reachdata.project, ctrl.comment)
                        .then(function (res) {
                            ctrl.comments.push(res);
                            ctrl.comment = "";
                            growl.success("Comment added Successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.deleteComment = function (commId) {
            if (commId) {
                $dialogConfirm('Delete Comment?', 'Confirm Transaction')
                    .then(function () {
                        spinnerService.show('spinner1');
                        reachdatasvc
                            .DeleteComment(commId)
                            .then(function (res) {
                                _.remove(ctrl.comments, {
                                    id: commId
                                });
                                growl.success("Comment deleted successfully!");
                            })
                            .catch(function (error) {
                                growl.error(error);
                            })
                            .finally(function () {
                                spinnerService.closeAll();
                            })
                    });
            }
        };

        function checkSelections() {
            var testRes = {};
            testRes.passed = true;
            testRes.message = "";

            if (!ctrl.reachdata.year) {
                testRes.passed = false;
                testRes.message = "Select the financial year!";
            } else if (!ctrl.reachdata.quarter) {
                testRes.passed = false;
                testRes.message = "Select the financial quater in which the project is implemented!";
            } else if (!ctrl.reachdata.country) {
                testRes.passed = false;
                testRes.message = "Select the country where project is implemented!";
            } else if (!ctrl.reachdata.grant) {
                testRes.passed = false;
                testRes.message = "Select the grant funding the project!";
            }
            else if (!ctrl.reachdata.programme) {
                testRes.passed = false;
                testRes.message = "Select the Global Programmes & OR Initiatives in which this project belongs!";
            }
            else if (!ctrl.reachdata.project) {
                testRes.passed = false;
                testRes.message = "Select the Project Code!";
            }
            return testRes;
        }

        function CheckIfDataIsThere(tbl) {
            var total = {};
            total.total = 0;
            total.pwdtotal = 0;
            _.forEach(tbl, function (data) {
                var totalData = (_.isNaN(parseInt(data.female)) ? 0 : parseInt(data.female)) + (_.isNaN(parseInt(data.male)) ? 0 : parseInt(data.male)) + (_.isNaN(parseInt(data.other)) ? 0 : parseInt(data.other));
                var pwdtotalData = (_.isNaN(parseInt(data.pwdfemale)) ? 0 : parseInt(data.pwdfemale)) + (_.isNaN(parseInt(data.pwdmale)) ? 0 : parseInt(data.pwdmale)) + (_.isNaN(parseInt(data.pwdother)) ? 0 : parseInt(data.pwdother));
                total.total = total.total + totalData;
                total.pwdtotal = total.pwdtotal + pwdtotalData;
            });
            return total;
        }

        function setTables() {
            ctrl.reachdata.tablesDataTR = reachdatasvc.setTableDetails();
            ctrl.reachdata.tablesDataNR = reachdatasvc.setTableDetails();
        }

    }
})();