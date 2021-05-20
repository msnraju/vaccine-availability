function getAvailability() {
  try {
    if (document.getElementById("pinCode").value == "") {
      return;
    }

    if (document.getElementById("date").value == "") {
      document.getElementById("date").value = moment().format("YYYY-MM-DD");
    }

    var dateText = document.getElementById("date").value;
    fetchAppointments(
      "first3days",
      moment(dateText).format("DD-MM-YYYY"),
      true
    );
    fetchAppointments(
      "next3days",
      moment(dateText).add("days", 3).format("DD-MM-YYYY"),
      false
    );
  } catch (err) {
    console.log(err);
  }
}

function fetchAppointments(section, date, showMessage) {
  var url =
    "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=201301&date=" +
    date;

  fetch(url)
    .then((response) => response.json())
    .then((data) => applyFilters(data))
    .then((data) => renderCentersHtml(section, data, showMessage));
}

function renderCentersHtml(name, data, showMessage) {
  var mute = $("#mute").is(":checked");

  if (data.centers.length > 0 && !mute) {
    document.getElementById("audio-notification").play();
  }

  var html = "";

  data.centers.forEach((center) => {
    html += "<div class='center'>";
    html += "<div class='center-info'>";
    html += "<div class='name'>" + center.name + "</div>";
    html +=
      "<div class='address'>" +
      center.address +
      ", " +
      center.block_name +
      "</div>";
    html += "</div>";

    html += "<div class='sessions'>";

    center.sessions.forEach((session) => {
      html +=
        "<a target='_blank' class='session' href='https://selfregistration.cowin.gov.in'>";
      html += "<div class='vaccine'>" + session.vaccine + "</div>";
      html += "<div class='date'>" + session.date + "</div>";
      html +=
        "<div class='min_age_limit'>Age Limit: " +
        session.min_age_limit +
        "</div>";
      html +=
        "<div class='available_capacity'><label>Capacity: </label> " +
        session.available_capacity +
        "</div>";
      html +=
        "<div class='available_capacity_dose1'><label>Dose 1: </label>" +
        session.available_capacity_dose1 +
        "</div>";
      html +=
        "<div class='available_capacity_dose1'><label>Dose 2: </label>" +
        session.available_capacity_dose2 +
        "</div>";
      html += "</a>";
    });

    html += "</div>";
    html += "</div>";
  });

  if (html == "" && showMessage) {
    html =
      "<h2 class='message'>No slots available @ " +
      moment().format("hh:mm a") +
      "</h2>";
  }

  document.getElementById(name).innerHTML = html;
}

function applyFilters(data) {
  var age45 = $("#age45").is(":checked");
  var age18 = $("#age18").is(":checked");
  var dose1 = $("#dose1").is(":checked");
  var dose2 = $("#dose2").is(":checked");
  var vaccine = $("#vaccine").val() + "";
  var minQty = Number($("#minQty").val());

  var centers = [];
  data.centers.forEach((center) => {
    var sessions = [];
    center.sessions.forEach((session) => {
      var valid = true;
      if (dose1 && session.available_capacity_dose1 < minQty) {
        valid = false;
      }
      if (dose2 && session.available_capacity_dose2 < minQty) {
        valid = false;
      }

      if (vaccine && session.vaccine.toLowerCase() != vaccine.toLowerCase()) {
        valid = false;
      }

      if (
        valid &&
        ((age18 && session.min_age_limit == 18) ||
          (age45 && session.min_age_limit == 45))
      ) {
        sessions.push(session);
      }
    });

    if (sessions.length > 0) {
      centers.push({ ...center, sessions: sessions });
    }
  });

  return { centers: centers };
}

$(() => {
  getAvailability();
  setInterval(getAvailability, 5000);

  $("#age45").on("change", getAvailability);
  $("#age18").on("change", getAvailability);
  $("#pinCode").on("change", getAvailability);
  $("#date").on("change", getAvailability);
  $("#dose1").on("change", getAvailability);
  $("#dose2").on("change", getAvailability);
  $("#vaccine").on("change", getAvailability);
  $("#minQty").on("change", getAvailability);
});
