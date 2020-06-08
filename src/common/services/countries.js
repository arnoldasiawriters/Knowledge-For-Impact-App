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
                    defer.resolve(_.orderBy(countriesList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (country) {
            var defer = $q.defer();
            var itemExists = _.some(countriesList, ['title', country.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: country.title
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        country.id = response.ID;
                        countriesList.push(country);
                        defer.resolve(_.orderBy(countriesList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while adding the item. Contact IT Service desk for support.");
                    });
            }
            return defer.promise;
        };

        svc.DeleteItem = function (id) {
            var defer = $q.defer();
            if (id) {
                ShptRestService
                    .deleteListItem(listname, id)
                    .then(function () {
                        _.remove(countriesList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(countriesList, ['title'], ['asc']));
                    })
                    .catch(function (error) {
                        console.log(error);
                        defer.reject("An error occured while deleting the item. Contact IT Service desk for support.");
                    });
            } else {
                defer.reject('Item to be deleted is missing Id. Contact IT Service desk for support.');
            }
            return defer.promise;
        };
    }
})();