(function () {
    'use strict';

    angular
        .module('dir.tbl-headers', [])
        .directive('tblHeader', TblHeaderDir);

    function TblHeaderDir() {
        var ddo = {
            restrict: 'A',
            templateUrl: 'common/directives/reach-tbl-headers/tbl-header.tpl.html',
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