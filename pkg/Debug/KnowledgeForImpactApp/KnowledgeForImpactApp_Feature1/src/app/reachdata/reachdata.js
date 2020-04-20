(function () {
    'use strict';

    angular
        .module('reachdata', [])
        .controller('reachDataCtrl', ReachDataCtrl);

    ReachDataCtrl.$inject = ['$q', '$location', '$routeParams', '$route', 'reachdatasvc', 'YearsSvc', 'programmesSvc', 'quartersSvc', 'countriesSvc', 'grantsSvc', 'projectsSvc', 'spinnerService'];
    function ReachDataCtrl($q, $location, $routeParams, $route, reachdatasvc, YearsSvc, programmesSvc, quartersSvc, countriesSvc, grantsSvc, projectsSvc, spinnerService) {
        var ctrl = this;
        ctrl.userid = _spPageContextInfo.userId;
        ctrl.title = "Add Scale & Reach Data";
        ctrl.action = $route.current.$$route.param;
        ctrl.hostWebUrl = reachdatasvc.hostWebUrl;

        ctrl.submitted = 0;
        ctrl.pending = 0;
        ctrl.review = 0;
        ctrl.approved = 0;

        spinnerService.show('spinner1');

        var promises = [];
        promises.push(YearsSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());
        promises.push(reachdatasvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(grantsSvc.getAllItems());
        promises.push(projectsSvc.getAllItems());
        $q
            .all(promises)
            .then(function (results) {
                ctrl.financialyears = results[0];
                ctrl.programmes = results[1];
                ctrl.reachdatas = results[2];
                ctrl.countries = results[3];
                ctrl.grants = results[4];
                ctrl.projects = results[5];
                spinnerService.closeAll();
            })
            .catch(function (error) {
                defer.reject(error);
            });

        ctrl.SelectQuarter = function () {
            ctrl.quarters = [];
            if (ctrl.reachdata.financialyear) {
                quartersSvc
                    .getAllItemsYear(ctrl.reachdata.financialyear.title)
                    .then(function (res) {
                        ctrl.quarters = res;
                    })
                    .catch(function (error) {
                        console.log('An Error Occured!', error);
                    });
            }
        };
    }
})();