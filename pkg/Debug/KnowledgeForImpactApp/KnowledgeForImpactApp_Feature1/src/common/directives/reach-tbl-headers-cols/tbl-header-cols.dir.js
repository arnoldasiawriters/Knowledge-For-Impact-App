(function () {
    'use strict';

    angular
        .module('dir.tbl-headers-cols', [])
        .directive('tblHeaderCols', TblHeaderDir);

    function TblHeaderDir() {
        var ddo = {
            restrict: 'A',
            templateUrl: 'common/directives/reach-tbl-headers-cols/tbl-header-cols.tpl.html',
            replace: true
            //scope: {
            //    title: '@',
            //    link: '@'
            //}
            //controller: 'staffAdminMenuCtrl',
            //controllerAs: 'dirctrl',
            //bindToController: true
        };
        return ddo;
    }
})();