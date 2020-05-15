(function () {
    'use strict';

    angular
        .module('reachdata-plan', [])
        .controller('reachDataPlanCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', '$dialogConfirm', '$dialogAlert', 'UtilService', '$route', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'spinnerService'];
    function ReachDataCtrl($q, $dialogConfirm, $dialogAlert, UtilService, $route, reachdatasvc, YearsSvc, programmesSvc, countriesSvc, grantsSvc, projectsSvc, spinnerService) {
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.action = $route.current.$$route.param;
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;
        ctrl.reachdata = {};

        spinnerService.show('spinner1');

        if (ctrl.action == "add") {
            setTables();
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
                spinnerService.closeAll();
            })
            .catch(function (error) {
                defer.reject(error);
            });

        ctrl.submitReachDataPlan = function () {
            if (!ctrl.reachdata.year) {
                $dialogAlert("Select the financial year!", "Missing Details");
                return;
            } else if (!ctrl.reachdata.country) {
                $dialogAlert("Select the country where project is implemented!", "Missing Details");
                return;
            } else if (!ctrl.reachdata.grant) {
                $dialogAlert("Select the grant funding the project!", "Missing Details");
                return;
            }
            else if (!ctrl.reachdata.programme) {
                $dialogAlert("Select the Global Programmes & OR Initiatives in which this project belongs!", "Missing Details");
                return;
            }
            else if (!ctrl.reachdata.project) {
                $dialogAlert("Select the Project Code!", "Missing Details");
                return;
            }

            var otherDetailsFilledTR = CheckIfOthersDetailsFilled(true);
            var otherDetailsFilledNR = CheckIfOthersDetailsFilled(false);
            var anyFieldFilled = CheckIfAnyFieldsFilled();

            if (otherDetailsFilledTR && (ctrl.reachdata.othersdetailtr == "" || !ctrl.reachdata.othersdetailtr)) {
                $dialogAlert("Please provide as much detail as possible on who is included within 'other' in the quarters for total reach!", "Missing Details");
                return;
            } else if (otherDetailsFilledNR && (ctrl.reachdata.othersdetailnr == "" || !ctrl.reachdata.othersdetailnr)) {
                $dialogAlert("Please provide as much detail as possible on who is included within 'other' in the quarters for new reach!", "Missing Details");
                return;
            } else if (!anyFieldFilled) {
                $dialogAlert("You have not filled any numbers!", "Missing Details");
                return;
            }

            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    window.scrollTo(0, window.outerHeight / 2);
                    reachdatasvc
                        .addReachDataPlans(ctrl.reachdata)
                        .then(function (res) {
                            ctrl.reachdata = {};
                            setTables();
                            window.scrollTo(0, 0);
                            UtilService.showSuccessMessage('#notification-area', 'Plans for the project added Successfully!');
                        })
                        .catch(function (error) {
                            UtilService.showErrorMessage('#notification-area', error);
                        })
                        .finally(function () {
                            window.scrollTo(0, 0);
                            spinnerService.closeAll();
                        });
                });
        };

        function setTables() {
            ctrl.reachdata.tablesTotalReach = [];
            ctrl.reachdata.tablesTotalReach.push({ id: 1, quarter: "Q1", name: "Quarter 1 (April-June)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesTotalReach.push({ id: 2, quarter: "Q2", name: "Quarter 2 (July-September)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesTotalReach.push({ id: 3, quarter: "Q3", name: "Quarter 3 (October-December)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesTotalReach.push({ id: 4, quarter: "Q4", name: "Quarter 4 (January-March)", data: reachdatasvc.setTableDetails() });

            ctrl.reachdata.tablesNewReach = [];
            ctrl.reachdata.tablesNewReach.push({ id: 1, quarter: "Q1", name: "Quarter 1 (April-June)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesNewReach.push({ id: 2, quarter: "Q2", name: "Quarter 2 (July-September)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesNewReach.push({ id: 3, quarter: "Q3", name: "Quarter 3 (October-December)", data: reachdatasvc.setTableDetails() });
            ctrl.reachdata.tablesNewReach.push({ id: 4, quarter: "Q4", name: "Quarter 4 (January-March)", data: reachdatasvc.setTableDetails() });
        }

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

        function CheckIfOthersDetailsFilled(tReach) {
            var othersDetailsFilledNR = false;
            var checkinData = [];
            if (tReach) {
                checkinData = ctrl.reachdata.tablesTotalReach;
            } else {
                checkinData = ctrl.reachdata.tablesNewReach;
            }
            _.forEach(checkinData, function (rdp) {
                _.forEach(rdp.data, function (rdpdata) {
                    if ((_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 || (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                        othersDetailsFilledNR = true;
                    }
                });
            });
            return othersDetailsFilledNR;
        }

        function CheckIfAnyFieldsFilled() {
            var fieldsFilled = false;
            _.forEach(ctrl.reachdata.tablesTotalReach, function (rdp) {
                _.forEach(rdp.data, function (rdpdata) {
                    if ((_.isNaN(parseInt(rdpdata.female)) ? 0 : parseInt(rdpdata.female)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.male)) ? 0 : parseInt(rdpdata.male)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdfemale)) ? 0 : parseInt(rdpdata.pwdfemale)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdmale)) ? 0 : parseInt(rdpdata.pwdmale)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                        fieldsFilled = true;
                    }
                });
            });
            _.forEach(ctrl.reachdata.tablesNewReach, function (rdp) {
                _.forEach(rdp.data, function (rdpdata) {
                    if ((_.isNaN(parseInt(rdpdata.female)) ? 0 : parseInt(rdpdata.female)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.male)) ? 0 : parseInt(rdpdata.male)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.other)) ? 0 : parseInt(rdpdata.other)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdfemale)) ? 0 : parseInt(rdpdata.pwdfemale)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdmale)) ? 0 : parseInt(rdpdata.pwdmale)) > 0 ||
                        (_.isNaN(parseInt(rdpdata.pwdother)) ? 0 : parseInt(rdpdata.pwdother)) > 0) {
                        fieldsFilled = true;
                    }
                });
            });
            return fieldsFilled;
        }
    }
})();