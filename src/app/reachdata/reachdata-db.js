﻿(function () {
    'use strict';

    angular
        .module('reachdata', [])
        .controller('reachDataCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', '$route', '$dialog', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'quartersSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'settingsSvc', 'spinnerService', 'growl'];
    function ReachDataCtrl($q, $route, $dialog, reachdatasvc, YearsSvc, programmesSvc, quartersSvc, countriesSvc, grantsSvc, projectsSvc, settingsSvc, spinnerService, growl) {
        spinnerService.show('spinner1');
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.title = "Plan Scale & Reach Data";
        ctrl.action = $route.current.$$route.param;
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;
        ctrl.reachdata = {};
        ctrl.reachdatas = [];
        ctrl.filterEmergencies = [];
        ctrl.totalprojects = 0;
        ctrl.submitted = 0;
        ctrl.pending = 0;
        ctrl.review = 0;
        ctrl.approved = 0;
        ctrl.isAdmin = false;

        var promises = [];
        promises.push(YearsSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(grantsSvc.getAllItems());
        promises.push(projectsSvc.getAllItems());
        promises.push(settingsSvc.checkIfCurrentUserIsAdmin());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.years = results[0];
                ctrl.programmes = results[1];
                ctrl.countries = results[2];
                ctrl.grants = results[3];
                ctrl.projects = results[4];
                ctrl.isAdmin = results[5];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
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

        ctrl.SearchReachData = function () {
            if (!ctrl.reachdata.quarter || !ctrl.reachdata.year) {
                return;
            }
            spinnerService.show('spinner1');
            reachdatasvc
                .getQuarterReportingData(ctrl.reachdata.quarter, ctrl.reachdata.programme)
                .then(function (retdat) {
                    ctrl.reachdatas = retdat;
                    ctrl.filterEmergencies = _.cloneDeep(ctrl.reachdatas);
                    ctrl.totalprojects = retdat.length;
                    ctrl.submitted = _.filter(retdat, ['submitted', 'YES']).length;
                    ctrl.pending = _.filter(retdat, ['submitted', 'NO']).length;
                    ctrl.review = _.filter(retdat, ['status', 'Pending']).length;
                    ctrl.approved = _.filter(retdat, ['status', 'Approved']).length;
                })
                .catch(function (error) {
                    growl.error(error);
                })
                .finally(function () {
                    spinnerService.closeAll();
                });
        };

        ctrl.getReachData = function (num) {
            spinnerService.show('spinner1');
            ctrl.reachdatas = ctrl.filterEmergencies;
            switch (num) {
                case 1:
                    ctrl.reachdatas = ctrl.reachdatas;
                    break;
                case 2:
                    ctrl.reachdatas = _.filter(ctrl.reachdatas, ['submitted', 'NO']);
                    break;
                case 3:
                    ctrl.reachdatas = _.filter(ctrl.reachdatas, ['submitted', 'YES']);
                    break;
                case 4:
                    ctrl.reachdatas = _.filter(ctrl.reachdatas, ['status', 'Pending']);
                    break;
                case 5:
                    ctrl.reachdatas = _.filter(ctrl.reachdatas, ['status', 'Approved']);
                    break;
                default:
                    ctrl.reachdatas = ctrl.reachdatas;
            }
            spinnerService.closeAll();
        };

        ctrl.calculateTotal = function (data) {
            var female = 0;
            var male = 0;
            var other = 0;
            var pwdfemale = 0;
            var pwdmale = 0;
            var pwdother = 0;

            female = _.isNaN(parseInt(data.female)) ? 0 : parseInt(data.female);
            male = _.isNaN(parseInt(data.male)) ? 0 : parseInt(data.male);
            other = _.isNaN(parseInt(data.other)) ? 0 : parseInt(data.other);

            pwdfemale = _.isNaN(parseInt(data.pwdfemale)) ? 0 : parseInt(data.pwdfemale);
            pwdmale = _.isNaN(parseInt(data.pwdmale)) ? 0 : parseInt(data.pwdmale);
            pwdother = _.isNaN(parseInt(data.pwdother)) ? 0 : parseInt(data.pwdother);

            data.total = female + male + other;
            data.pwdtotal = pwdfemale + pwdmale + pwdother;
        };

        ctrl.uploadExcelTemplate = function () {
            growl.info("This feature is not fully developed yet. Check it out after a few days.");
        };

        ctrl.sendUserMessage = function (projectId, projectTitle) {
            var comment = {};
            comment.year = ctrl.reachdata.year;
            comment.quarter = ctrl.reachdata.quarter;
            comment.project = { "id": projectId, "title": projectTitle };
            
            var commentDW = { scopeVariableName: 'comment', dataObject: comment };
            $dialog('app/reachdata/reachdata-db-sendmsg.html', 'lg', commentDW)
                .then(function (comment) {
                    spinnerService.show('spinner1');
                    reachdatasvc
                        .addReachDataComments(comment.quarter, comment.project, comment.comment, comment.subject)
                        .then(function (upDoc) {
                            growl.success("Message sent to the Project ME Person Successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };
    }
})();