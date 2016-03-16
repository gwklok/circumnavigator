function FormatJobIdName() {
    return this.job_id + " - " + this.job_name;
}

function FormatModuleJsonData() {
    return JSON.stringify(this.additional_params);
}

function FormatBestLocation() {
    if(this.best_location) {
        return JSON.stringify(JSON.parse(this.best_location));
    }
    return "{}";
}

function FormatEnergyHistory() {
    return JSON.stringify(this.energy_history);
}

function FormatProgress() {
    return (this.num_finished_tasks / this.num_total_tasks * 100).toFixed(2) + "%";
}

function FormatProgressWidth() {
    return "width:" + (this.num_finished_tasks / this.num_total_tasks * 100).toFixed(2) + "%;";
}

function FormatStatusClass() {
    var value = "pure-job-status";
    switch(this.current_state) {
        case "INITIALIZED":
            value += " text-info";
            break;
        case "RUNNING":
            value += " text-primary";
            break;
        case "PAUSED":
            value += " text-muted";
            break;
        case "STOPPED":
            value += " text-warning";
            break;
        case "DONE":
            value += " text-success";
            break;
        case "FAILED":
            value += " text-danger";
            break;
    };
    return value;
}

function FormatProgressClass() {
    var value = "progress-bar pure-progress";
    if((this.num_finished_tasks / this.num_total_tasks * 100) < 100) {
        value += " progress-bar-striped active";
    }
    switch(this.current_state) {
        case "INITIALIZED":
            value += " progress-bar-info";
            break;
        case "RUNNING":
            value += " progress-bar-primary";
            break;
        case "PAUSED":
            value += " progress-bar-muted";
            break;
        case "STOPPED":
            value += " progress-bar-warning";
            break;
        case "DONE":
            value += " progress-bar-success";
            break;
        case "FAILED":
            value += " progress-bar-danger";
            break;
    };
    return value;
}

function LoadJob() {
    var job_id = parseInt(window.location.hash.substring(1),10);
    if(!isNaN(job_id)) {
        $.ajax({
            url: SCHEDULER_API_URL + "job/" + job_id,
            type: "GET",
            dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
            var job_directive = {
                ".pure-job-id-name" : FormatJobIdName,
                ".pure-job-status" : "current_state",
                ".pure-job-status@class" : FormatStatusClass,
                ".pure-running-time" : "task_seconds",
                ".pure-module-url" : "task_name",
                ".pure-module-json" : FormatModuleJsonData,
                ".pure-best-location" : FormatBestLocation,
                ".pure-energy-history" : FormatEnergyHistory,
                ".pure-best-energy" : "best_energy",
                ".pure-running-tasks" : "num_running_tasks",
                ".pure-completed-tasks" : "num_finished_tasks",
                ".pure-progress" : FormatProgress,
                ".pure-progress@style+" : FormatProgressWidth,
                ".pure-progress@class" : FormatProgressClass
            };
            $("body").render(data, job_directive);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert("Error loading job ID(" + job_id + "): " + errorThrown)
        });
    } else {
        alert("Invalid job ID: " + job_id);
    }
}

$(document).ready(function() {
    LoadJob();
    setInterval(LoadJob, REFRESH_TIME);
});