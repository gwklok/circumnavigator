function StatusClass(a) {
    switch(a.item.status) {
        case "Error":
            return " text-danger";
        case "Completed":
            return " text-success";
        default:
            return "";
    };
}

function ProgressFormatter(a) {
    return a.item.progress + "%";
}

function JobDetailsLink(a) {
    return "/job-details.html#" + a.item.id;
}

function OnJobClick(event) {
    window.location = $(event.target).parent("tr").data("url");
}

var jobs_data = [
    {
        "id" : 1,
        "name" : "Travelling Sailor",
        "status" : "Running",
        "created_at" : "12:55 12/12/2012",
        "best_energy" : 21344.23,
        "progress" : 55.2
    },
    {
        "id" : 4,
        "name" : "Travelling Sailor",
        "status" : "Error",
        "created_at" : "12:55 12/12/2012",
        "best_energy" : 21344.23,
        "progress" : 55.2
    },
    {
        "id" : 89,
        "name" : "Travelling Sailor",
        "status" : "Completed",
        "created_at" : "12:55 12/12/2012",
        "best_energy" : 21344.23,
        "progress" : 55.2
    },
    {
        "id" : 1028,
        "name" : "Travelling Sailor",
        "status" : "Error",
        "created_at" : "12:55 12/12/2012",
        "best_energy" : 21344.23,
        "progress" : 55.2
    }
];

var jobs_directive = {
    ".pure-job-entry" : {
        "job<-" : {
            ".pure-job-id" : "job.id",
            ".pure-job-name" : "job.name",
            ".pure-job-status" : "job.status",
            ".pure-job-status@class+" : StatusClass,
            ".pure-job-created-at" : "job.created_at",
            ".pure-job-best-energy" : "job.best_energy",
            ".pure-job-progress" : ProgressFormatter,
            "@data-url" : JobDetailsLink
        }
    }
};

$(document).ready(function() {
    $(".pure-job-list").render(jobs_data, jobs_directive);
    $(".pure-job-entry").click(OnJobClick);
});