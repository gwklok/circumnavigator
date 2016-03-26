$(document).ready(function() {
    $("#create-job-btn").click(TryCreateJob);
});

function TryCreateJob(event) {
    $(event.target).prop('disabled', true).addClass("disabled");
    if(ValidateCreateJob()) {
        CreateJob(event.target);
    } else {
        $(event.target).prop('disabled', false).removeClass("disabled");
    }
}

function ValidateCreateJob() {
    var running_time = $("#running_time").val();
    var module_data = $("#module_data").val();

    if(isNaN(running_time)) {
        alert("Running time must be a number.");
        return false;
    }

    if(!isValidJson(module_data) && module_data !== "") {
        alert("Please enter valid JSON for the module data.")
        return false;
    }

    return true;
}

function isValidJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getValidJson(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
}

function CreateJob(target) {
    var data = {
        "job_name" : $("#job_name").val(),
        "job_time" : $("#running_time").val() * 60,
        "module_url" : $("#module_url").val(),
        "module_data" : getValidJson($("#module_data").val())
    };

    $.ajax({
        url: SCHEDULER_API_URL() + "job",
        type: "POST",
        dataType: "json",
        data: JSON.stringify(data)
    })
    .done(function(data, textStatus, jqXHR) {
        RESET_FAILED_ATTEMPTS();
        window.location = "/job-details.html#" + data.job_id;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        if(jqXHR.status == 422 || jqXHR.status == 500) {
            alert("Failed to create job.\r\n" + jqXHR.responseJSON.message);
        } else {
            alert("Failed to create job, will try next scheduler.\r\n" + errorThrown);
            NEXT_SCHEDULER_URL();
            CreateJob(target);
        }
    })
    .always(function() {
        $(target).prop('disabled', false).removeClass("disabled");
    });
}