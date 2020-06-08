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
                    defer.resolve(_.orderBy(grantsList, ['title'], ['asc']));
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };

        svc.AddItem = function (grant) {
            var defer = $q.defer();
            var itemExists = _.some(grantsList, ['title', grant.title]);

            if (itemExists) {
                defer.reject("The item specified already exists in the system. Contact IT Service desk for support.");
            } else {

                var data = {
                    Title: grant.title,
                    Donor: grant.donor
                };

                ShptRestService
                    .createNewListItem(listname, data)
                    .then(function (response) {
                        grant.id = response.ID;
                        grantsList.push(grant);
                        defer.resolve(_.orderBy(grantsList, ['title'], ['asc']));
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
                        _.remove(grantsList, {
                            id: id
                        });
                        defer.resolve(_.orderBy(grantsList, ['title'], ['asc']));
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