(function () {
    'use strict';

    angular
        .module('services.reachdata', [])
        .service('reachdatasvc', ReachDataSvc);

    ReachDataSvc.$inject = ['$q', 'ShptRestService'];
    function ReachDataSvc($q, ShptRestService) {
        var svc = this;
        svc.hostWebUrl = ShptRestService.hostWebUrl;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var data = [];

            for (var i = 1; i < 10; i++) {
                var reachdata = {};
                reachdata.financialyear = "2019-2020"
                reachdata.quarter = "Quarter 4"
                reachdata.programme = "Inclusive Education – Education System Strengthening";
                reachdata.project = "Project Name "+ i;
                reachdata.country = "Kenya";
                reachdata.meperson = "Arnold Shangala";
                reachdata.status = "No";
                data.push(reachdata);
            }

            defer.resolve(data);
            return defer.promise;
        };
    }
})();