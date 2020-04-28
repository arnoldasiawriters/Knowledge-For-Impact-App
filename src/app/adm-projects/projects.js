(function () {
    'use strict';

    angular
        .module('projects', [])
        .controller('projectsCtrl', ProjectsCtrl);

    ProjectsCtrl.$inject = ['$q', '$dialogConfirm', '$route', '$location', 'projectsSvc', 'countriesSvc', 'programmesSvc', 'spinnerService', 'UtilService'];
    function ProjectsCtrl($q, $dialogConfirm, $route, $location, projectsSvc, countriesSvc, programmesSvc, spinnerService, UtilService) {
        var ctrl = this;
        ctrl.project = {};
        ctrl.hostWebUrl = projectsSvc.hostWebUrl;
        ctrl.action = $route.current.$$route.param;
        ctrl.links = UtilService.getAppShortcutlinks(6);
        
        if (ctrl.action == 'list') {
            spinnerService.show('spinner1');
        }

        var promises = [];
        promises.push(projectsSvc.getAllItems());
        promises.push(countriesSvc.getAllItems());
        promises.push(programmesSvc.getAllItems());

        $q
            .all(promises)
            .then(function (data) {
                ctrl.projects = data[0];
                ctrl.countries = data[1];
                ctrl.programmes = data[2];
            })
            .catch(function (error) {
                UtilService.showErrorMessage('#notification-area', error);
            })
            .finally(function () {
                spinnerService.closeAll();
            });

        ctrl.AddRecord = function () {
            if (!ctrl.project.code || !ctrl.project.country.title) {
                return;
            }

            $dialogConfirm('Add Record?', 'Confirm Transaction')
                .then(function () {
                    spinnerService.show('spinner1');
                    projectsSvc
                        .AddItem(ctrl.project)
                        .then(function (res) {
                            ctrl.projects = res;
                            UtilService.showSuccessMessage('#notification-area', 'Record added successfully!');
                            $location.path("/listAdminProjects");
                        })
                        .catch(function (error) {
                            UtilService.showErrorMessage('#notification-area', error);
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
                            UtilService.showSuccessMessage('#notification-area', 'Record deleted successfully!');
                        })
                        .catch(function (error) {
                            UtilService.showErrorMessage('#notification-area', error);
                        })
                        .finally(function () {
                            spinnerService.closeAll();
                        })
                });
        };
    }
})();