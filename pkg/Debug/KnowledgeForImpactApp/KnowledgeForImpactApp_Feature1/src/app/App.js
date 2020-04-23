(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'services.reachdata', 'services.years', 'services.programmes', 'services.quarters', 'services.countries', 'services.grants',
            'services.projects', 'dir.adminmenu', 'dir.backbtn', 'dir.addbtn', 'financialyears', 'countries', 'grants', 'programmes',
            'projects', 'quarters', 'reachdata', 'sp-peoplepicker'])
        .constant("IS_APP_WEB", false)
        .config(['$routeProvider', function ($routeprovider) {
            $routeprovider
                .when('/dashboard', {
                    templateUrl: 'app/reachdata/reachdata-db.tpl.html',
                    controller: 'reachDataCtrl as ctrl',
                    param: 'list'
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
                    param: 'list'
                })
                .when('/addAdminFinancialYears', {
                    templateUrl: 'app/adm-financialyears/financialyears-add.tpl.html',
                    controller: 'financialyearsCtrl as ctrl'
                })
                /* Admin Grants */
                .when('/listAdminGrants', {
                    templateUrl: 'app/adm-grants/grants-list.tpl.html',
                    controller: 'grantsCtrl as ctrl',
                    param: 'list'
                })
                .when('/addAdminGrants', {
                    templateUrl: 'app/adm-grants/grants-add.tpl.html',
                    controller: 'grantsCtrl as ctrl'
                })
                /* Admin Programmes */
                .when('/listAdminProgrammes', {
                    templateUrl: 'app/adm-programmes/programmes-list.tpl.html',
                    controller: 'programmesCtrl as ctrl',
                    param: 'list'
                })
                .when('/addAdminProgrammes', {
                    templateUrl: 'app/adm-programmes/programmes-add.tpl.html',
                    controller: 'programmesCtrl as ctrl'
                })
                /* Admin Countries */
                .when('/listAdminCountries', {
                    templateUrl: 'app/adm-countries/countries-list.tpl.html',
                    controller: 'countriesCtrl as ctrl',
                    param: 'list'
                })
                .when('/addAdminCountries', {
                    templateUrl: 'app/adm-countries/countries-add.tpl.html',
                    controller: 'countriesCtrl as ctrl'
                })
                /* Admin Quarters */
                .when('/listAdminQuarters', {
                    templateUrl: 'app/adm-quarters/quarters-list.tpl.html',
                    controller: 'quartersCtrl as ctrl',
                    param: 'list'
                })
                .when('/addAdminQuarters', {
                    templateUrl: 'app/adm-quarters/quarters-add.tpl.html',
                    controller: 'quartersCtrl as ctrl'
                })
                /* Admin Projects */
                .when('/listAdminProjects', {
                    templateUrl: 'app/adm-projects/projects-list.tpl.html',
                    controller: 'projectsCtrl as ctrl',
                    param: 'list'
                })
                .when('/addAdminProjects', {
                    templateUrl: 'app/adm-projects/projects-add.tpl.html',
                    controller: 'projectsCtrl as ctrl'
                })
                .otherwise({
                    redirectTo: '/dashboard'
                });
        }]);
})();