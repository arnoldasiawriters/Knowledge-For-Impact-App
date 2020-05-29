(function () {
    'use strict';

    angular
        .module('settings', [])
        .controller('settingsCtrl', SettingsCtrl);

    SettingsCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'docTypesSvc', 'spinnerService', 'UtilService', 'growl'];
    function SettingsCtrl($q, $dialogConfirm, $route, $location, docTypesSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.doctype = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(7);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(docTypesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.doctypes = data[0];
            })
            .catch(function (error) {
                UtilService.showErrorMessage('#notification-area', error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.doctype.title) {
                return;
            }
            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    docTypesSvc
                        .AddItem(ctrl.doctype)
                        .then(function (res) {
                            ctrl.doctypes = res;
                            UtilService.showSuccessMessage('#notification-area', 'Record added successfully!');
                            $location.path("/listDocumentTypes");
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
                    docTypesSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.doctypes = res;
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