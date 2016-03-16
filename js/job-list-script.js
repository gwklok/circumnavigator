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
                ".pure-job-created-at" : "job.created_at",
                ".pure-job-best-energy" : "job.best_energy",
                ".pure-job-progress" : ProgressFormatter,
                "@data-url" : JobDetailsLink
            }
        }
    };
    $("#pure-job-list").render(jobs_data, jobs_directive);
    $(".pure-job-entry").click(OnJobClick);
}

function StatusClass(a) {
    switch(a.item.current_state) {
        case "INITIALIZED":
            return " text-info";
        case "RUNNING":
            return " text-primary";
        case "PAUSED":
            return " text-muted";
        case "STOPPED":
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

function OnJobClick(event) {
    window.location = $(event.target).parent("tr").data("url");
}

function LoadJobs() {
    $.ajax({
        url: SCHEDULER_API_URL + "jobs",
        type: "GET",
        dataType: "json"
    })
    .done(function(data, textStatus, jqXHR) {
        ClearJobs();
        RenderJobs(data);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        alert("Error loading jobs: " + errorThrown)
    });
}

$(document).ready(function() {
    Initialize();
    LoadJobs();
    setInterval(LoadJobs, REFRESH_TIME);
});