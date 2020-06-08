(function () {
    'use strict';

    angular
        .module('projects', [])
        .controller('projectsCtrl', ProjectsCtrl);

    ProjectsCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$routeParams', '$location', 'grantsSvc', 'projectsSvc', 'countriesSvc', 'programmesSvc', 'spinnerService', 'UtilService', 'growl'];
    function ProjectsCtrl($q, $dialogConfirm, $route, $routeParams, $location, grantsSvc, projectsSvc, countriesSvc, programmesSvc, spinnerService, UtilService, growl) {
        var ctrl = this;
        ctrl.project = {};
        ctrl.hostWebUrl = projectsSvc.hostWebUrl;
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(6);
        ctrl.projId = $routeParams.id;
        ctrl.project.mereport = true;

        if (!ctrl.action == 'add') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(projectsSvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());
        promises.push(grantsSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.projects = data[0];
                ctrl.countries = data[1];
                ctrl.programmes = data[2];
                ctrl.grantcodes = data[3];
                if (ctrl.projId && ctrl.action == 'edit') {
                    ctrl.project = _.find(ctrl.projects, function (p) {
                        return p.id == ctrl.projId;
                    });
                }
            })
            .catch(function (error) {
                growl.error(error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.project.code || !ctrl.project.country.title) {
                return;
            }

            $dialogConfirm(ctrl.action == "edit" ? "Update Record?" : "Add Record?", 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    var updateProms = [];
                    if (ctrl.action == 'edit') {
                        updateProms.push(projectsSvc.UpdateItem(ctrl.project));
                    } else {
                        updateProms.push(projectsSvc.AddItem(ctrl.project));
                    }
                    $q
                        .all(updateProms)
                        .then(function (res) {
                            ctrl.projects = res[0];
                            growl.success(ctrl.action == "edit" ? "Record updated successfully!" : "Record added successfully!");
                            $location.path("/listAdminProjects");
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        });
                });
        };

        ctrl.DeleteRecord = function (id) {
            $dialogConfirm('Delete Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    projectsSvc
                        .DeleteItem(id)
                        .then(function (res) {
                            ctrl.projects = res;
                            growl.success('Record deleted successfully!');
                        })
                        .catch(function (error) {
                            growl.error(error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };

        ctrl.changeStatus = function (mereport) {
            if (mereport == true) {
                ctrl.project.mereport = false;
            } else {
                ctrl.project.mereport = true;
            }
        };
    }
})();