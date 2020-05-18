(function () {
    'use strict';

    angular
        .module('reachdata', [])
        .controller('reachDataCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', '$location', '$routeParams', '$route', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'quartersSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'spinnerService'];
    function ReachDataCtrl($q, $location, $routeParams, $route, reachdatasvc, YearsSvc, programmesSvc, quartersSvc, countriesSvc, grantsSvc, projectsSvc, spinnerService) {
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.title = "Plan Scale & Reach Data";
        ctrl.action = $route.current.$$route.param;
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;
        ctrl.reachdata = {};
        ctrl.reachdatas = [];
        ctrl.filterEmergencies = [];
        ctrl.tablesDataTR = [];
        ctrl.tablesDataNR = [];
        ctrl.totalprojects = 0;
        ctrl.submitted = 0;
        ctrl.pending = 0;
        ctrl.review = 0;
        ctrl.approved = 0;

        spinnerService.show('spinner1');

        if (ctrl.action == "add") {            
            ctrl.tablesDataTR.push(reachdatasvc.setTableDetails());
            ctrl.tablesDataNR.push(reachdatasvc.setTableDetails());
        }

        var promises = [];
        promises.push(YearsSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(grantsSvc.getAllItems());
        promises.push(projectsSvc.getAllItems());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.years = results[0];
                ctrl.programmes = results[1];
                ctrl.countries = results[2];
                ctrl.grants = results[3];
                ctrl.projects = results[4];

                //ctrl.reachdata.year = _.find(ctrl.years, ['title', '2019-2020']);
                //ctrl.SelectQuarter();               

                spinnerService.closeAll();
            })
            .catch(function (error) {
                defer.reject(error);
            });

        ctrl.SelectQuarter = function () {
            ctrl.quarters = [];
            if (ctrl.reachdata.year) {
                spinnerService.show('spinner1');
                quartersSvc
                    .getAllItemsYear(ctrl.reachdata.year)
                    .then(function (res) {
                        ctrl.quarters = res;
                        //ctrl.reachdata.quarter = _.find(ctrl.quarters, ['abbr', 'Q1']);
                        //ctrl.SearchReachData();
                    })
                    .catch(function (error) {
                        console.log('An Error Occured!', error);
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
                    console.log('An Error Occured!', error);
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

        //ctrl.SetActiveQuarter = function () {
        //    var curData = [];
        //    if (ctrl.reachdata.quarter.abbr == "Q1") {
        //        curData = ctrl.tablesData[0];
        //    } else if (ctrl.reachdata.quarter.abbr == "Q2") {
        //        curData = ctrl.tablesData[1];
        //    } else if (ctrl.reachdata.quarter.abbr == "Q3") {
        //        curData = ctrl.tablesData[2];
        //    } else if (ctrl.reachdata.quarter.abbr == "Q4") {
        //        curData = ctrl.tablesData[3];
        //    }

        //    _.forEach(ctrl.tablesData, function (tdata) {
        //        _.forEach(tdata.data, function (td) {
        //            td.disabled = true;
        //        });
        //    });

        //    _.forEach(curData.data, function (td) {
        //        td.disabled = false;
        //    });
        //};

        ctrl.addRecord = function () {

        };
    }
})();