function FormatJobIdName() {
    return this.job_id + " - " + this.job_name;
}

function FormatModuleJsonData() {
    return JSON.stringify(this.additional_params);
}

function FormatBestLocation() {
    return JSON.stringify(this.best_location);
}

function FormatEnergyHistory() {
    return JSON.stringify(this.energy_history);
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
                ".pure-running-time" : "task_seconds",
                ".pure-module-url" : "task_name",
                ".pure-module-json" : FormatModuleJsonData,
                ".pure-best-location" : FormatBestLocation,
                ".pure-energy-history" : FormatEnergyHistory,
                ".pure-best-energy" : "best_energy",
                ".pure-running-tasks" : "num_running_tasks",
                ".pure-completed-tasks" : "num_finished_tasks"
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