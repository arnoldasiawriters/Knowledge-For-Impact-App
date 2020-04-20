(function () {
    'use strict';

    angular
        .module('services.programmes', [])
        .service('programmesSvc', ProgrammesSvc);

    ProgrammesSvc.$inject = ['$q', 'ShptRestService'];
    function ProgrammesSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'GlobalProgrammes';
        var curUserId = _spPageContextInfo.userId;
        var progsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    progsList = [];
                    _.forEach(data.results, function (o) {
                        var prog = {};
                        prog.id = o.Id;
                        prog.title = o.Title;
                        progsList.push(prog);
                    });
                    defer.resolve(progsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();