(function () {
    'use strict';

    angular
        .module('dir.adminmenu', [])
        .directive('adminMenu', AdminMenuDir);

    function AdminMenuDir() {
        var ddo = {
            restrict: 'E',
            templateUrl: 'common/directives/admin-menu/admin-menu.tpl.html',
            //scope: {
            //    menuTitle: '@',
            //    menuItems: '='
            //},
            //controller: 'staffAdminMenuCtrl',
            //controllerAs: 'dirctrl',
            //bindToController: true
        };
        return ddo;
    }
})();