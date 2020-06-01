(function () {
    'use strict';

    angular
        .module('financialyears', [])
        .controller('financialyearsCtrl', FinancialyearsCtrl);

    FinancialyearsCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'YearsSvc', 'spinnerService', 'UtilService', 'growl'];
    function FinancialyearsCtrl($q, $dialogConfirm, $route, $location, YearsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.year = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(1);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(YearsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.years = data[0];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.year.title) {
                return;
            }
            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    YearsSvc
                        .AddItem(ctrl.year)
                        .then(function (res) {
                            ctrl.years = res;
                            growl.success('Record added successfully!');
                            $location.path("/listAdminFinancialYears");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    YearsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.years = res;
                            growl.success("Record deleted successfully!");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };
    }
})();