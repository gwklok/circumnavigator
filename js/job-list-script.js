var TableContents = "";

function Initialize() {
    TableContents = $("#pure-job-list").html();
}

function ClearJobs() {
    $("#pure-job-list").html(TableContents);
}

function RenderJobs(jobs_data) {
    var jobs_directive = {
        ".pure-job-entry" : {
            "job<-" : {
                ".pure-job-id" : "job.job_id",
                ".pure-job-name" : "job.job_name",
                ".pure-job-status" : "job.current_state",
                ".pure-job-status@class+" : StatusClass,
                ".pure-job-created-at" : FormatCreatedTime,
                ".pure-job-best-energy" : FormatBestEnergy,
                ".pure-job-progress" : ProgressFormatter,
                "@data-url" : JobDetailsLink,
                ".pure-job-progress@style+" : FormatProgressWidth,
                ".pure-job-progress@class" : FormatProgressClass
            }
        }
    };
    $("#pure-job-list").render(jobs_data, jobs_directive);
    $(".pure-job-entry").click(OnJobClick);
}

function StatusClass(a) {
    switch(a.item.current_state) {
        case "RUNNING":
            return " text-primary";
        case "PAUSED":
            return " text-info";
        case "STOP":
            return " text-warning";
        case "DONE":
            return " text-success";
        case "FAILED":
            return " text-danger";
        default:
            return "";
    };
}

function ProgressFormatter(a) {
    return (a.item.num_finished_tasks / a.item.num_total_tasks * 100).toFixed(2) + "%";
}

function JobDetailsLink(a) {
    return "/job-details.html#" + a.item.job_id;
}

function FormatBestEnergy(a) {
    if(a.item.best_energy < VERY_LARGE_NUMBER) {
        return (a.item.best_energy).toFixed(4);
    } else {
        return "No results";
    }
}

function FormatCreatedTime(a) {
    var date = new Date(a.item.job_starting_time);
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

function FormatProgressClass() {
    var value = "progress-bar pure-job-progress";
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

function FormatProgressWidth() {
    return "width:" + (this.num_finished_tasks / this.num_total_tasks * 100).toFixed(2) + "%;";
}

function OnJobClick(event) {
    var parents = $(event.target).parents();
    for (var i = parents.length - 1; i >= 0; i--) {
        if($(parents[i]).data("url")) {
            window.location = $(parents[i]).data("url");
            return;
        }
    }
}

function LoadJobs() {
    $.ajax({
        url: SCHEDULER_API_URL() + "jobs",
        type: "GET",
        dataType: "json"
    })
    .done(function(data, textStatus, jqXHR) {
        RESET_FAILED_ATTEMPTS();
        ClearJobs();
        RenderJobs(data.reverse());
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        NEXT_SCHEDULER_URL();
        sleep(100);
        LoadJobs();
    });
}

$(document).ready(function() {
    Initialize();
    LoadJobs();
    setInterval(LoadJobs, REFRESH_TIME);
});