(function () {
    'use strict';

    angular
        .module('services.grants', [])
        .service('grantsSvc', GrantsSvc);

    GrantsSvc.$inject = ['$q', 'ShptRestService'];
    function GrantsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'GrantCodes';
        var curUserId = _spPageContextInfo.userId;
        var grantsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Donor";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    grantsList = [];
                    _.forEach(data.results, function (o) {
                        var grant = {};
                        grant.id = o.Id;
                        grant.title = o.Title;
                        grant.donor = o.Donor;
                        grantsList.push(grant);
                    });
                    defer.resolve(grantsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();