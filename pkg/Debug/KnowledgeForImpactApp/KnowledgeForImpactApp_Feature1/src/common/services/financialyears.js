(function () {
    'use strict';

    angular
        .module('services.years', [])
        .service('YearsSvc', FinancialYearsSvc);


    FinancialYearsSvc.$inject = ['$q', 'ShptRestService'];
    function FinancialYearsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'FinancialYears';
        var curUserId = _spPageContextInfo.userId;
        var yearsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    yearsList = [];
                    _.forEach(data.results, function (o) {
                        var year = {};
                        year.id = o.Id;
                        year.title = o.Title;
                        yearsList.push(year);
                    });
                    defer.resolve(_.orderBy(yearsList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject("An error occured while fetching the items. Contact IT Service desk for support.");
                    console.log(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (year) {
            var defer = $q.defer();
            var itemExists = _.some(yearsList, ['title', year.title]);
            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = { Title: year.title };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        year.id = response.ID;
                        yearsList.push(year);
                        defer.resolve(_.orderBy(yearsList, ['title'], ['asc']));
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
                        _.remove(yearsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(yearsList, ['title'], ['asc']));
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