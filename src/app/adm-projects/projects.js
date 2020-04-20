(function () {
    'use strict';

    angular
        .module('projects', [])
        .controller('projectsCtrl', ProjectsCtrl);

    ProjectsCtrl.$inject = [];
    function ProjectsCtrl() {
        var ctrl = this;
    }
})();