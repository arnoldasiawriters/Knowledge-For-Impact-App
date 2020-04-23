(function () {
    'use strict';

    angular
        .module('quarters', [])
        .controller('quartersCtrl', QuartersCtrl);

    QuartersCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'quartersSvc', 'YearsSvc', 'spinnerService', 'UtilService'];
    function QuartersCtrl($q, $dialogConfirm, $route, $location, quartersSvc, YearsSvc, spinnerService, UtilService) {
        var ctrl = this;
        ctrl.quarter = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(2);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(quartersSvc.getAllItems());
        promises.push(YearsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.quarters = data[0];
                ctrl.years = data[1];
            })
            .catch(function (error) {
                UtilService.showErrorMessage('#notification-area', error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.quarter.title || !ctrl.quarter.year) {
                return;
            }

            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    quartersSvc
                        .AddItem(ctrl.quarter)
                        .then(function (res) {
                            ctrl.quarters = res;
                            UtilService.showSuccessMessage('#notification-area', 'Record added successfully!');
                            $location.path("/listAdminQuarters");
                        })
                        .catch(function (error) {
                            UtilService.showErrorMessage('#notification-area', error);
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
                    quartersSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.quarters = res;
                            UtilService.showSuccessMessage('#notification-area', 'Record deleted successfully!');
                        })
                        .catch(function (error) {
                            UtilService.showErrorMessage('#notification-area', error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };

    }
})();