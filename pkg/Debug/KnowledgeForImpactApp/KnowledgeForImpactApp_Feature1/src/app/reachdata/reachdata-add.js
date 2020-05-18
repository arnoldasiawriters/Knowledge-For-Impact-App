(function () {
    'use strict';

    angular
        .module('reachdata-add', [])
        .controller('reachDataAddCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'quartersSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'spinnerService'];
    function ReachDataCtrl($q, reachdatasvc, YearsSvc, programmesSvc, quartersSvc, countriesSvc, grantsSvc, projectsSvc, spinnerService) {
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.title = "Plan Scale & Reach Data";
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;
        ctrl.reachdata = {};
        ctrl.tablesDataTR = [];
        ctrl.tablesDataNR = [];
        ctrl.tablesDataTRPlan = [];
        ctrl.tablesDataNRPlan = [];

        spinnerService.show('spinner1');

        ctrl.tablesDataTR = reachdatasvc.setTableDetails();
        ctrl.tablesDataNR = reachdatasvc.setTableDetails();

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
                spinnerService.closeAll();
            })
            .catch(function (error) {
                console.log('An Error Occured!', error);
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
                        console.log('An Error Occured!', error);
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
                $q
                    .all(planspromises)
                    .then(function (results) {
                        ctrl.tablesDataTRPlan = results[0];
                        ctrl.tablesDataNRPlan = results[1];
                        spinnerService.closeAll();
                    })
                    .catch(function (error) {
                        console.log('An Error Occured!', error);
                    });
            }
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