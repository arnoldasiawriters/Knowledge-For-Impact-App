(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'services.reachdata', 'services.years', 'services.programmes', 'services.quarters', 'services.countries', 'services.grants',
            'services.projects', 'dir.adminmenu', 'dir.backbtn', 'dir.addbtn', 'financialyears', 'reachdata'])
        .constant("IS_APP_WEB", false)
        .config(['$routeProvider', function ($routeprovider) {
            $routeprovider
                .when('/dashboard', {
                    templateUrl: 'app/reachdata/reachdata-db.tpl.html',
                    controller: 'reachDataCtrl as ctrl'
                    //param: 'dash'
                })
                .when('/addReachDatas', {
                    templateUrl: 'app/reachdata/reachdata-add.tpl.html',
                    controller: 'reachDataCtrl as ctrl',
                    //param: 'add'
                })

                /* Admin Financial Years */
                .when('/listAdminFinancialYears', {
                    templateUrl: 'app/adm-financialyears/financialyears-list.tpl.html',
                    controller: 'financialyearsCtrl as ctrl',
                })
                .when('/addAdminFinancialYears', {
                    templateUrl: 'app/adm-financialyears/financialyears-add.tpl.html',
                    controller: 'financialyearsCtrl as ctrl',
                })

                .otherwise({
                    redirectTo: '/dashboard'
                });
        }]);
})();