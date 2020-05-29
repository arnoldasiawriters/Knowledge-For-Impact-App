(function () {
    'use strict';

    angular
        .module('app', ['ngRoute', 'ngAnimate', 'directives.dirPagination', 'ui.bootstrap', 'ui.bootstrap.dialogs', 'selectFile', 'services.utilities', 'spNgModule', 'sarsha.spinner',
            'services.reachdata', 'services.years', 'services.programmes', 'services.doctypes', 'services.quarters', 'services.countries', 'services.grants', 'angular-growl',
            'services.projects', 'dir.adminmenu', 'dir.backbtn', 'dir.addbtn', 'dir.tbl-headers', 'dir.tbl-headers-cols', 'financialyears', 'countries', 'grants',
            'programmes', 'doctypes', 'projects', 'quarters', 'reachdata-add', 'reachdata-plan', 'reachdata', 'sp-peoplepicker'])
        .constant("IS_APP_WEB", false)
        .config(['growlProvider', GrowlProvider])
        .config(['$routeProvider', RouteProvider]);

    RouteProvider.$inject = ['$routeprovider'];
    function RouteProvider($routeprovider) {
        $routeprovider
            .when('/dashboard', {
                templateUrl: 'app/reachdata/reachdata-db.tpl.html',
                controller: 'reachDataCtrl as ctrl',
                param: 'list'
            })
            .when('/addReachDatas', {
                templateUrl: 'app/reachdata/reachdata-add.tpl.html',
                controller: 'reachDataAddCtrl as ctrl',
                param: 'add'
            })
            .when('/planReachDatas', {
                templateUrl: 'app/reachdata/reachdata-plan.tpl.html',
                controller: 'reachDataPlanCtrl as ctrl',
                param: 'add'
            })
            .when('/listReachData/:id', {
                templateUrl: 'app/reachdata/reachdata-db.tpl.html',
                controller: 'reachDataCtrl as ctrl',
                param: 'list'
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
            /* Admin Document types */
            .when('/listAdminDocTypes', {
                templateUrl: 'app/adm-doctypes/doctypes-list.tpl.html',
                controller: 'docTypesCtrl as ctrl',
                param: 'list'
            })
            .when('/addAdminDocTypes', {
                templateUrl: 'app/adm-doctypes/doctypes-add.tpl.html',
                controller: 'docTypesCtrl as ctrl'
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
                controller: 'projectsCtrl as ctrl',
                param: 'add'
            })
            .when('/editAdminProject/:id', {
                templateUrl: 'app/adm-projects/projects-add.tpl.html',
                controller: 'projectsCtrl as ctrl',
                param: 'edit'
            })
            .otherwise({
                redirectTo: '/dashboard'
            });
    }

    GrowlProvider.$inject = ['growlProvider'];
    function GrowlProvider(growlProvider) {
        growlProvider.globalTimeToLive({ success: -1, error: -1, warning: 8000, info: 8000 });
        //growlProvider.globalTimeToLive(-1);
        growlProvider.globalDisableCountDown(true);
    }
})();