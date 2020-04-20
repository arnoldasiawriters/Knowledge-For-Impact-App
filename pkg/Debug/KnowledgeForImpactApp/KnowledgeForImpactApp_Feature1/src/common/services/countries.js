(function () {
    'use strict';

    angular
        .module('services.countries', [])
        .service('countriesSvc', CountriesSvc);

    CountriesSvc.$inject = ['$q', 'ShptRestService'];
    function CountriesSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Countries';
        var curUserId = _spPageContextInfo.userId;
        var countriesList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    countriesList = [];
                    _.forEach(data.results, function (o) {
                        var country = {};
                        country.id = o.Id;
                        country.title = o.Title;
                        countriesList.push(country);
                    });
                    defer.resolve(countriesList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();