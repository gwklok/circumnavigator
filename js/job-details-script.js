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

function FormatBestEnergy() {
    if(this.best_energy < VERY_LARGE_NUMBER) {
        return (this.best_energy).toFixed(4);
    } else {
        return "No results";
    }
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
        case "RUNNING":
            value += " text-primary";
            break;
        case "PAUSED":
            value += " text-info";
            break;
        case "STOP":
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

function FormatCreatedTime() {
    var date = new Date(this.job_starting_time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var mins = date.getMinutes();
    var secs = date.getSeconds();

    if(month < 10) month = "0" + month;
    if(day < 10) day = "0" + day;
    if(mins < 10) mins = "0" + mins;
    if(secs < 10) secs = "0" + secs;

    return year + "-" + month + "-" + day + " " + hour + ":" + mins + ":" + secs;
}

function FormatRunningTime() {
    return (this.task_seconds / 60).toFixed(0);
}

function FormatProgressClass() {
    var value = "progress-bar pure-progress";
    var incomplete = "";
    if((this.num_finished_tasks / this.num_total_tasks * 100) < 100) {
        incomplete = " progress-bar-striped";
    }
    switch(this.current_state) {
        case "RUNNING":
            value += incomplete + " active";
            break;
        case "PAUSED":
            value += " progress-bar-info" + incomplete;
            break;
        case "STOP":
            value += " progress-bar-warning" + incomplete;
            break;
        case "DONE":
            value += " progress-bar-success";
            break;
        case "FAILED":
            value += " progress-bar-danger" + incomplete;
            break;
    };
    return value;
}

function SetButtonStates(status) {
    switch(status) {
        case "RUNNING":
            // User can pause or stop job
            $("#left-action-btn").show();
            $("#right-action-btn").show();
            $("#left-action-btn").html("Pause");
            $("#left-action-btn").attr("class", "btn btn-block btn-info");
            $("#left-action-btn").click(PauseJobClick);
            $("#right-action-btn").click(StopJobClick);
            break;
        case "PAUSED":
            // User can resume or stop job
            $("#left-action-btn").show();
            $("#right-action-btn").show();
            $("#left-action-btn").html("Resume");
            $("#left-action-btn").attr("class", "btn btn-block btn-primary");
            $("#left-action-btn").click(ResumeJobClick);
            $("#right-action-btn").click(StopJobClick);
            break;
        default:
        case "INITIALIZED":
        case "STOP":
        case "DONE":
        case "FAILED":
            // User cannot do anything
            $("#left-action-btn").hide();
            $("#right-action-btn").hide();
            break;
    };
}

function LoadJob() {
    JobID = parseInt(window.location.hash.substring(1),10);
    if(!isNaN(JobID)) {
        $.ajax({
            url: SCHEDULER_API_URL() + "job/" + JobID,
            type: "GET",
            dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
            RESET_FAILED_ATTEMPTS();
            var job_directive = {
                ".pure-job-id-name" : FormatJobIdName,
                ".pure-job-status" : "current_state",
                ".pure-job-status@class" : FormatStatusClass,
                ".pure-running-time" : FormatRunningTime,
                ".pure-created-time" : FormatCreatedTime,
                ".pure-module-url" : "task_name",
                ".pure-module-json" : FormatModuleJsonData,
                ".pure-best-location" : FormatBestLocation,
                ".pure-energy-history" : FormatEnergyHistory,
                ".pure-best-energy" : FormatBestEnergy,
                ".pure-completed-tasks" : "num_finished_tasks",
                ".pure-progress" : FormatProgress,
                ".pure-progress@style+" : FormatProgressWidth,
                ".pure-progress@class" : FormatProgressClass
            };
            $("body").render(data, job_directive);
            SetButtonStates(data.current_state);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            jobStatus = "FAILED";
            NEXT_SCHEDULER_URL();
            sleep(100);
            LoadJob();
        });
    } else {
        alert("Invalid job ID: " + JobID);
    }
}

function PauseJobClick(event) {
    $(event.target).prop('disabled', true).addClass("disabled");
    UpdateJobState("pause", event.target);
}

function ResumeJobClick(event) {
    $(event.target).prop('disabled', true).addClass("disabled");
    UpdateJobState("resume", event.target);
}

function StopJobClick(event) {
    $(event.target).prop('disabled', true).addClass("disabled");
    UpdateJobState("stop", event.target);
}

function UpdateJobState(state, target) {
    var data = {
        "status" : state
    };

    $.ajax({
        url: SCHEDULER_API_URL() + "job/" + JobID + "/status",
        type: "PUT",
        dataType: "json",
        data: JSON.stringify(data)
    })
    .done(function(data, textStatus, jqXHR) {
        RESET_FAILED_ATTEMPTS();
        $(target).prop('disabled', false).removeClass("disabled");
        LoadJob();
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        NEXT_SCHEDULER_URL();
        sleep(100);
        UpdateJobState(state, target);
    });
}

var jobID = -1;

$(document).ready(function() {
    LoadJob();
    setInterval(LoadJob, REFRESH_TIME);
    $("#left-action-btn").click(PauseJobClick);
    $("#right-action-btn").click(StopJobClick);
});