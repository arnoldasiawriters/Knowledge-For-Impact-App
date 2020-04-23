﻿(function () {
    'use strict';

    angular
        .module('programmes', [])
        .controller('programmesCtrl', ProgrammesCtrl);

    ProgrammesCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'programmesSvc', 'spinnerService', 'UtilService'];
    function ProgrammesCtrl($q, $dialogConfirm, $route, $location, programmesSvc, spinnerService, UtilService) {
        var ctrl = this;
        ctrl.programme = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(5);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(programmesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.programmes = data[0];
            })
            .catch(function (error) {
                UtilService.showErrorMessage('#notification-area', error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.programme.title) {
                return;
            }
            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    programmesSvc
                        .AddItem(ctrl.programme)
                        .then(function (res) {
                            ctrl.programmes = res;
                            UtilService.showSuccessMessage('#notification-area', 'Record added successfully!');
                            $location.path("/listAdminProgrammes");
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
                    programmesSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.programmes = res;
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