(function () {
    'use strict';

    angular
        .module('grants', [])
        .controller('grantsCtrl', GrantsCtrl);

    GrantsCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'grantsSvc', 'spinnerService', 'UtilService', 'growl'];
    function GrantsCtrl($q, $dialogConfirm, $route, $location, grantsSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.grant = {};
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(4);

        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(grantsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.grants = data[0];
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.grant.title) {
                return;
            }
            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    grantsSvc
                        .AddItem(ctrl.grant)
                        .then(function (res) {
                            ctrl.grants = res;
                            growl.success('Record added successfully!');
                            $location.path("/listAdminGrants");
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
                    grantsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.grants = res;
                            growl.success('Record deleted successfully!');
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