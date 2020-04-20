(function () {
    'use strict';

    angular
        .module('services.projects', [])
        .service('projectsSvc', ProjectsSvc);

    ProjectsSvc.$inject = ['$q', 'ShptRestService'];
    function ProjectsSvc($q, ShptRestService) {
        var svc = this;
        var listname = 'Projects';
        var curUserId = _spPageContextInfo.userId;
        var projectsList = null;

        svc.getAllItems = function () {
            var defer = $q.defer();
            var queryParams = "$select=Id,Title,Code,GlobalProgramme/Id,GlobalProgramme/Title,Country/Id,Country/Title,MEPerson/Id,MEPerson/Title,MEReport&$expand=GlobalProgramme,Country,MEPerson";
            ShptRestService
                .getListItems(listname, queryParams)
                .then(function (data) {
                    projectsList = [];
                    _.forEach(data.results, function (o) {
                        var project = {};
                        project.id = o.Id;
                        project.title = o.Title;
                        project.code = o.Code;
                        project.programme = _.isNil(o.GlobalProgramme) ? '' : { id: o.GlobalProgramme.Id, title: o.GlobalProgramme.Title };
                        project.country = _.isNil(o.Country) ? '' : { id: o.Country.Id, title: o.Country.Title };
                        project.mereport = o.MEReport;
                        project.meperson = [];
                        if (o.MEPerson.results.length > 0) {
                            _.forEach(o.MEPerson.results, function (p) {
                                var person = {};
                                person.id = p.Id;
                                person.title = p.Title;
                                project.meperson.push(person);
                            });
                        }
                        projectsList.push(project);
                    });
                    defer.resolve(projectsList);
                })
                .catch(function (error) {
                    defer.reject(error);
                });
            return defer.promise;
        };
    }
})();